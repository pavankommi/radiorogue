const mongoose = require('mongoose');

const techNewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true  // Index the title for faster search
    },
    description: {
        type: String,
    },
    url: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    publishedAt: {
        type: Date,
        required: true,
        index: true  // Index the published date for sorting and querying
    },
    source: {
        type: String,
        required: true,
        index: true  // Index the source for better filtering
    },
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt` fields
});

// Add a compound index for both `createdAt` and `updatedAt` in descending order
techNewsSchema.index({ createdAt: -1, updatedAt: -1 });

// Create the model using the schema
const TechNews = mongoose.model('TechNews', techNewsSchema);

module.exports = TechNews;
