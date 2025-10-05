// src/app/sport/page.tsx
import CategoryPage from '@/components/CategoryPage';
import { SEO } from '@/components/SEO';
import { fetchBlogsByCategory, fetchSportsNews } from '@/api/blogService';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const title = `Sport - Latest Updates - Page ${currentPage} | Radiorogue`;
    const description = `Stay updated with the latest sports blogs, match highlights, and athlete news on Radiorogue.`;

    return {
        title,
        description,
        metadataBase: new URL('https://radiorogue.com'),
        alternates: {
            canonical: `https://radiorogue.com/sport?page=${currentPage}`,
        },
        openGraph: {
            title,
            description,
            url: `https://radiorogue.com/sport?page=${currentPage}`,
            type: 'website',
            images: [
                {
                    url: 'https://radiorogue.com/images/logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'Sport on Radiorogue',
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

const SportPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const blogs = await fetchBlogsByCategory('sport', currentPage, 20);  // Fetch sports blogs
    const newsItems = await fetchSportsNews();  // Fetch sports news
    const hasMore = blogs.length === 20;

    // Breadcrumbs data
    const breadcrumbs = [
        { name: 'Home', url: 'https://radiorogue.com/' },
        { name: 'Sport', url: 'https://radiorogue.com/sport' },
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
                category="sport"
                pageTitle="/Sport"
                blogs={blogs}
                newsItems={newsItems}
                currentPage={currentPage}
                hasMore={hasMore}
            />
        </>
    );
};

export default SportPage;
