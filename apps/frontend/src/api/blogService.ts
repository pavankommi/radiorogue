import { getFingerprint } from "@/utils/fingerprintUtil";

// Define API endpoints
const BASE_URL = 'https://api.radiorogue.com/api';

const BLOGS_API = `${BASE_URL}/blogs`;
const TRENDS_API = `${BASE_URL}/trends`;
const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets';

// Helper function to handle API calls
const fetchData = async (url: string) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null; // Return null to indicate failure
    }
};

// Fetch all blogs with categories
export const fetchAllBlogsWithCategories = async (fetchOptions = {}) => {
    const url = `${BLOGS_API}/all-blogs`;

    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch blogs by category
export const fetchBlogsByCategory = async (category: string, page: number, limit: number) => {
    const url = `${BLOGS_API}?category=${category}&page=${page}&limit=${limit}`;
    const data = await fetchData(url);
    return Array.isArray(data?.blogs) ? data.blogs : []; // Safely return blogs array or empty
};

// Fetch blogs by search query
export const fetchBlogsBySearchQuery = async (query: string, page: number, limit: number) => {
    const url = `${BLOGS_API}/search?query=${query}&page=${page}&limit=${limit}`;
    const data = await fetchData(url);
    return Array.isArray(data?.blogs) ? data.blogs : []; // Safely return blogs array or empty
};

// Fetch blog by slug
export const fetchBlogBySlug = async (category: string, slug: string) => {
    const url = `${BLOGS_API}/${category}/${slug}`;
    const data = await fetchData(url);
    return data || {}; // Return data or empty object on failure
};

// Fetch top blogs
export const fetchTopBlogs = async () => {
    const url = `${BLOGS_API}/top-blogs`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch top headlines
export const fetchTopHeadlines = async () => {
    const url = `${TRENDS_API}/headlines`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch saved tech news
export const fetchSavedTechNews = async () => {
    const url = `${TRENDS_API}/tech-news`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch top cryptocurrencies
export const fetchTopCryptos = async () => {
    const url = `${COINGECKO_API}?vs_currency=usd&order=market_cap_desc&per_page=20&page=1`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch GNews headlines
export const fetchGNewsHeadlines = async () => {
    const url = `${TRENDS_API}/gnews-headlines`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch Rogues news
export const fetchRoguesNews = async () => {
    const url = `${TRENDS_API}/rogues-news`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch money news
export const fetchMoneyNews = async () => {
    const url = `${TRENDS_API}/money-news`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch sports news
export const fetchSportsNews = async () => {
    const url = `${TRENDS_API}/sports-news`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch related blogs by slug
export const fetchRelatedBlogs = async (slug: string) => {
    const url = `${BLOGS_API}/related-blogs/${slug}`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch top hashtags
export const fetchTopHashtags = async (limit = 10) => {
    const url = `${BLOGS_API}/top-hashtags?limit=${limit}`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return empty array on failure
};

// Fetch blogs by hashtag with pagination
export const fetchBlogsByHashtag = async (hashtag: string, page: number, limit: number) => {
    console.log(hashtag)
    const url = `${BLOGS_API}/blogs-by-hashtag?hashtag=${hashtag}&page=${page}&limit=${limit}`;
    console.log(url)
    const data = await fetchData(url);
    return Array.isArray(data?.blogs) ? data.blogs : []; // Return blogs array or empty
};

export const fetchFeaturedBlog = async () => {
    const url = `${BLOGS_API}/featured`;
    const data = await fetchData(url);
    return data || null; // Return the featured blog or null if not found
};

// Fetch total blog-category URLs count
export const fetchBlogCount = async (): Promise<number> => {
    const url = `${BLOGS_API}/blogs-count`;
    const data = await fetchData(url);
    return data?.count || 0; // Safely return the count or 0 if unavailable
};

// Fetch paginated blogs for sitemap
export const fetchPaginatedBlogs = async (skip = 0, limit = 500): Promise<any[]> => {
    const url = `${BLOGS_API}/all-blogs?skip=${skip}&limit=${limit}`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Safely return an array or empty
};

// Helper function to handle API requests
const handleVote = async (slug: string, action: 'upvote' | 'downvote') => {
    const url = `${BLOGS_API}/${slug}/vote/${action}`;

    try {
        // Generate the visitorId using the fingerprint utility
        const visitorId = await getFingerprint();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies or other credentials are sent
            body: JSON.stringify({ visitorId }), // Include visitorId in the body
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Returns the updated upvotes and downvotes
    } catch (error) {
        console.error(`Error ${action}ing blog "${slug}":`, error);
        return null; // Return null to indicate failure
    }
};

// Upvote a blog
export const upvoteBlog = async (slug: string) => {
    return handleVote(slug, 'upvote');
};

// Downvote a blog
export const downvoteBlog = async (slug: string) => {
    return handleVote(slug, 'downvote');
};

// Fetch comments for a specific blog
export const fetchCommentsForBlog = async (slug: string): Promise<any[]> => {
    const url = `${BLOGS_API}/${slug}/comments`;
    const data = await fetchData(url);
    return Array.isArray(data) ? data : []; // Return comments array or empty
};

// Post a comment to a specific blog
export const postCommentForBlog = async (slug: string, content: string): Promise<any> => {
    const url = `${BLOGS_API}/${slug}/comments`;

    try {
        // Generate the visitorId using the fingerprint utility
        const visitorId = await getFingerprint();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies or other credentials are sent
            body: JSON.stringify({ content, visitorId }), // Include content and visitorId
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the API response
    } catch (error) {
        console.error(`Error posting comment to blog "${slug}":`, error);
        return null; // Return null to indicate failure
    }
};

