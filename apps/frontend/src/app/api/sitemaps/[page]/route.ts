import { fetchPaginatedBlogs } from '../../../../api/blogService';
import { NextResponse } from 'next/server';

export async function GET(_: any, { params }: { params: Promise<{ page: string }> }) {
    const baseUrl = 'https://radiorogue.com';
    const resolvedParams = await params;
    const page = parseInt(resolvedParams.page, 10) || 1;
    const blogsPerPage = 500;
    const skip = (page - 1) * blogsPerPage;

    // Fetch paginated blogs
    const blogs = await fetchPaginatedBlogs(skip, blogsPerPage);

    // Generate sitemap entries
    const blogUrls = blogs.map((blog) => {
        const lastmod = blog.createdAt
            ? new Date(blog.createdAt).toISOString()
            : new Date().toISOString();
        return `
            <url>
                <loc>${baseUrl}/${blog.category}/${blog.slug}</loc>
                <lastmod>${lastmod}</lastmod>
            </url>
        `;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${blogUrls.join('')}
        </urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
