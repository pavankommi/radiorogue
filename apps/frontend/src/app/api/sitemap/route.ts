import { fetchBlogCount } from '../../../api/blogService';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://radiorogue.com';
  const blogsPerPage = 500;

  // Fetch total blog-category URLs count
  const totalCount = await fetchBlogCount();
  const totalPages = Math.ceil(totalCount / blogsPerPage);

  // URL for general sitemap containing static pages
  const generalSitemapUrl = `${baseUrl}/general-sitemap.xml`;

  // Generate sitemap index entries for paginated blog sitemaps
  const sitemapEntries = Array.from({ length: totalPages }, (_, index) => `
        <sitemap>
            <loc>${baseUrl}/sitemaps/${index + 1}</loc>
        </sitemap>
    `);

  // Sitemap index combining general sitemap and paginated blog sitemaps
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <sitemap><loc>${generalSitemapUrl}</loc></sitemap>
            ${sitemapEntries.join('')}
        </sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}