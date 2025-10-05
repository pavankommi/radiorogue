// src/app/money-moves/page.tsx
import CategoryPage from '@/components/CategoryPage';
import { SEO } from '@/components/SEO';
import { fetchBlogsByCategory, fetchMoneyNews } from '@/api/blogService';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const title = `Money Moves - Financial Insights - Page ${currentPage} | Radiorogue`;
    const description = `Explore the latest financial insights, investment trends, and money management tips on Radiorogue's Money Moves.`;

    return {
        title,
        description,
        metadataBase: new URL('https://radiorogue.com'),
        alternates: {
            canonical: `https://radiorogue.com/money-moves?page=${currentPage}`,
        },
        openGraph: {
            title,
            description,
            url: `https://radiorogue.com/money-moves?page=${currentPage}`,
            type: 'website',
            images: [
                {
                    url: 'https://radiorogue.com/images/logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'Money Moves on Radiorogue',
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

const MoneyMovesPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const blogs = await fetchBlogsByCategory('money-moves', currentPage, 20);  // Fetch blogs on the server
    const newsItems = await fetchMoneyNews();  // Fetch news items on the server
    const hasMore = blogs.length === 20;

    // Breadcrumbs data
    const breadcrumbs = [
        { name: 'Home', url: 'https://radiorogue.com/' },
        { name: 'Money Moves', url: 'https://radiorogue.com/money-moves' },
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
                category="money-moves"
                pageTitle="/Money Moves"
                blogs={blogs}
                newsItems={newsItems}
                currentPage={currentPage}
                hasMore={hasMore}
            />
        </>
    );
};

export default MoneyMovesPage;
