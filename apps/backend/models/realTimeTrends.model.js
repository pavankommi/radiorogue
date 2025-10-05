const mongoose = require('mongoose');

// Define the schema for storing articles associated with a trend
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        index: true  // Index the title for faster search
    },
    url: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    source: {
        type: String,
        required: true,
        index: true  // Index the source for better filtering
    },
    timeAgo: {
        type: String,
        index: true  // Index timeAgo to optimize queries by time
    }
}, {
    _id: false  // Disable _id for sub-documents
});

// Define the schema for storing real-time trends
const realTimeTrendsSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,  // Ensure uniqueness of trend titles
        required: true,  // Mark title as required since it is the primary field
        index: true  // Index the title for faster search and queries
    },
    relatedQueries: [String],  // Store related queries for trends
    articles: {
        type: [articleSchema],  // Store an array of articles (optional)
        default: []  // Default to an empty array if no articles are provided
    }
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt` fields
});

// Add a compound index for both `createdAt` and `updatedAt` in descending order
realTimeTrendsSchema.index({ createdAt: -1, updatedAt: -1 });

// Create the model using the schema
const RealTimeTrends = mongoose.model('RealTimeTrends', realTimeTrendsSchema);

module.exports = RealTimeTrends;
