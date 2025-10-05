// src/app/rogues-pick/page.tsx
import CategoryPage from '@/components/CategoryPage';
import { SEO } from '@/components/SEO';
import { fetchBlogsByCategory, fetchRoguesNews } from '@/api/blogService';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const title = `Rogue's Pick - Curated Blogs - Page ${currentPage} | Radiorogue`;
    const description = `Discover handpicked articles and top stories in Rogue's Pick on Radiorogue.`;

    return {
        title,
        description,
        metadataBase: new URL('https://radiorogue.com'),
        alternates: {
            canonical: `https://radiorogue.com/rogues-pick?page=${currentPage}`,
        },
        openGraph: {
            title,
            description,
            url: `https://radiorogue.com/rogues-pick?page=${currentPage}`,
            type: 'website',
            images: [
                {
                    url: 'https://radiorogue.com/images/logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'Rogue\'s Pick Blogs on Radiorogue',
                },
            ],
            siteName: 'Radiorogue'
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images: ['https://radiorogue.com/images/logo.png'],
        },
    };
}

const RoguesPickPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const blogs = await fetchBlogsByCategory('rogues-pick', currentPage, 20);  // Fetch Rogue's Pick blogs
    const newsItems = await fetchRoguesNews();  // Fetch Rogue's news
    const hasMore = blogs.length === 20;

    // Breadcrumbs data
    const breadcrumbs = [
        { name: 'Home', url: 'https://radiorogue.com/' },
        { name: "Rogue's Pick", url: 'https://radiorogue.com/rogues-pick' },
    ];

    return (
        <>
            {/* Inject SEO JSON-LD */}
            <SEO
                breadcrumbs={breadcrumbs}
                blogs={blogs}
            />

            {/* Render the CategoryPage */}
            <CategoryPage
                category="rogues-pick"
                pageTitle="/Rogue's Pick"
                blogs={blogs}
                newsItems={newsItems}
                currentPage={currentPage}
                hasMore={hasMore}
            />
        </>
    );
};

export default RoguesPickPage;
