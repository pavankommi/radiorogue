// src/app/tech-pulse/page.tsx
import CategoryPage from '@/components/CategoryPage';
import { SEO } from '@/components/SEO';
import { fetchBlogsByCategory, fetchSavedTechNews } from '@/api/blogService';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const title = `Tech Pulse - Latest Tech Trends - Page ${currentPage} | Radiorogue`;
    const description = `Stay updated with the latest technology trends and innovations on Radiorogue's Tech Pulse.`;

    return {
        title,
        description,
        metadataBase: new URL('https://radiorogue.com'),
        alternates: {
            canonical: `https://radiorogue.com/tech-pulse?page=${currentPage}`,
        },
        openGraph: {
            title,
            description,
            url: `https://radiorogue.com/tech-pulse?page=${currentPage}`,
            type: 'website',
            images: [
                {
                    url: 'https://radiorogue.com/images/logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'Tech Pulse Blogs on Radiorogue',
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

const TechPulsePage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const blogs = await fetchBlogsByCategory('tech-pulse', currentPage, 20);  // Fetch tech blogs
    const newsItems = await fetchSavedTechNews();  // Fetch tech news
    const hasMore = blogs.length === 20;

    // Breadcrumbs data
    const breadcrumbs = [
        { name: 'Home', url: 'https://radiorogue.com/' },
        { name: 'Tech Pulse', url: 'https://radiorogue.com/tech-pulse' },
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
                category="tech-pulse"
                pageTitle="/Tech Pulse"
                blogs={blogs}
                newsItems={newsItems}
                currentPage={currentPage}
                hasMore={hasMore}
            />
        </>
    );
};

export default TechPulsePage;
