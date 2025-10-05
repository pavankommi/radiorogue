const express = require('express');
const axios = require('axios');
const he = require('he');
const logger = require('../logger');
const { fetchGoogleNewsDailyData, fetchGoogleTrendsRealTimeData } = require('./trends.service');
const { generateBlogContent } = require('./openai.service');
const { computeEmbedding } = require('../utils/embedding.util');
const Blog = require('../models/blog.model');
const DailyTrends = require('../models/dailyTrends.model');
const RealTimeTrends = require('../models/realTimeTrends.model');

const EXPIRATION_TIME = 259200; // 72 hours in seconds

// Function to create composite text from trend titles
const createCompositeTextFromTitles = (data, type) => {
    return data.map(item => {
        if (type === 'daily' && item.description) {
            return item.description; // Use the description for daily trends
        }
        if (type === 'realtime' && item['ht:news_item']) {
            return item['ht:news_item'].map(article => article.title).join(' ');
        }
        return '';
    }).join(' ');
};

const blogPrompt = (trend) => `
Write a blog post based on the following content: "${JSON.stringify(trend)}".
- If the topic is sensitive (e.g., deaths, accidents, disasters, serious illnesses, tragic events, mental health issues, sexual violence, human rights violations), ensure the tone is bold, confident, and empathetic—balancing respect with impactful delivery.
- The tone should be **direct, bold, unfiltered, and a bit explicit**, reflecting the voice of "RadioRogue". Don’t be afraid to push boundaries with sharp, cheeky language—drop in a few **explicit phrases** or **adult innuendos** to add bite, but keep it smart and clever.
- The writing should feel **confident, in-your-face, and a bit provocative**—designed to grab attention and hold it. Don't shy away from throwing in a bit of **dark humor or adult references**, but make sure the tone stays engaging and not overly vulgar.
- Optimize the content for SEO by naturally weaving high-traffic keywords into headings (h2, h3), summaries, and content. Use organic, keyword-rich headings and ensure the content remains engaging while boosting search rankings.
- Ensure content and tldr is provided in **RAW HTML format** (excluding HTML tags, the total word count should be between **500–1000 words**). Break the content into **well-developed, digestible sections** with organic headings (h2, h3).
- Include **catchy headings** that make readers want to click, and structure the post in a way that feels **conversational** and **relatable**. Always aim to get to the point, but leave room for a bit of **cheeky language** or **bold, unexpected turns** to keep the reader on their toes.
- Expand on key points with engaging insights, clever analogies, and real-life examples. Use provocative, thought-provoking content to keep readers hooked while avoiding fluff.
- Incorporate long-tail keywords and semantic variants related to the given topic, and add content depth and expert opinions from reputable sources to enhance both credibility and SEO.
- Provide a **TL;DR section** formatted in **RAW HTML** at the beginning of the post. The TL;DR should:
  - Combine the most critical details, including key points and subheadings, into a cohesive ~200-word summary.
  - Structure the summary with **short paragraphs** or **bullet points**, depending on the content's nature.
  - Highlight the key takeaways and provide the core insights in a scannable, engaging format.
  - Avoid using a standalone "TL;DR" label or h1 —just flow naturally into the section.
  - End with a compelling continuation phrase like "Here's the full scoop," "Read on for the full story," or "Dive in for the details."
- Close the post with a **'Read More' section**, encouraging further exploration with **3-5 related articles**. Use **anchor tags (<a>)** for the links to other relevant content or trending topics to maximize engagement.
- Include 3–5 SEO-friendly, attention-grabbing hashtags tailored for Twitter at the end of the content and in the 'hashtags' field of the JSON response.
- Choose 1 category that best fits the content from the list: "whats-hot" (trending, viral topics), "rogues-pick" (unconventional, edgy content), "tech-pulse" (tech-related or future-forward content), "money-moves" (finance or business-related trends), "sport" (sports-related topics).

Return the response as a JSON object with the following structure:
{
  "heading": "<SEO-friendly Blog Title with important keywords>",
  "slug": "<SEO-friendly Slug>",
  "shortSummary": "<A brief, SEO-friendly summary of the blog>",
  "tldr": "<RAW HTML including concise summaries with important SEO keywords>",
  "metaDescription": "<A compelling SEO-friendly meta description (150–160 characters) with primary keywords>",
  "articleAuthor": "RadioRogue AI",
  "source": "<source of the content>",
  "content": "<RAW HTML of the content (ensure word count between 500-1000) with a 'Read More' section at the end including 3-5 links>",
  "status": "published",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "categories": ["<chosen category>", "<optional second category if needed>"]
}
Important: Return only the JSON object without any code block formatting, markdown, or backticks.
`;

