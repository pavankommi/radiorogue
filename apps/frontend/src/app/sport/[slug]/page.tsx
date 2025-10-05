import BlogDetail from '@/components/BlogDetail';
import { fetchBlogData, generateBlogMetadata } from '@/utils/blogUtils';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

interface BlogDetailPageProps {
    params: Promise<{ slug: string }>;
}

const currentPage = "/Sport";
const category = 'sport';

export async function generateMetadata(
    { params }: BlogDetailPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = (await params);
    return await generateBlogMetadata(category, slug, parent);
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
    const { slug } = (await params);

    try {
        const blogData = await fetchBlogData(category, slug);
        if (!blogData || !blogData.blog) throw new Error("Blog not found");

        const { blog, jsonLd } = blogData;
        const articleSection = Array.isArray(blog.categories) ? blog.categories.join(', ') : '';

        return (
            <section>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            ...jsonLd,
                            articleSection: articleSection || "General",
                        }),
                    }}
                />
                <BlogDetail blog={blog} currentPage={currentPage} />
            </section>
        );
    } catch (error) {
        console.error("Error fetching blog:", error);
        notFound();
    }
};

export default BlogDetailPage;
