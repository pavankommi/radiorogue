import { fetchTopHeadlines } from '@/api/blogService';

interface Headline {
    _id: string;
    title: string;
    description: string;
    url: string;
    image: string;
    publishedAt: string;
    source: string;
}

const TopHeadlinesComponent = async () => {
    try {
        // Fetch top headlines from the API
        const topHeadlines: Headline[] = await fetchTopHeadlines();

        // Debugging step to confirm the response
        // console.log('Fetched top headlines in component:', topHeadlines);

        return (
            <div className="w-full p-2 md:p-3 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Top Stories</h2>
                <p className="text-xs text-gray-500 mb-4">by newsapi.org</p>
                {topHeadlines && topHeadlines.length > 0 ? (
                    <ul className="space-y-4">
                        {topHeadlines.map((headline: Headline) => (
                            <li key={headline._id} className="text-black">
                                <a href={headline.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                    {headline.title}
                                </a>
                                <p className="text-gray-600 mt-1">{headline.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No top headlines available.</p>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error fetching top headlines:', error);
        return <p>Error loading top headlines.</p>;
    }
};

export default TopHeadlinesComponent;
