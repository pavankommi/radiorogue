// next-sitemap.config.js

module.exports = {
    siteUrl: 'https://radiorogue.com', // Replace with your actual domain in production
    generateRobotsTxt: false,  // Generates a robots.txt file automatically
    exclude: [],  // Add any pages you don't want included in the sitemap
    robotsTxtOptions: {
        additionalSitemaps: [
            'https://radiorogue.com/sitemap',  // Points to your dynamic sitemap
            'https://radiorogue.com/news-sitemap'
        ],
    },
};
