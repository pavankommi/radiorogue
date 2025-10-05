const express = require('express');
const router = express.Router();
const { subDays } = require('date-fns');
const requestIp = require('request-ip');

const {
    getBlogBySlug,
    filterByCategory,
    searchBlogs,
    incrementViewsMiddleware,
    findRelatedBlogs,
    getMostRepeatedHashtags,
    getBlogsByHashtag,
} = require('../services/blog.service');

const {
    generateDailyBlogs,
    generateRealTimeBlogs,
} = require('../services/blogGeneration.service');

const Blog = require('../models/blog.model');
const { getFeaturedPost } = require('../services/featuredPost.service');

const allowedCategories = ['rogues-pick', 'whats-hot', 'tech-pulse', 'money-moves', 'sport', 'search'];

// Public routes
router.get('/', filterByCategory);

// Fetch all blogs
router.get('/all-blogs', async (req, res) => {
    const skip = parseInt(req.query.skip, 10) || 0; // Default: 0
    const limit = parseInt(req.query.limit, 10) || 500; // Default: 500

    try {
        const blogs = await Blog.aggregate([
            { $unwind: '$categories' }, // Flatten categories
            {
                $project: {
                    slug: 1,
                    category: '$categories',
                    createdAt: 1,
                    heading: 1,
                },
            },
            { $sort: { createdAt: 1 } },
            { $skip: skip }, // Pagination: Skip documents
            { $limit: limit }, // Pagination: Limit documents
        ]);

        return res.status(200).json(blogs);
    } catch (error) {
        console.error('Failed to fetch blogs:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch blogs created in the last 48 hours
router.get('/recent-blogs', async (req, res) => {
    const skip = parseInt(req.query.skip, 10) || 0; // Default: 0
    const limit = parseInt(req.query.limit, 10) || 500; // Default: 500

    // Get the current date and 48 hours ago
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    try {
        const blogs = await Blog.find({
            createdAt: { $gte: twoDaysAgo }  // Filter for recent blogs
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });  // Sort by createdAt, ascending

        return res.status(200).json(blogs);
    } catch (error) {
        console.error('Failed to fetch recent blogs:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/blogs-count', async (req, res) => {
    try {
        // Use aggregation to count the total number of URLs
        const result = await Blog.aggregate([
            { $unwind: '$categories' }, // Flatten categories
            { $group: { _id: null, total: { $sum: 1 } } }, // Count the total URLs
        ]);

        const totalUrls = result[0]?.total || 0; // Get the count from the aggregation result

        return res.status(200).json({ count: totalUrls });
    } catch (error) {
        console.error('Failed to count blogs:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



// Search blogs
router.get('/search', async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;
    try {
        const results = await searchBlogs(query, page, limit);
        return res.json(results);
    } catch (error) {
        console.error('Error searching blogs:', error.message);
        return res.status(500).json({ error: 'Error searching blogs' });
    }
});

// Fetch top blogs
router.get('/top-blogs', async (req, res) => {
    try {
        // Calculate the date 10 days ago from today
        const tenDaysAgo = subDays(new Date(), 10);

        // Fetch the top blogs created in the last 10 days sorted by views
        const topBlogs = await Blog.find({ createdAt: { $gte: tenDaysAgo } })
            .select('heading shortSummary slug views categories createdAt')
            .sort({ views: -1 })
            .limit(10);
        return res.status(200).json(topBlogs);
    } catch (error) {
        console.error('Failed to fetch top blogs:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch related blogs
router.get('/related-blogs/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const relatedBlogs = await findRelatedBlogs(slug);
        return res.status(200).json(relatedBlogs);
    } catch (error) {
        console.error('Error finding related blogs:', error.message);
        return res.status(500).json({ error: 'Error finding related blogs' });
    }
});

// Add a comment to a blog
router.post('/:slug/comments', async (req, res) => {
    const { slug } = req.params;
    const { content, visitorId } = req.body;

    // Character limit constants
    const MAX_COMMENT_LENGTH = 500;

    if (!content || !visitorId) {
        return res.status(400).json({ error: 'Content and visitor ID are required.' });
    }

    // Check if comment exceeds character limit
    if (content.length > MAX_COMMENT_LENGTH) {
        return res.status(400).json({ error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.` });
    }

    try {
        const blog = await Blog.findOne({ slug });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        // Ensure comments field is initialized
        blog.comments = blog.comments || [];

        // Check if comment limit is reached
        if (blog.comments.length >= 50) {
            return res.status(403).json({ error: 'Comment limit reached for this blog.' });
        }

        // Add the comment
        blog.comments.push({
            content,
            userId: visitorId,
            createdAt: new Date(),
        });

        await blog.save();
        return res.status(201).json({ message: 'Comment added successfully.' });
    } catch (error) {
        console.error('Error adding comment:', error.message);
        return res.status(500).json({ error: 'Error adding comment.' });
    }
});

// Fetch comments for a blog
router.get('/:slug/comments', async (req, res) => {
    const { slug } = req.params;

    try {
        const blog = await Blog.findOne({ slug }).select('comments');
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        // Sort comments by `createdAt` in descending order (most recent first)
        const sortedComments = (blog.comments || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(sortedComments);
    } catch (error) {
        console.error('Error fetching comments:', error.message);
        return res.status(500).json({ error: 'Error fetching comments.' });
    }
});

// Dynamic category and slug route
router.get('/:category/:slug', incrementViewsMiddleware, async (req, res) => {
    const { category, slug } = req.params;

    // Validate category
    if (category !== 'search' && !allowedCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        // Check if the blog exists
        const blog = await getBlogBySlug(slug);

        // If the blog does not exist, return 410 Gone
        if (!blog) {
            return res.status(410).json({ error: 'This blog post has been permanently deleted' });
        }

        // Ensure blog belongs to the specified category
        if (category !== 'search' && !blog.categories.includes(category)) {
            return res.status(404).json({ error: `Blog not found in ${category}` });
        }

        // Return the blog if found and category matches
        return res.json(blog);

    } catch (error) {
        console.error('Error fetching blog:', error.message);
        return res.status(500).json({ error: 'Error fetching blog' });
    }
});


// Blog creation
router.post('/create', async (req, res) => {
    try {
        const blog = new Blog(req.body);
        const savedBlog = await blog.save();
        return res.status(201).json(savedBlog);
    } catch (error) {
        console.error('Error creating blog:', error.message);
        return res.status(500).json({ error: 'Error creating blog' });
    }
});

// Generate blogs from daily trends
router.get('/generate-blogs-from-daily-trends', async (req, res) => {
    try {
        const blogs = await generateDailyBlogs();
        return res.status(201).json(blogs);
    } catch (error) {
        console.error('Failed to generate blogs:', error.message);
        return res.status(500).json({ error: 'Failed to generate blogs' });
    }
});

router.get('/generate-blogs-from-realtime-trends', async (req, res) => {
    try {
        const blogs = await generateRealTimeBlogs();
        return res.status(201).json(blogs);
    } catch (error) {
        console.error('Failed to generate blogs:', error.message);
        return res.status(500).json({ error: 'Failed to generate blogs' });
    }
});

router.get('/top-hashtags', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Optional limit query param
    try {
        const hashtags = await getMostRepeatedHashtags(limit);
        return res.status(200).json(hashtags);
    } catch (error) {
        console.error('Error fetching most repeated hashtags:', error.message);
        return res.status(500).json({ error: 'Error fetching most repeated hashtags' });
    }
});

router.get('/blogs-by-hashtag', async (req, res) => {
    const { hashtag, page = 1, limit = 10 } = req.query; // Get the hashtag, page, and limit from query parameters

    if (!hashtag) {
        return res.status(400).json({ error: 'Hashtag is required' });
    }

    try {
        const blogs = await getBlogsByHashtag(hashtag, parseInt(page), parseInt(limit)); // Fetch blogs by hashtag
        return res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs by hashtag:', error.message);
        return res.status(500).json({ error: 'Error fetching blogs by hashtag' });
    }
});

router.get('/feature-post', async (req, res) => {
    try {
        const featuredBlog = await getFeaturedPost();
        res.json({ featured: featuredBlog });
    } catch (error) {
        res.status(500).json({ error: 'Error generating featured blog' });
    }
});

router.get('/featured', async (req, res) => {
    try {
        const featuredBlog = await Blog.findOne({ featured: true });
        if (!featuredBlog) {
            // Call `getFeaturedPost` to ensure a fallback in case the featured blog was just unset
            const fallbackFeaturedBlog = await getFeaturedPost();
            if (!fallbackFeaturedBlog) {
                return res.status(404).json({ message: 'No featured post found' });
            }
            return res.status(200).json(fallbackFeaturedBlog);
        }
        res.status(200).json(featuredBlog);
    } catch (error) {
        console.error('Error fetching featured post:', error);
        res.status(500).json({ error: 'Error fetching featured post' });
    }
});

// Voting route
router.post('/:slug/vote/:action', async (req, res) => {
    const { slug, action } = req.params;
    const { visitorId } = req.body; // Expect `visitorId` from the frontend

    try {
        // Validate `visitorId`
        if (!visitorId) {
            return res.status(400).json({ error: 'Visitor ID is required.' });
        }

        // Find the blog by slug (case-insensitive)
        const blog = await Blog.findOne({ slug: new RegExp(`^${slug}$`, 'i') });

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        // Ensure `voterIPs` is properly initialized
        if (!blog.voterIPs) {
            blog.voterIPs = new Map();
        }

        // Check if the user has already voted
        const currentVote = blog.voterIPs.get(visitorId);

        if (action === 'upvote') {
            // Prevent duplicate upvotes
            if (currentVote === 'up') {
                return res.status(400).json({ error: 'You have already upvoted this blog.' });
            }

            // Adjust votes
            if (currentVote === 'down') {
                blog.downvotes -= 1; // Remove previous downvote
            }
            blog.upvotes += 1;
            blog.voterIPs.set(visitorId, 'up'); // Record the upvote
        } else if (action === 'downvote') {
            // Prevent duplicate downvotes
            if (currentVote === 'down') {
                return res.status(400).json({ error: 'You have already downvoted this blog.' });
            }

            // Adjust votes
            if (currentVote === 'up') {
                blog.upvotes -= 1; // Remove previous upvote
            }
            blog.downvotes += 1;
            blog.voterIPs.set(visitorId, 'down'); // Record the downvote
        } else {
            // Handle invalid actions
            return res.status(400).json({ error: 'Invalid action.' });
        }

        // Save the updated blog
        await blog.save();

        // Respond with the updated vote counts
        res.status(200).json({
            message: `${action} successful.`,
            upvotes: blog.upvotes,
            downvotes: blog.downvotes,
        });
    } catch (error) {
        console.error('Error handling vote:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
