import CategoryPage from '@/components/CategoryPage';
import { SEO } from '@/components/SEO';
import { fetchBlogsByHashtag } from '@/api/blogService';
import { Metadata } from 'next';

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const hashtag = resolvedParams.slug;
    const title = `#${hashtag} - Trending Blogs - Page ${currentPage} | Radiorogue`;
    const description = `Explore the latest blogs tagged with #${hashtag} on Radiorogue.`;

    return {
        title,
        description,
        metadataBase: new URL('https://radiorogue.com'),
        alternates: {
            canonical: `https://radiorogue.com/hashtag/${hashtag}?page=${currentPage}`,
        },
        openGraph: {
            title,
            description,
            url: `https://radiorogue.com/hashtag/${hashtag}?page=${currentPage}`,
            type: 'website',
            images: [
                {
                    url: 'https://radiorogue.com/images/logo.png',
                    width: 1200,
                    height: 630,
                    alt: `#${hashtag} Blogs on Radiorogue`,
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

const HashtagPage = async ({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }) => {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const hashtag = `${resolvedParams.slug}`;
    const blogs = await fetchBlogsByHashtag(hashtag, currentPage, 20);  // Fetch blogs by hashtag

    const hasMore = blogs.length === 20;

    // Breadcrumbs data
    const breadcrumbs = [
        { name: 'Home', url: 'https://radiorogue.com/' },
        { name: `#${resolvedParams.slug}`, url: `https://radiorogue.com/hashtag/${resolvedParams.slug}` },
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
                category={`search`}  // Pass the hashtag as category
                pageTitle={`${resolvedParams.slug}`}  // Page title shows the hashtag
                blogs={blogs}
                newsItems={[]}  // No news component for hashtag pages
                currentPage={currentPage}
                hasMore={hasMore}
                showHashtags={true}  // Pass this to conditionally show the HashtagsComponent
            />
        </>
    );
};

export default HashtagPage;
