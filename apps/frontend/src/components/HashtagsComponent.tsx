import Link from 'next/link';
import { fetchTopHashtags } from '@/api/blogService';

interface Hashtag {
    _id: string;  // The hashtag text
    count: number;  // The occurrence count of the hashtag
}

const HashtagsComponent = async () => {
    try {
        // Fetch top hashtags from the API
        const topHashtags: Hashtag[] = await fetchTopHashtags();

        // Show the top 10 hashtags without slicing
        const topTenHashtags = topHashtags.slice(0, 10);

        return (
            <div className="w-full p-2 md:p-3 mt-3 md:mt-0 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Top Hashtags</h2>
                <p className="text-xs text-gray-500 mb-6">Trending this week on Radiorogue</p>
                {topTenHashtags && topTenHashtags.length > 0 ? (
                    <ul className="space-y-4">
                        {topTenHashtags.map((hashtag: Hashtag, index: number) => (
                            <li key={hashtag._id}>
                                <Link href={`/hashtag/${encodeURIComponent(hashtag._id)}`}>
                                    <span className="block text-lg font-semibold text-gray-800 hover:text-blue-600">
                                        {hashtag._id}
                                    </span>
                                </Link>
                                <p className="text-xs text-gray-500">{hashtag.count.toLocaleString()} mentions</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No trending hashtags available.</p>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error fetching top hashtags:', error);
        return <p className="text-red-500">Error loading hashtags.</p>;
    }
};

export default HashtagsComponent;
