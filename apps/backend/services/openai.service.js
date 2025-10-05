const axios = require('axios');

const generateBlogContent = async (prompt) => {
    const apiKey = process.env.OPENAI_API_KEY; // Your OpenAI API Key
    const url = process.env.OPENAI_API_URL;

    try {
        const response = await axios.post(url, {
            model: 'gpt-4o-mini', // Use gpt-4o-mini model
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that returns responses only in raw JSON format.'
                },
                {
                    role: 'user',
                    content: prompt // The prompt you pass in, which is properly structured to generate a blog
                }
            ],
            max_tokens: 7000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Function to sanitize content by removing newlines and backticks
        function sanitizeHTML(content) {
            return content.replace(/[\n\r]+/g, '')  // Remove newlines
                .replace(/\+/g, '')       // Remove plus signs
                .replace(/`/g, '');       // Remove backticks
        }

        // Fetch and sanitize the content from OpenAI response
        const content = sanitizeHTML(response.data.choices[0].message.content.trim());

        // Enhanced logging for debugging
        // console.log("Raw content from OpenAI:", content);

        // Ensure the response is valid JSON
        if (content.startsWith('{') && content.endsWith('}')) {
            try {
                const blogContent = JSON.parse(content); // Safely parse the JSON
                return blogContent;
            } catch (jsonParseError) {
                console.error('JSON parsing error:', jsonParseError);
                throw new Error('Failed to parse JSON from OpenAI response');
            }
        } else {
            throw new Error('Invalid JSON format received from OpenAI');
        }
    } catch (error) {
        console.error('Error generating blog content:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate blog content');
    }
};

module.exports = { generateBlogContent };
