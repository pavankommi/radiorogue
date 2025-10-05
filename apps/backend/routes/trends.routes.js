const express = require('express');
const router = express.Router();
const trendsService = require('../services/trends.service');
const { postTweet } = require('../services/twitter.service');
const { postToReddit, postBlogToReddit } = require('../services/reddit.service');

router.get('/test-tweet', async (req, res) => {
    try {
        const testMessage = 'This is a test tweet from our application!';  // Test tweet content
        const tweetResponse = await postTweet(testMessage);  // Post the tweet using Twitter API
        res.status(200).json({ message: 'Tweet posted successfully', tweetResponse });
    } catch (error) {
        console.error('Error posting tweet:', error);
        res.status(500).json({ message: 'Failed to post tweet', error: error.message });
    }
});

router.get('/test-reddit-post', async (req, res) => {
    try {
        const savedBlog = {
            heading: "Frenkie de Jong: The Midfield Maestro on the Move",
            shortSummary: "Amid rumors of a transfer, Frenkie de Jong's future hangs in the balance as Barcelona faces financial struggles.",
            content: `Frenkie de Jong, the golden boy of FC Barcelona, may soon be on the move. With Manchester United, Chelsea, Bayern Munich, and PSG showing interest, his future looks uncertain. Barcelona, facing financial struggles, might sell the midfielder despite his contract until 2026. While rumors swirl, De Jong’s talent ensures he remains a hot topic in the transfer market.`,
            slug: "frenkie-de-jong-transfer-rumors-2024",
            categories: ["whats-hot", "football"],
        };

        const redditResponse = await postBlogToReddit(savedBlog);
        console.log(redditResponse);
        res.status(200).json({ message: 'Post submitted successfully', redditResponse });
    } catch (error) {
        console.error('Error posting to Reddit:', error.message);
        res.status(500).json({ message: 'Failed to post to Reddit', error: error.message });
    }
});

// Route to fetch daily trends
router.get('/daily', async (req, res) => {
    try {
        const trends = await trendsService.getDailyTrends();
        res.status(200).json(trends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to fetch real-time trends
router.get('/realtime', async (req, res) => {
    const { category } = req.query;  // Optional category param
    try {
        const trends = await trendsService.getRealTimeTrends(category || 'all');
        res.status(200).json(trends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/fcr', async (req, res) => {
    try {
        const trends = await trendsService.fetchGoogleTrendsRealTimeData();
        res.status(200).json(trends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to fetch and save headlines
router.get('/save-headlines', async (req, res) => {
    try {
        const headlines = await trendsService.fetchTopHeadlines();
        res.status(200).json(headlines);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).send('Error fetching headlines');
    }
});

// Route to retrieve saved headlines from the database
router.get('/headlines', async (req, res) => {
    try {
        const savedHeadlines = await trendsService.getSavedHeadlines(); // Retrieve saved headlines
        res.status(200).json(savedHeadlines);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving headlines' });
    }
});

router.get('/save-tech-news', async (req, res) => {
    try {
        await trendsService.fetchAndSaveTechNews();
        res.status(200).json({ message: 'Tech news saved successfully!' });
    } catch (error) {
        console.error('Error saving tech news:', error);
        res.status(500).json({ message: 'Failed to save tech news' });
    }
});

// Route to retrieve saved tech news from the database
router.get('/tech-news', async (req, res) => {
    try {
        const savedNews = await trendsService.getSavedTechNews();
        res.status(200).json(savedNews);
    } catch (error) {
        console.error('Error retrieving tech news:', error);
        res.status(500).json({ message: 'Failed to retrieve tech news' });
    }
});

router.get('/save-rogues-news', async (req, res) => {
    try {
        await trendsService.fetchAndSaveRoguesNews();
        res.status(200).json({ message: 'Rogues news saved successfully!' });
    } catch (error) {
        console.error('Error saving rogues news:', error);
        res.status(500).json({ message: 'Failed to save rogues news' });
    }
});

// Route to retrieve saved RoguesNews from the database
router.get('/rogues-news', async (req, res) => {
    try {
        const savedNews = await trendsService.getSavedRoguesNews();
        res.status(200).json(savedNews);
    } catch (error) {
        console.error('Error retrieving rogues news:', error);
        res.status(500).json({ message: 'Failed to retrieve rogues news' });
    }
});

// Routes for GNews Top Headlines
router.get('/save-gnews-headlines', async (req, res) => {
    try {
        await trendsService.fetchAndSaveGNewsTopHeadlines();
        res.status(200).json({ message: 'GNews top headlines saved successfully!' });
    } catch (error) {
        console.error('Error saving GNews top headlines:', error);
        res.status(500).json({ message: 'Failed to save GNews top headlines' });
    }
});

router.get('/gnews-headlines', async (req, res) => {
    try {
        const savedHeadlines = await trendsService.getSavedGNewsHeadlines();
        res.status(200).json(savedHeadlines);
    } catch (error) {
        console.error('Error retrieving GNews top headlines:', error);
        res.status(500).json({ message: 'Failed to retrieve GNews top headlines' });
    }
});

router.get('/save-money-news', async (req, res) => {
    try {
        await trendsService.fetchAndSaveMoneyNews();
        res.status(200).json({ message: 'Money news saved successfully!' });
    } catch (error) {
        console.error('Error saving money news:', error);
        res.status(500).json({ message: 'Failed to save money news' });
    }
});

// Route to retrieve saved money news from the database
router.get('/money-news', async (req, res) => {
    try {
        const savedNews = await trendsService.getSavedMoneyNews();
        res.status(200).json(savedNews);
    } catch (error) {
        console.error('Error retrieving money news:', error);
        res.status(500).json({ message: 'Failed to retrieve money news' });
    }
});

router.get('/save-sports-news', async (req, res) => {
    try {
        await trendsService.fetchAndSaveSportsNews();
        res.status(200).json({ message: 'Sports news saved successfully!' });
    } catch (error) {
        console.error('Error saving sports news:', error);
        res.status(500).json({ message: 'Failed to save sports news' });
    }
});

// Route to retrieve saved sports news from the database
router.get('/sports-news', async (req, res) => {
    try {
        const savedNews = await trendsService.getSavedSportsNews();
        res.status(200).json(savedNews);
    } catch (error) {
        console.error('Error retrieving sports news:', error);
        res.status(500).json({ message: 'Failed to retrieve sports news' });
    }
});

module.exports = router;
