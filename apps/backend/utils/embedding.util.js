const tf = require('@tensorflow/tfjs-node'); // Import TensorFlow.js Node.js backend
const use = require('@tensorflow-models/universal-sentence-encoder');

let model; // Singleton model instance

// Load the Universal Sentence Encoder model only once
const loadModel = async () => {
    try {
        if (!model) {
            console.log('Loading Universal Sentence Encoder model...');
            model = await use.load();
            console.log('Model loaded successfully.');
        }
        return model;
    } catch (error) {
        console.error('Error loading Universal Sentence Encoder model:', error.message);
        throw new Error('Failed to load Universal Sentence Encoder model.');
    }
};

// Compute embeddings for a given text
const computeEmbedding = async (text) => {
    try {
        const model = await loadModel();
        console.log(`Computing embedding for text: "${text}"`);
        const embeddings = await model.embed(text); // Generate embeddings
        return embeddings.arraySync()[0]; // Return the embedding vector
    } catch (error) {
        console.error('Error computing embedding:', error.message);
        throw new Error('Failed to compute embedding.');
    }
};

// Log the TensorFlow backend being used
console.log('Using TensorFlow.js backend:', tf.getBackend());

module.exports = { computeEmbedding };
