const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
    heading: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, trim: true, index: true }, // SEO-friendly URLs
    shortSummary: { type: String, required: true, trim: true },
    tldr: { type: String, trim: true }, // New TL;DR field
    metaDescription: { type: String, required: true, trim: true },
    articleAuthor: { type: String, required: true, trim: true },
    source: { type: String, trim: true },
    embedding: { type: [Number], default: [], index: '2dsphere' },
    image: {
        url: { type: String, trim: true },
        altText: { type: String, trim: true },
        description: { type: String, trim: true },
        imageSrc: { type: String, trim: true }
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // Draft.js or HTML
    views: { type: Number, default: 0, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    categories: {
        type: [String],
        enum: ['rogues-pick', 'whats-hot', 'tech-pulse', 'money-moves', 'sport'],
        validate: [arrayLimit, '{PATH} exceeds the limit of 3'] // Max 3 categories
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true, default: '66ddb5895fb8fa82e2512714' }, // Author reference
    hashtags: { type: [String], trim: true }, // Optional hashtags
    featured: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voterIPs: { type: Map, of: String, default: {} }, // Store IP and vote type
    comments: [
        {
            content: { type: String, required: true },
            userId: { type: String, required: true }, // Unique identifier from FingerprintJS
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true // `createdAt` and `updatedAt` fields
});

// Text index for full-text search
BlogSchema.index({ heading: 'text', shortSummary: 'text', tldr: 'text', content: 'text' }); // Added `tldr` to full-text search

// Index for categories
BlogSchema.index({ categories: 1 });

// Compound index for pagination
BlogSchema.index({ updatedAt: -1, _id: -1 });

// Compound index for category-specific slugs
BlogSchema.index({ slug: 1, categories: 1 });

// Index for featured blogs
BlogSchema.index({ featured: 1 });

// Category limit validation
function arrayLimit(val) {
    return val.length <= 3;
}

// Pre-save middleware to generate a unique slug based on the heading only if slug is missing
BlogSchema.pre('save', async function (next) {
    if (!this.slug) { // Generate slug only if missing
        this.slug = await generateUniqueSlug(this.heading);
    }
    next();
});

// Default categories handling
BlogSchema.pre('save', function (next) {
    if (this.categories.length === 0) {
        this.categories = ['rogues-pick']; // Default category
    }
    next();
});

// Function to generate a unique slug
async function generateUniqueSlug(baseField) {
    let slug = slugify(baseField, { lower: true, strict: true });
    let uniqueSlug = slug;
    let count = 1;

    // Ensure uniqueness of the slug
    while (await mongoose.models.Blog.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${count}`;
        count++;
    }

    return uniqueSlug;
}

// Create and export the Blog model
const Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;
