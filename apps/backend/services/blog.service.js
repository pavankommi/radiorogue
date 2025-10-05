const mongoose = require('mongoose');
const Blog = require('../models/blog.model');
const NodeCache = require('node-cache');
const natural = require('natural');
const cache = new NodeCache(); // Initialize cache
const { TfIdf } = natural; // Import TfIdf from natural

// Cosine similarity helper
const cosineSimilarity = (vectorA, vectorB) => {
    const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value * value, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value * value, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};

const allowedCategories = ['rogues-pick', 'whats-hot', 'tech-pulse', 'money-moves', 'sport'];

// Create a new blog post
const createBlog = async (blogData) => {
    try {
        const blog = new Blog(blogData);
        return await blog.save();
    } catch (error) {
        throw new Error('Error creating blog: ' + error.message);
    }
};

// Retrieve all blog posts
const getAllBlogs = async () => {
    try {
        return await Blog.find();
    } catch (error) {
        throw new Error('Error retrieving blogs: ' + error.message);
    }
};

// Retrieve a single blog post by slug
const getBlogBySlug = async (slug) => {
    try {
        return await Blog.findOne({ slug })
            .select('-image -shortSummary') // Exclude 'image' and 'shortSummary'
            .exec();
    } catch (error) {
        throw new Error('Error fetching blog by slug: ' + error.message);
    }
};

// Update an existing blog post
const updateBlog = async (slug, updateData) => {
    try {
        const blog = await Blog.findOne({ slug });
        if (!blog) throw new Error('Blog not found');
        return await Blog.findOneAndUpdate({ slug }, updateData, { new: true });
    } catch (error) {
        throw new Error('Error updating blog: ' + error.message);
    }
};

// Delete a blog post
const deleteBlog = async (slug) => {
    try {
        const blog = await Blog.findOne({ slug });
        if (!blog) throw new Error('Blog not found');
        return await Blog.findOneAndDelete({ slug });
    } catch (error) {
        throw new Error('Error deleting blog: ' + error.message);
    }
};

// Function to update views for a given blog slug
const updateViews = async (slug) => {
    try {
        // Try to find and update the blog views by slug
        const blog = await Blog.findOneAndUpdate(
            { slug }, // No deleted field check because it's already deleted from the database
            { $inc: { views: 1 } },           // Increment views
            { new: true }                     // Return the updated document
        );

        // If the blog is not found, return null
        if (!blog) {
            return null;
        }

        return blog;
    } catch (error) {
        // Catch any errors and re-throw with a descriptive message
        throw new Error('Error updating views: ' + error.message);
    }
};

// Middleware to increment views
const incrementViewsMiddleware = async (req, res, next) => {
    try {
        const blog = await updateViews(req.params.slug);

        // If the blog was not found, return 410 Gone
        if (!blog) {
            return res.status(410).json({ error: 'This blog post has been permanently deleted' });
        }

        // If the blog exists and views were updated, proceed to the next handler
        next();
    } catch (error) {
        // Return a 500 error if something goes wrong
        return res.status(500).json({ error: `Error updating views: ${error.message}` });
    }
};


// Update blog status (draft or published)
const updateBlogStatus = async (slug, status) => {
    try {
        const blog = await Blog.findOne({ slug });
        if (!blog) throw new Error('Blog not found');
        if (!['draft', 'published'].includes(status)) throw new Error('Invalid status');
        blog.status = status;
        return await blog.save();
    } catch (error) {
        throw new Error('Error updating blog status: ' + error.message);
    }
};

// Filter blogs by category
const filterByCategory = async (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;

    if (!category || !allowedCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        const skip = (page - 1) * limit;
        const blogs = await Blog.find({ categories: { $in: [category] } })
            .select('-content') // Exclude content for list display
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalBlogs = await Blog.countDocuments({ categories: { $in: [category] } });

        const response = {
            blogs,
            currentPage: page,
            totalPages: Math.ceil(totalBlogs / limit),
            totalBlogs,
        };

        return res.json(response);
    } catch (error) {
        console.error('Error retrieving blogs by category:', error.message);
        return res.status(500).json({ error: 'Server error retrieving blogs by category' });
    }
};

