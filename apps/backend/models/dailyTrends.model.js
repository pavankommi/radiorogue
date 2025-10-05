const mongoose = require('mongoose');

// Define the schema for storing articles associated with a daily trend
const dailyArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true  // Add index to optimize queries on article title
    },
    url: {
        type: String,
        required: true
    },
    snippet: {
        type: String
    },
    imageUrl: {
        type: String
    },
    source: {
        type: String,
        required: true
    },
    timeAgo: {
        type: String,
        required: true,
        index: true  // Add index to optimize queries on timeAgo
    }
}, {
    _id: false  // Disable _id for sub-documents (articles array)
});

// Define the schema for storing daily trends
const dailyTrendsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true  // Ensure uniqueness of trend titles
    },
    relatedQueries: [String],  // Array of related query strings
    articles: [dailyArticleSchema]  // Store an array of articles under each daily trend
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt` fields
});

// Add a compound index for both `createdAt` and `updatedAt` in descending order
dailyTrendsSchema.index({ createdAt: -1, updatedAt: -1 });

// Create the model using the schema
const DailyTrends = mongoose.model('DailyTrends', dailyTrendsSchema);

module.exports = DailyTrends;
