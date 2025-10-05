const { TwitterApi } = require('twitter-api-v2');

// Initialize the Twitter API client with your credentials
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,               // Your Twitter API key
    appSecret: process.env.TWITTER_API_SECRET_KEY,     // Your Twitter API secret key
    accessToken: process.env.TWITTER_ACCESS_TOKEN,     // Your Twitter access token
    accessSecret: process.env.TWITTER_ACCESS_SECRET    // Your Twitter access token secret
});

const rwClient = twitterClient.readWrite;  // Initialize the read/write client

// Function to post a tweet
const postTweet = async (tweetText) => {
    try {
        const tweet = await rwClient.v2.tweet(tweetText);  // Post a tweet
        console.log('Tweet successfully posted:', tweet.data);
        return tweet.data;
    } catch (error) {
        console.error('Error posting tweet:', error.message);
        throw error;  // Rethrow the error to handle it in the calling function
    }
};

module.exports = { postTweet };
