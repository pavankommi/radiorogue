import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = 'https://radiorogue.com';

    // List of static pages
    const staticPages = [
        `${baseUrl}/`,
        `${baseUrl}/whats-hot`,
        `${baseUrl}/rogues-pick`,
        `${baseUrl}/tech-pulse`,
        `${baseUrl}/money-moves`,
        `${baseUrl}/sport`,
    ];

    // Generate XML content for static pages
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${staticPages.map(url => `<url><loc>${url}</loc></url>`).join('')}
        </urlset>`;

    return new NextResponse(sitemapContent, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}