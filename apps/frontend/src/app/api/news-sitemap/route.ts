import { fetchPaginatedBlogs } from '../../../api/blogService';
import { NextResponse } from 'next/server';

// Utility function to escape XML special characters
function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (char) => {
        switch (char) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case '"':
                return '&quot;';
            case "'":
                return '&apos;';
            default:
                return char;
        }
    });
}

export async function GET() {
    const baseUrl = 'https://radiorogue.com';
    const blogsLimit = 1000;

    // Fetch the most recent 1000 blogs
    const blogs = await fetchPaginatedBlogs(0, blogsLimit);

    // Filter blogs to only include those updated in the last 48 hours
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const recentBlogs = blogs.filter((blog) => {
        const blogUpdatedAt = new Date(blog.updatedAt);
        return blogUpdatedAt >= twoDaysAgo;
    });

    // If no recent blogs, return a 204 (No Content) response
    if (recentBlogs.length === 0) {
        return new NextResponse(null, {
            status: 204, // No content
        });
    }

    // Generate URLs for each recent blog post with news-specific tags
    const blogUrls = recentBlogs.map((blog) => {
        const updatedAt = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : null;
        const lastmodTag = updatedAt ? `<lastmod>${updatedAt}</lastmod>` : '';

        // Escape title and URL
        const escapedTitle = escapeXml(blog.heading);
        const escapedUrl = escapeXml(`${baseUrl}/${blog.category}/${blog.slug}`);

        return `
            <url>
                <loc>${escapedUrl}</loc>
                ${lastmodTag}
                <news:news>
                    <news:publication>
                        <news:name>Radiorogue</news:name>
                        <news:language>en</news:language>
                    </news:publication>
                    <news:publication_date>${updatedAt}</news:publication_date>
                    <news:title>${escapedTitle}</news:title>
                </news:news>
            </url>
        `;
    });

    // Build the news sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
            ${blogUrls.join('')}
        </urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 'public, max-age=3600', // Allow caching for 1 hour
        },
    });
}
