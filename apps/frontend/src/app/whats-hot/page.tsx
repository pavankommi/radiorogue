// src/app/whats-hot/page.tsx
import CategoryPage from '@/components/CategoryPage';
import { SEO } from '@/components/SEO';
import { fetchBlogsByCategory, fetchGNewsHeadlines } from '@/api/blogService';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const title = `What's Hot - Trending Topics - Page ${currentPage} | Radiorogue`;
    const description = `Explore the latest trending topics and top stories on Radiorogue's What's Hot.`;

    return {
        title,
        description,
        metadataBase: new URL('https://radiorogue.com'),
        alternates: {
            canonical: `https://radiorogue.com/whats-hot?page=${currentPage}`,
        },
        openGraph: {
            title,
            description,
            url: `https://radiorogue.com/whats-hot?page=${currentPage}`,
            type: 'website',
            images: [
                {
                    url: 'https://radiorogue.com/images/logo.png',
                    width: 1200,
                    height: 630,
                    alt: "What's Hot on Radiorogue",
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

const WhatsHotPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const blogs = await fetchBlogsByCategory('whats-hot', currentPage, 20);  // Fetch blogs
    const newsItems = await fetchGNewsHeadlines();  // Fetch news
    const hasMore = blogs.length === 20;

    // Breadcrumbs data
    const breadcrumbs = [
        { name: 'Home', url: 'https://radiorogue.com/' },
        { name: "What's Hot", url: 'https://radiorogue.com/whats-hot' },
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
                category="whats-hot"
                pageTitle="/What's Hot"
                blogs={blogs}
                newsItems={newsItems}
                currentPage={currentPage}
                hasMore={hasMore}
            />
        </>
    );
};

export default WhatsHotPage;