const searchBlogs = async (query = '', page = 1, limit = 10) => {
    try {
        const skip = (Number(page) - 1) * Number(limit); // Ensure page and limit are numbers
        const words = query.split(' ').filter(word => word.trim() !== ''); // Split query into words
        const regexQuery = words.join('|'); // Combine words into regex pattern

        const blogs = await Blog.aggregate([
            {
                $match: {
                    $or: [
                        { heading: query }, // Exact match for heading
                        { shortSummary: query }, // Exact match for shortSummary
                        { heading: { $regex: regexQuery, $options: 'i' } }, // Partial match for heading
                        { shortSummary: { $regex: regexQuery, $options: 'i' } }, // Partial match for shortSummary
                    ],
                },
            },
            {
                $addFields: {
                    matchCount: {
                        $add: [
                            {
                                $size: {
                                    $filter: {
                                        input: words,
                                        as: 'word',
                                        cond: { $regexMatch: { input: '$heading', regex: '$$word', options: 'i' } },
                                    },
                                },
                            },
                            {
                                $size: {
                                    $filter: {
                                        input: words,
                                        as: 'word',
                                        cond: { $regexMatch: { input: '$shortSummary', regex: '$$word', options: 'i' } },
                                    },
                                },
                            },
                        ],
                    },
                    exactMatch: {
                        $cond: {
                            if: { $or: [{ $eq: ['$heading', query] }, { $eq: ['$shortSummary', query] }] },
                            then: 1,
                            else: 0,
                        },
                    },
                },
            },
            { $sort: { exactMatch: -1, matchCount: -1, createdAt: -1 } }, // Sort by exact match, match count, and createdAt
            { $skip: skip }, // Skip for pagination
            { $limit: Number(limit) }, // Ensure limit is a number
        ]);

        const totalResults = await Blog.countDocuments({
            $or: [
                { heading: query },
                { shortSummary: query },
                { heading: { $regex: regexQuery, $options: 'i' } },
                { shortSummary: { $regex: regexQuery, $options: 'i' } },
            ],
        });

        return {
            blogs,
            totalResults,
            currentPage: Number(page),
            totalPages: Math.ceil(totalResults / Number(limit)),
        };
    } catch (error) {
        throw new Error(`Error searching blogs: ${error.message}`);
    }
};


let pMap;

// Dynamically import p-map for compatibility
(async () => {
    pMap = await import('p-map');
})();

const findRelatedBlogs = async (slug) => {
    try {
        // Fetch the current blog with its embedding
        const currentBlog = await Blog.findOne({ slug }).select('embedding heading shortSummary categories createdAt');
        if (!currentBlog || !currentBlog.embedding || currentBlog.embedding.length === 0) {
            throw new Error('Blog not found or embedding missing');
        }

        console.log(`Fetching related blogs for slug: ${slug}`);

        // Step 1: Use aggregation to filter and project necessary fields
        const filteredBlogs = await Blog.aggregate([
            {
                $match: {
                    categories: { $in: currentBlog.categories }, // Match categories
                    slug: { $ne: slug }, // Exclude current blog
                    embedding: { $exists: true, $not: { $size: 0 } }, // Ensure embedding exists
                },
            },
            {
                $project: {
                    slug: 1,
                    heading: 1,
                    shortSummary: 1,
                    embedding: 1,
                    categories: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } }, // Sort by recent blogs
            { $limit: 50 }, // Limit to 100 for efficiency
        ]);

        console.log(`Comparing against ${filteredBlogs.length} filtered blogs...`);

        // Step 2: Calculate cosine similarity in parallel using pMap
        const similarityScores = await pMap.default(
            filteredBlogs,
            async (blog) => {
                const similarity = cosineSimilarity(currentBlog.embedding, blog.embedding);
                return {
                    blog: {
                        slug: blog.slug,
                        heading: blog.heading,
                        shortSummary: blog.shortSummary,
                        categories: blog.categories,
                        createdAt: blog.createdAt,
                    },
                    similarityScore: similarity,
                };
            },
            { concurrency: 2 } // Adjust concurrency based on server capacity
        );

        // Step 3: Sort by similarity score and return top 10
        similarityScores.sort((a, b) => b.similarityScore - a.similarityScore);

        const topBlogs = similarityScores.slice(0, 10);

        console.log(`Found ${topBlogs.length} related blogs for slug: ${slug}`);
        return topBlogs;
    } catch (error) {
        console.error('Error finding related blogs:', error.message);
        throw new Error('Error finding related blogs: ' + error.message);
    }
};

const getMostRepeatedHashtags = async (limit = 10) => {
    try {
        // Calculate the date for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await Blog.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }  // Only include blogs created in the last 7 days
                }
            },
            { $unwind: '$hashtags' },  // Unwind the hashtags array
            {
                $group: {
                    _id: '$hashtags',   // Group by each hashtag
                    count: { $sum: 1 }, // Count the occurrences of each hashtag
                },
            },
            { $sort: { count: -1 } },   // Sort by count in descending order
            { $limit: limit }           // Limit the number of results
        ]);

        return result;
    } catch (error) {
        throw new Error('Error fetching most repeated hashtags: ' + error.message);
    }
};

const getBlogsByHashtag = async (hashtag, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        const blogs = await Blog.find({ hashtags: hashtag }) // Find blogs with the specified hashtag
            .select('-content') // Exclude 'content' field
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip) // Skip the documents for pagination
            .limit(limit) // Limit the number of results
            .lean(); // Make the result JSON-like objects instead of Mongoose documents

        const totalBlogs = await Blog.countDocuments({ hashtags: hashtag }); // Count total blogs with the hashtag

        return {
            blogs,
            currentPage: page,
            totalPages: Math.ceil(totalBlogs / limit),
            totalBlogs,
        };
    } catch (error) {
        throw new Error('Error fetching blogs by hashtag: ' + error.message);
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    incrementViewsMiddleware,
    updateBlogStatus,
    filterByCategory,
    searchBlogs,
    findRelatedBlogs, // New function exported
    getMostRepeatedHashtags,
    getBlogsByHashtag,
};