const notifyIndexNow = async (urls) => {
    const apiKey = '72a552d971244b11b90a38d61e15deab'; // Replace with your API key
    const keyLocation = `https://radiorogue.com/${apiKey}.txt`; // Replace with your actual hosted key location

    const payload = {
        host: 'radiorogue.com',
        key: apiKey,
        keyLocation: keyLocation,
        urlList: urls, // Directly use the array of URLs
    };

    try {
        const response = await axios.post('https://api.indexnow.org/indexnow', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('IndexNow notification sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending IndexNow notification:', error.response?.data || error.message);
    }
};

// Process and save the blog
const processAndSaveBlog = async (trend, model, type) => {
    console.log(`Processing new blog for trend: ${trend.title}`);

    // Check if the trend already exists in the database by title
    const existingTrend = await model.findOne({ title: trend.title });
    if (existingTrend) {
        console.log(`Skipping existing trend: ${trend.title}`);
        return null;  // Skip if the trend already exists
    }

    // Proceed with saving the new blog
    const newTrend = new model({
        title: trend.title,
        relatedQueries: trend.relatedQueries,
        articles: trend.articles,
        createdAt: new Date()
    });

    await newTrend.save();
    console.log(`Saved new trend to database: ${trend.title}`);

    // Generate blog content
    const prompt = blogPrompt(trend);
    const blogContent = await generateBlogContent(prompt);
    const sanitizedContent = sanitizeHTML(blogContent.content);
    const sanitizedTldr = sanitizeHTML(blogContent.tldr); // Sanitize the TL;DR content

    console.log('Generated blog content for trend:', trend.title);

    // Ensure slug uniqueness
    let uniqueSlug = blogContent.slug;
    const slugExists = await Blog.findOne({ slug: uniqueSlug });
    if (slugExists) {
        console.log(`Slug already exists. Generating a unique slug for ${uniqueSlug}`);
        let count = 1;
        while (await Blog.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${blogContent.slug}-${count}`;
            count++;
        }
    }

    // Save the blog
    const newBlog = new Blog({
        heading: blogContent.heading,
        slug: uniqueSlug,  // Ensure unique slug
        shortSummary: blogContent.shortSummary,
        tldr: sanitizedTldr, // Save the sanitized TL;DR content
        metaDescription: blogContent.metaDescription,
        articleAuthor: blogContent.articleAuthor,
        source: blogContent.source,
        content: sanitizedContent,
        image: blogContent.image,
        views: 0,
        status: blogContent.status,
        categories: Array.isArray(blogContent.categories) ? blogContent.categories.slice(0, 2) : ['rogues-pick'],
        hashtags: blogContent.hashtags,
        postedBy: '66ddb5895fb8fa82e2512714'  // Example postedBy ID
    });

    // Compute and save embedding
    try {
        const text = `${newBlog.heading || ''} ${newBlog.shortSummary || ''}`.trim();

        if (!text) {
            console.warn(`Skipping embedding computation for blog: ${newBlog.slug} due to missing text.`);
        } else {
            console.log(`Computing embedding for blog: ${newBlog.slug}`);
            newBlog.embedding = await computeEmbedding(text);
        }
    } catch (error) {
        console.error(`Error computing embedding for blog: ${newBlog.slug}. Error: ${error.message}`);
        // Optionally, fallback to a default embedding or skip saving the embedding.
        newBlog.embedding = []; // Ensure embedding is not undefined
    }

    const savedBlog = await newBlog.save();
    console.log(`Saved blog with slug: ${uniqueSlug}`);

    // Build the URLs for the categories
    const categoryUrls = Array.isArray(savedBlog.categories) && savedBlog.categories.length > 0
        ? savedBlog.categories.slice(0, 2).map(category => `https://radiorogue.com/${category}/${savedBlog.slug}`)
        : [`https://radiorogue.com/search/${savedBlog.slug}`]; // Fallback to 'search' if no categories exist

    // Notify IndexNow with all category URLs (Gracefully handle failures)
    try {
        await notifyIndexNow(categoryUrls); // Notify IndexNow with an array of URLs
        console.log(`IndexNow notified successfully for URLs: ${categoryUrls.join(', ')}`);
    } catch (error) {
        console.log(`Failed to notify IndexNow for URLs: ${categoryUrls.join(', ')}. Error: ${error.message}`);
    }

    return savedBlog;
};

// Generate daily blogs
const generateDailyBlogs = async () => {
    try {
        console.log('Starting daily blog generation...');
        const topTrends = await fetchGoogleNewsDailyData();
        console.log(`Fetched ${topTrends.length} daily trends`);

        let savedBlogs = [];

        for (let i = 0; i < topTrends.length; i++) {
            const trend = topTrends[i];
            const savedBlog = await processAndSaveBlog(trend, DailyTrends, "daily");

            if (savedBlog) savedBlogs.push(savedBlog);
        }

        console.log("Daily blog generation completed successfully");
        return savedBlogs;

    } catch (error) {
        console.log('Error generating daily blogs', error);
        logger.error('Error generating daily blogs', error);
        throw error;
    }
};

// Generate real-time blogs
const generateRealTimeBlogs = async () => {
    try {
        console.log('Starting real-time blog generation...');
        const combinedTrends = await fetchGoogleTrendsRealTimeData();
        console.log(`Fetched ${combinedTrends.length} real-time trends`);

        let savedBlogs = [];

        for (let i = 0; i < combinedTrends.length; i++) {
            const trend = combinedTrends[i];
            const savedBlog = await processAndSaveBlog(trend, RealTimeTrends, "realtime");

            if (savedBlog) savedBlogs.push(savedBlog);
        }

        console.log("Real-time blog generation completed successfully");
        return savedBlogs;

    } catch (error) {
        console.log('Error generating real-time blogs', error);
        logger.error('Error generating real-time blogs', error);
        throw error;
    }
};

// Utility to sanitize HTML content
const sanitizeHTML = (content) => {
    return he.decode(content)
        .replace(/â€™/g, '’')
        .replace(/â€œ/g, '“')
        .replace(/â€�/g, '”')
        .replace(/â€“/g, '–')
        .replace(/â€”/g, '—')
        .replace(/â€¦/g, '…')
        .replace(/â€˜/g, '‘')
        .replace(/[\n\r]+/g, ' ')
        .replace(/`/g, '')
        .replace(/\+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

module.exports = {
    generateDailyBlogs,
    generateRealTimeBlogs
};
