const mongoose = require('mongoose');

const TopHeadlinesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true  // Index the title for faster search and query operations
    },
    description: {
        type: String,
    },
    author: {
        type: String,
        index: true  // Index the author for better filtering
    },
    source: {
        type: String,
        index: true  // Index the source for better filtering
    },
    url: {
        type: String,
    },
    image: {
        type: String,
    },
    publishedAt: {
        type: Date,
        index: true  // Index the published date for sorting and querying
    },
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt` fields
});

// Add a compound index for both `createdAt` and `updatedAt` in descending order
TopHeadlinesSchema.index({ createdAt: -1, updatedAt: -1 });

// Create the model using the schema
const TopHeadlines = mongoose.model('TopHeadlines', TopHeadlinesSchema);

module.exports = TopHeadlines;
