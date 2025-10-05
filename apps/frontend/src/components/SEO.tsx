import React from 'react';

interface SEOProps {
    breadcrumbs: { name: string; url: string }[];
    blogs: { heading: string; slug: string; createdAt: string; image?: string; author: string; authorUrl?: string }[];
}

export const SEO = ({ breadcrumbs, blogs }: SEOProps) => {
    // JSON-LD Structured Data for Blogs
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Radiorogue",  // Updated to Radiorogue
        "publisher": {
            "@type": "Organization",
            "name": "Radiorogue",
            "logo": {
                "@type": "ImageObject",
                "url": "https://radiorogue.com/images/logo.png", // Include the logo here for brand recognition
            },
            "url": "https://radiorogue.com",
        },
        "blogPosts": blogs.map((blog) => ({
            "@type": "BlogPosting",
            "headline": blog.heading,
            "url": `https://radiorogue.com/${blog.slug}`,  // Ensure the URL is absolute
            "datePublished": blog.createdAt,
            "image": 'https://radiorogue.com/images/logo.png', // Default image if missing
            "author": {
                "@type": "Person",
                "name": blog.author,
                "url": blog.authorUrl || "https://www.radiorogue.com/", // Default author URL
            },
        })),
    };

    // JSON-LD Structured Data for Breadcrumbs
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url,
        })),
    };

    return (
        <>
            {/* Inject JSON-LD structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
        </>
    );
};
