const Blog = require('../models/blog.model');
const natural = require('natural');

// NLP scoring (readability, sentiment, etc.)
const calculateNLPScore = (content) => {
    // Example: A score combining sentiment and other factors like readability
    const sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const sentimentScore = sentimentAnalyzer.getSentiment(content.split(' '));

    const readabilityScore = 100; // Placeholder for readability score logic
    return sentimentScore + readabilityScore; // Combine sentiment and readability scores
};

// Get the featured post (based on NLP score) and mark it as featured
const getFeaturedPost = async () => {
    try {
        // Get yesterday's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight today
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Midnight yesterday

        // Find all blogs from yesterday
        const blogs = await Blog.find({
            createdAt: { $gte: yesterday, $lt: today } // Blogs created yesterday
        });

        let featuredBlog = await Blog.findOne({ featured: true }); // Default to the currently featured blog
        let highestScore = -Infinity;

        if (blogs.length > 0) {
            blogs.forEach((blog) => {
                const score = calculateNLPScore(blog.content);
                if (score > highestScore) {
                    highestScore = score;
                    featuredBlog = blog; // Select the blog with the highest score
                }
            });

            if (featuredBlog && !featuredBlog.featured) {
                // Only update if the new blog is different from the current featured one
                await Blog.updateMany({ featured: true }, { featured: false }); // Unmark previous featured blogs
                featuredBlog.featured = true;
                await featuredBlog.save(); // Mark the new blog as featured
            }
        }

        return featuredBlog; // Always return the featured blog, new or current
    } catch (error) {
        console.error('Error getting featured post:', error);
        return await Blog.findOne({ featured: true }); // In case of error, return the current featured blog
    }
};

module.exports = { getFeaturedPost, calculateNLPScore };
