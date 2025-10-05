// next.config.mjs

export default {
    async rewrites() {
        return [
            {
                source: '/robots.txt',
                destination: '/api/robots.txt',
            },
            {
                source: '/sitemap',
                destination: '/api/sitemap',
            },
            {
                source: '/news-sitemap',
                destination: '/api/news-sitemap',
            },
            {
                source: '/general-sitemap',
                destination: '/api/general-sitemap',
            },
            {
                // Dynamic rewrite for sitemaps
                source: '/sitemaps/:page',
                destination: '/api/sitemaps/:page',
            },
        ];
    },
};
