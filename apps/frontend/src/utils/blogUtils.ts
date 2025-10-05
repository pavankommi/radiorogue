import { fetchBlogBySlug } from '@/api/blogService';
import type { Metadata, ResolvingMetadata } from 'next';

export async function fetchBlogData(category: string, slug: string): Promise<{ blog: any; jsonLd: any } | null> {
    const blog = await fetchBlogBySlug(category, slug);

    if (!blog) {
        return null; // Blog not found
    }

    // Use a default image if the blog image is missing
    const blogImage = blog.image || 'https://radiorogue.com/images/logo.png';

    // Generate breadcrumb JSON-LD
    const breadcrumb = {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": category, // Change based on category if needed
                "item": `https://www.radiorogue.com/${category}`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": blog.heading,
                "item": `https://www.radiorogue.com/${category}/${blog.slug}`
            }
        ]
    };

    // JSON-LD structure with image, author URL, and breadcrumbs
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.heading,
        "image": blogImage,  // Add image field
        "author": {
            "@type": "Person",
            "name": blog.articleAuthor,
            "url": "https://www.radiorogue.com" // Add author URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "Radiorogue",
            "logo": {
                "@type": "ImageObject",
                "url": "https://radiorogue.com/images/logo.png"
            }
        },
        "datePublished": blog.createdAt,
        "description": blog.metaDescription,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.radiorogue.com/${category}/${blog.slug}`
        },
        // Ensure categories is defined and is an array before using join
        "articleSection": Array.isArray(blog.categories) ? blog.categories.join(', ') : '',
        "keywords": Array.isArray(blog.hashtags)
            ? blog.hashtags.map((hashtag: string) => hashtag.replace('#', '')).join(', ') // Remove # and join
            : '',
        "breadcrumb": breadcrumb  // Include breadcrumb in JSON-LD
    };

    return { blog, jsonLd };
}

export async function generateBlogMetadata(
    category: string,
    slug: string,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const blog = await fetchBlogBySlug(category, slug);

    if (!blog) {
        return {
            title: 'Blog not found - Radiorogue',
            description: 'No blog found on this page.',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const blogImage = blog.image || 'https://radiorogue.com/images/logo.png';  // Use blog image or default

    return {
        title: `${blog.heading} - Radiorogue`,
        description: blog.metaDescription || 'Read the latest blog on Radiorogue.',
        metadataBase: new URL('https://radiorogue.com'),
        openGraph: {
            title: blog.heading,
            description: blog.metaDescription,
            url: `https://www.radiorogue.com/${category}/${blog.slug}`,
            type: 'article',
            images: [blogImage, ...previousImages],
            siteName: 'Radiorogue',
        },
        twitter: {
            card: 'summary',
            title: `${blog.heading} - Radiorogue`,
            description: blog.metaDescription,
            images: [blogImage],  // Corrected to 'images', expects an array of images
            site: '@fknradiorogue',
        },
        alternates: {
            canonical: `https://www.radiorogue.com/${category}/${blog.slug}`,
        },
        robots: {
            index: true,
            follow: true,
        }
    };
}
