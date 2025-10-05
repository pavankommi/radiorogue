const googleTrends = require('google-trends-api');
const axios = require('axios');
const NodeCache = require('node-cache');
const xml2js = require('xml2js');

// Models
const TopHeadlines = require('../models/topheadlines.model');
const TechNews = require('../models/technews.model');
const RoguesNews = require('../models/roguesnews.model');
const GNewsHeadlines = require('../models/gnewsheadlines.model');
const MoneyNews = require('../models/moneynews.model');
const SportsNews = require('../models/sportsnews.model');

// Cache
const cache = new NodeCache();

// API URLs and keys
const NEWS_API_URL = process.env.NEWS_API_URL;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const GNEWS_API_URL = process.env.GNEWS_API_URL;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

const MONEY_NEWS_API_URL = process.env.MONEY_NEWS_API_URL;
const MONEY_NEWS_API_KEY = process.env.NEWS_API_KEY; // Reusing the same API key

// Create an axios instance
const axiosInstance = axios.create({
    timeout: 10000, // 10 seconds timeout
});

// Custom retry logic for Axios
const axiosWithRetry = async (axiosInstance, options, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axiosInstance(options);
            return response;
        } catch (error) {
            if (attempt < retries) {
                console.warn(`Retry attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                console.error(`All retry attempts failed for ${options.url}`);
                throw error;
            }
        }
    }
};

// Helper function to filter and save news
const filterAndSaveNews = async (articles, Model, collectionName) => {
    const validArticles = articles.filter(article => article.title !== "[Removed]").slice(0, 20);

    if (validArticles.length < 20) {
        console.log(`Warning: Only ${validArticles.length} valid ${collectionName} articles found.`);
    }

    await Model.deleteMany({});
    console.log(`All existing ${collectionName} articles deleted successfully.`);

    for (const article of validArticles) {
        const existingArticle = await Model.findOne({ title: article.title });

        if (!existingArticle) {
            const newArticle = new Model({
                title: article.title,
                description: article.description,
                url: article.url,
                image: article.urlToImage || article.image,
                publishedAt: new Date(article.publishedAt),
                source: article.source.name,
                author: article.author || null,
            });
            await newArticle.save();
            console.log(`Article saved: ${article.title}`);
        } else {
            console.log(`Duplicate article found, skipping: ${article.title}`);
        }
    }
};

// Fetch daily trends
const getDailyTrends = async () => {
    try {
        const response = await googleTrends.dailyTrends({ geo: 'US' });
        const trends = JSON.parse(response).default.trendingSearchesDays[0].trendingSearches;
        return trends.map(trend => ({
            title: trend.title.query,
            relatedQueries: trend.relatedQueries.map(q => q.query),
            articles: trend.articles.map(article => ({
                title: article.title,
                url: article.url,
                snippet: article.snippet,
                imageUrl: article.image?.imageUrl || null,
                source: article.source,
                timeAgo: article.timeAgo,
            })),
        }));
    } catch (error) {
        console.error('Error fetching daily trends:', error);
        throw new Error('Failed to fetch daily trends');
    }
};

// Fetch real-time trends
const getRealTimeTrends = async (category = 'all') => {
    try {
        const response = await googleTrends.realTimeTrends({ geo: 'US', category });
        const trends = JSON.parse(response).storySummaries.trendingStories;
        return trends.map(trend => ({
            title: trend.title,
            articles: trend.articles.map(article => ({
                title: article.title,
                url: article.url,
                snippet: article.snippet || '',
                imageUrl: article.image?.imageUrl || null,
                source: article.source,
                timeAgo: article.timeAgo,
            })),
        }));
    } catch (error) {
        console.error('Error fetching real-time trends:', error);
        throw new Error('Failed to fetch real-time trends');
    }
};

const fetchGoogleTrendsRealTimeData = async () => {
    try {
        // Fetch the RSS feed from Google Trends
        const response = await axios.get('https://trends.google.com/trending/rss?geo=US');

        // Parse the XML data to JSON
        const parser = new xml2js.Parser({ explicitArray: false });
        const jsonData = await parser.parseStringPromise(response.data);

        // Access and return the RSS feed's content
        return jsonData.rss.channel.item;

    } catch (error) {
        console.error('Error fetching or converting Google Trends RSS to JSON:', error);
    }
};

const fetchGoogleNewsDailyData = async () => {
    try {
        // Fetch the Google News RSS feed for Top Stories
        const response = await axios.get('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');

        // Parse the XML data to JSON
        const parser = new xml2js.Parser({ explicitArray: false });
        const jsonData = await parser.parseStringPromise(response.data);

        // Access and return the RSS feed's content
        return jsonData.rss.channel.item;

    } catch (error) {
        console.error('Error fetching or converting Google News RSS to JSON:', error);
    }
};


// Fetch top headlines with custom retry logic
const fetchTopHeadlines = async () => {
    try {
        const response = await axiosWithRetry(axiosInstance, {
            url: NEWS_API_URL,
            params: { country: 'us', apiKey: NEWS_API_KEY, pageSize: 30 },
        });
        await filterAndSaveNews(response.data.articles, TopHeadlines, 'top headlines');
    } catch (error) {
        console.error('Error fetching and saving top headlines:', error);
    }
};

// Fetch tech news with custom retry logic
const fetchAndSaveTechNews = async () => {
    try {
        const response = await axiosWithRetry(axiosInstance, {
            url: GNEWS_API_URL,
            params: { category: 'technology', lang: 'en', country: 'us', max: 20, token: GNEWS_API_KEY },
        });
        await filterAndSaveNews(response.data.articles, TechNews, 'tech news');
    } catch (error) {
        console.error('Error fetching and saving tech news:', error);
        throw new Error('Failed to fetch and save tech news');
    }
};

// Fetch rogues news with custom retry logic
const fetchAndSaveRoguesNews = async () => {
    try {
        const response = await axiosWithRetry(axiosInstance, {
            url: MONEY_NEWS_API_URL,
            params: {
                q: 'weird OR strange OR unbelievable OR mysterious OR bizarre OR odd',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 30,
                apiKey: NEWS_API_KEY,
            },
        });
        await filterAndSaveNews(response.data.articles, RoguesNews, 'rogues news');
    } catch (error) {
        console.error('Error fetching and saving rogues news:', error);
        throw new Error('Failed to fetch and save rogues news');
    }
};

// Fetch money news with custom retry logic
const fetchAndSaveMoneyNews = async () => {
    try {
        const response = await axiosWithRetry(axiosInstance, {
            url: MONEY_NEWS_API_URL,
            params: { q: 'investment OR funds OR stocks OR crypto', language: 'en', sortBy: 'publishedAt', pageSize: 20, apiKey: MONEY_NEWS_API_KEY },
        });
        await filterAndSaveNews(response.data.articles, MoneyNews, 'money news');
    } catch (error) {
        console.error('Error fetching and saving money news:', error);
        throw new Error('Failed to fetch and save money news');
    }
};

// Fetch sports news with custom retry logic
const fetchAndSaveSportsNews = async () => {
    try {
        const response = await axiosWithRetry(axiosInstance, {
            url: NEWS_API_URL,
            params: { category: 'sports', country: 'us', apiKey: NEWS_API_KEY, pageSize: 30 },
        });
        await filterAndSaveNews(response.data.articles, SportsNews, 'sports news');
    } catch (error) {
        console.error('Error fetching and saving sports news:', error);
        throw new Error('Failed to fetch and save sports news');
    }
};

// Fetch GNews top headlines with custom retry logic
const fetchAndSaveGNewsTopHeadlines = async () => {
    try {
        const response = await axiosWithRetry(axiosInstance, {
            url: GNEWS_API_URL,
            params: { lang: 'en', country: 'us', max: 20, token: GNEWS_API_KEY },
        });
        await filterAndSaveNews(response.data.articles, GNewsHeadlines, 'GNews top headlines');
    } catch (error) {
        console.error('Error fetching and saving GNews top headlines:', error);
        throw new Error('Failed to fetch and save GNews top headlines');
    }
};

// Retrieve saved data
const getSavedHeadlines = async () => await TopHeadlines.find();
const getSavedTechNews = async () => await TechNews.find();
const getSavedRoguesNews = async () => await RoguesNews.find();
const getSavedGNewsHeadlines = async () => await GNewsHeadlines.find();
const getSavedMoneyNews = async () => await MoneyNews.find();
const getSavedSportsNews = async () => await SportsNews.find();

module.exports = {
    getDailyTrends,
    getRealTimeTrends,
    fetchTopHeadlines,
    getSavedHeadlines,
    fetchAndSaveTechNews,
    getSavedTechNews,
    fetchAndSaveRoguesNews,
    getSavedRoguesNews,
    fetchAndSaveGNewsTopHeadlines,
    getSavedGNewsHeadlines,
    fetchAndSaveMoneyNews,
    getSavedMoneyNews,
    fetchAndSaveSportsNews,
    getSavedSportsNews,
    fetchGoogleTrendsRealTimeData,
    fetchGoogleNewsDailyData
};
