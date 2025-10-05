const snoowrap = require('snoowrap');
const { generateBlogContent } = require('./openai.service');

// Initialize the Reddit API client with your credentials
const redditClient = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,      // Your Reddit app's user agent
    clientId: process.env.REDDIT_CLIENT_ID,       // Your Reddit API client ID
    clientSecret: process.env.REDDIT_CLIENT_SECRET, // Your Reddit API client secret
    username: process.env.REDDIT_USERNAME,        // Your Reddit username
    password: process.env.REDDIT_PASSWORD         // Your Reddit password
});

const redditBlogPrompt = (blog) => `
Write a short, engaging Reddit post based on the following blog: "${JSON.stringify(blog)}".
- Restrict **emojis to the title only**, ensuring they are relevant to the blog's context. Examples:
  - 🚨 for breaking news or alerts.
  - 🎉 for celebrations or achievements.
  - 💡 for new ideas or innovation.
  - 🔥 for trending or exciting topics.
  - 🤖 for technology or AI-related content.
- Tailor the tone to be **fun, relatable, and casual**, appealing to a Gen Z audience while still engaging broader audiences.
- Write a concise post between **150–250 words** with:
  - A **title** that grabs attention with relevant emojis (e.g., "AI is Quietly Running the World—Are You Ready? 🤖🔥").
  - A **hook** in the body to pique interest.
  - A **teaser**: One or two engaging lines or snippets from the blog content.
  - A **clear call-to-action (CTA)** encouraging users to click the link or share their thoughts, like:
    - “**Don’t miss out! [Read more here](blog_url).**”
    - “**Curious? Dive into all the details here: [Click now](blog_url).**”
    - “**Catch the full story and more insights: [Read here](blog_url).**”
- Keep it playful but include enough substance to pique interest. Use language like:
  - “No cap, this is wild. 🧢”
  - “Y’all, this had me shook. 😱”
  - “So… are we all just gonna ignore this?! 👀”
- Ensure the body content is **clean and emoji-free**, focusing on readability and professionalism while maintaining a conversational tone.
- Based on the provided blog and categories, suggest a **flair** for the post from common subreddit flairs (e.g., "Breaking News," "Game Preview," "Politics," "Tech News," "Opinion").
- Based on the blog's content and category, suggest an **array of 10 subreddits** where this post would be most relevant.
- Ensure these subreddits are highly relevant to the blog's topic and audience. Prioritize popular subreddits that allow general users to post.
- Use relevant **keywords or phrases** naturally to make the post SEO-friendly.

Return the response as a JSON object with the following structure:
{
  "title": "<Engaging Reddit Post Title with Contextually Relevant Emojis>",
  "subreddits": ["<Suggested subreddit 1>", "<Suggested subreddit 2>", ..., "<Suggested subreddit 10>"],
  "content": "<Markdown-friendly post content with hook, teaser, playful language, CTA, and link (no emojis in the body)>",
  "categories": ["<chosen category>", "<optional second category>"],
  "callToAction": "Read more here: [yourwebsite.com/slug]("${JSON.stringify(blog.url)}")"
   "flair": "<Suggested flair based on the category or content>"
}
Important: Return only the JSON object without any code block formatting, markdown, or backticks.
`;

const getSubredditFlairs = async (subreddit) => {
    try {
        const flairs = await redditClient.getSubreddit(subreddit).getUserFlairTemplates();
        // console.log(`Available flairs for ${subreddit}:`, flairs);
        return flairs;
    } catch (error) {
        console.error(`Error fetching flairs for subreddit ${subreddit}:`, error.message);
        return [];
    }
};

const postToReddit = async ({ subreddit, title, text, url, flair }) => {
    if (!subreddit || !title) {
        throw new Error('Missing required fields: subreddit or title');
    }

    try {
        // Construct post options
        let postOptions = { title };
        if (text) {
            postOptions.text = text; // Self-post with text
        } else if (url) {
            postOptions.url = url; // Link post with URL
        } else {
            throw new Error('Either text or url must be provided.');
        }

        // Include flair ID if provided
        if (flair?.id) {
            postOptions.flair_id = flair.id;
        }

        // Attempt to post
        const post = await redditClient.getSubreddit(subreddit).submitSelfpost(postOptions);
        console.log('Reddit post successful:', post.url);
        return post;
    } catch (error) {
        console.error('Error Details:', {
            subreddit,
            title,
            text: text || 'N/A',
            url: url || 'N/A',
            flair: flair || 'N/A',
            error: error.message,
        });
        throw error;
    }
};
const postBlogToReddit = async (savedBlog) => {
    const trend = {
        title: savedBlog.heading,
        shortSummary: savedBlog.shortSummary,
        contentSnippet: savedBlog.content.slice(0, 500),
        url: `https://radiorogue.com/${savedBlog.categories[0] || 'search'}/${savedBlog.slug}`,
        category: savedBlog.categories[0] || 'radio-rogue',
    };

    try {
        // Generate content for Reddit post
        const redditPrompt = redditBlogPrompt(trend);
        const redditContent = await generateBlogContent(redditPrompt);

        console.log('Generated Reddit content:', redditContent);

        const { subreddits, title, content, flair, callToAction } = redditContent;

        if (!subreddits || subreddits.length === 0 || !title) {
            throw new Error('Reddit content is incomplete or subreddits are missing.');
        }

        redditContent.content += `\n\n${callToAction}`;

        for (const subreddit of subreddits) {
            try {
                console.log(`Attempting to post to subreddit: ${subreddit}`);

                // Fetch available flairs for the subreddit
                const flairs = await getSubredditFlairs(subreddit);

                // Match flair text with a flair ID if possible
                const matchedFlair = flairs.find((f) => f.flair_text === flair?.text) || null;

                // Attempt to post
                const redditPost = await postToReddit({
                    subreddit,
                    title,
                    text: content,
                    url: trend.url,
                    flair: matchedFlair ? { id: matchedFlair.flair_template_id } : null,
                });

                console.log('Posted successfully to Reddit:', redditPost.url);
                return redditPost; // Exit loop on success
            } catch (error) {
                console.warn(`Failed to post to subreddit ${subreddit}:`, error.message);
            }
        }

        // If no subreddit succeeds
        throw new Error('Failed to post to any suggested subreddit.');
    } catch (error) {
        console.error('Error posting to Reddit:', error.message);
        throw error;
    }
};

module.exports = { postToReddit, postBlogToReddit };