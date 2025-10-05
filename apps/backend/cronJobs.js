const cron = require('node-cron');
const { generateDailyBlogs, generateRealTimeBlogs } = require('./services/blogGeneration.service');
const {
    fetchTopHeadlines,
    fetchAndSaveTechNews,
    fetchAndSaveRoguesNews,
    fetchAndSaveGNewsTopHeadlines,
    fetchAndSaveMoneyNews,
    fetchAndSaveSportsNews
} = require('./services/trends.service');
const { getFeaturedPost } = require('./services/featuredPost.service'); // Add featured post service
const NodeCache = require('node-cache');
const cache = new NodeCache();
const { postTweet } = require('./services/twitter.service');
const Blog = require('./models/blog.model');

let tweetCount = 0;
let tweetedBlogs = [];

const clearBlogCache = () => {
    cache.flushAll();
    console.log(`[${new Date().toISOString()}] Blog cache cleared.`);
};

const clearCacheForNews = (cacheKey) => {
    cache.del(cacheKey);
    console.log(`[${new Date().toISOString()}] Cache cleared for ${cacheKey}`);
};

const handleTask = async (taskFunction, taskName) => {
    try {
        console.log(`[${new Date().toISOString()}] Starting ${taskName}...`);
        await taskFunction();
        console.log(`[${new Date().toISOString()}] ${taskName} completed successfully.`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during ${taskName}:`, error.message);
    }
};

const handleNewsFetching = async () => {
    console.log(`[${new Date().toISOString()}] Starting news fetch tasks...`);
    const results = await Promise.allSettled([
        handleTask(fetchTopHeadlines, 'fetchTopHeadlines'),
        handleTask(fetchAndSaveTechNews, 'fetchAndSaveTechNews'),
        handleTask(fetchAndSaveRoguesNews, 'fetchAndSaveRoguesNews'),
        handleTask(fetchAndSaveGNewsTopHeadlines, 'fetchAndSaveGNewsTopHeadlines'),
        handleTask(fetchAndSaveMoneyNews, 'fetchAndSaveMoneyNews'),
        handleTask(fetchAndSaveSportsNews, 'fetchAndSaveSportsNews')
    ]);

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`[${new Date().toISOString()}] Task ${index} failed:`, result.reason);
        }
    });

    console.log(`[${new Date().toISOString()}] All news fetch tasks completed.`);
};

cron.schedule('0 */2 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Scheduled task: Fetch news every 2 hours.`);
    await handleNewsFetching();
});

const handleGenerateDailyBlogs = async () => {
    await handleTask(generateDailyBlogs, 'Daily blog generation');
};

const handleGenerateRealTimeBlogs = async () => {
    await handleTask(generateRealTimeBlogs, 'Real-time blog generation');
};

// Cron to run daily blogs at 8:00 AM US Eastern Time (ET) (UTC - 4)
cron.schedule('0 12 * * *', async () => {  // 8 AM ET is 12 PM UTC
    console.log(`[${new Date().toISOString()}] Scheduled task: Generate daily blogs at 8 AM ET.`);
    await handleGenerateDailyBlogs();
});

// Cron to run real-time blogs once a day at 12:00 PM US Eastern Time (ET) (UTC - 4)
cron.schedule('0 16 * * *', async () => {  // 12 PM ET is 4 PM UTC
    console.log(`[${new Date().toISOString()}] Scheduled task: Generate real-time blogs once a day.`);
    await handleGenerateRealTimeBlogs();
});

const resetTweetCount = () => {
    tweetCount = 0;
    tweetedBlogs = [];
    console.log(`[${new Date().toISOString()}] Tweet count and tweeted blogs reset.`);
};

cron.schedule('0 0 * * *', resetTweetCount);

const postLatestBlog = async () => {
    if (tweetCount < 7) {
        const latestBlog = await Blog.findOne({})
            .sort({ createdAt: -1 })
            .select('slug shortSummary categories hashtags heading')
            .lean();

        if (latestBlog) {
            // Check if the latest blog has already been tweeted
            if (!tweetedBlogs.includes(latestBlog.slug)) {
                // If not tweeted, prepare and post it
                await postBlogToTwitter(latestBlog);
                tweetedBlogs.push(latestBlog.slug);
                tweetCount += 1;
                console.log(`Tweet posted: ${latestBlog.slug}`);
            } else {
                // If the latest blog is a duplicate, find the next unposted blog
                const nextBlog = await Blog.findOne({
                    slug: { $ne: latestBlog.slug },
                    _id: { $nin: tweetedBlogs } // Exclude already tweeted blogs
                })
                    .sort({ createdAt: -1 })
                    .select('slug shortSummary categories hashtags heading')
                    .lean();

                if (nextBlog) {
                    await postBlogToTwitter(nextBlog);
                    tweetedBlogs.push(nextBlog.slug);
                    tweetCount += 1;
                    console.log(`Tweet posted: ${nextBlog.slug}`);
                } else {
                    console.log('No new blogs to tweet.');
                }
            }
        } else {
            console.log('No blogs found.');
        }
    }
};

// Helper function to post to Twitter
const postBlogToTwitter = async (blog) => {
    const category = blog.categories && Array.isArray(blog.categories) && blog.categories.length > 0
        ? blog.categories[0]
        : 'search';

    let tweetText = `${blog.shortSummary} - https://radiorogue.com/${category}/${blog.slug}`;

    if (blog.hashtags && Array.isArray(blog.hashtags) && blog.hashtags.length > 0) {
        const hashtags = blog.hashtags.join(' ');
        tweetText += `\n\n${hashtags}`;
    }

    try {
        await postTweet(tweetText);
        console.log(`Tweet posted: ${tweetText}`);
    } catch (error) {
        console.error('Failed to post tweet:', error.message);
    }
};

// Schedule to post the latest blog 6 times per day at 4-hour intervals
cron.schedule('0 0,4,8,12,16,20 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Scheduled task: Post latest blog to Twitter.`);
    await postLatestBlog();
});

// Schedule to generate featured post at 2AM
cron.schedule('0 2 * * *', async () => {
    try {
        console.log(`[${new Date().toISOString()}] Generating featured blog post at 2AM.`);
        await getFeaturedPost();
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error generating featured blog post:`, error.message);
    }
});