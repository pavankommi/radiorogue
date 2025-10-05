require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/blog.model');
const { computeEmbedding } = require('../utils/embedding.util');
const use = require('@tensorflow-models/universal-sentence-encoder');

const DEFAULT_POSTED_BY = '66ddb5895fb8fa82e2512714'; // Replace with your valid ObjectId

const precomputeEmbeddings = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI); // Removed deprecated options
        console.log('Connected to MongoDB.');

        console.log('Loading Universal Sentence Encoder model...');
        const model = await use.load();
        console.log('Model loaded.');

        // Fetch blogs without embeddings
        const newBlogs = await Blog.find({
            embedding: { $exists: false },
        });
        console.log(`Found ${newBlogs.length} blogs to update.`);

        const batchSize = 100;
        for (let i = 0; i < newBlogs.length; i += batchSize) {
            const batch = newBlogs.slice(i, i + batchSize);
            console.log(
                `Processing batch ${i / batchSize + 1} of ${Math.ceil(
                    newBlogs.length / batchSize
                )}...`
            );

            for (const blog of batch) {
                try {
                    const text = `${blog.heading} ${blog.shortSummary}`;
                    blog.embedding = await computeEmbedding(text);

                    // Handle missing postedBy field
                    if (!blog.postedBy) {
                        console.warn(`Blog ${blog.slug} missing postedBy. Adding default.`);
                        blog.postedBy = DEFAULT_POSTED_BY;
                    }

                    await blog.save();
                    console.log(`Updated embedding for blog: ${blog.slug}`);
                } catch (innerError) {
                    console.error(
                        `Error updating embedding for blog: ${blog.slug}. Error: ${innerError.message}`
                    );
                }
            }
        }

        console.log('All embeddings updated!');
    } catch (error) {
        console.error('Error during precomputation:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

precomputeEmbeddings();
