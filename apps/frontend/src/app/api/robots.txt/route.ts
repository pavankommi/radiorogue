import { fetchBlogCount } from '../../../api/blogService';
import { NextResponse } from 'next/server';

export async function GET() {
    console.log('Dynamic robots.txt endpoint hit'); // Debug log
    const baseUrl = 'https://radiorogue.com';
    const blogsPerPage = 500;

    // Fetch total blog-category URLs count
    const totalCount = await fetchBlogCount();
    const totalPages = Math.ceil(totalCount / blogsPerPage);

    console.log(`Total Blogs Count: ${totalCount}`); // Debug log

    // Generate dynamic sitemap URLs for all pages
    const dynamicSitemaps = Array.from({ length: totalPages }, (_, i) =>
        `Sitemap: ${baseUrl}/sitemaps/${i + 1}`
    ).join('\n');

    // Robots.txt content
    const robotsTxt = `
User-agent: *
Disallow: /private/
Disallow: /admin/
Allow: /

# Static Sitemaps
Sitemap: ${baseUrl}/sitemap
Sitemap: ${baseUrl}/news-sitemap

# Dynamic Sitemaps
${dynamicSitemaps}
`.trim(); // Trim unnecessary whitespace

    return new NextResponse(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
