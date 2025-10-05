import { fetchTopBlogs } from '@/api/blogService';

interface Blog {
    _id: string;
    heading: string;
    shortSummary: string;
    slug: string; // Slug is now required
    views: number;
    categories: string[];
}

const TopBlogsComponent = async () => {
    try {
        // Fetch top blogs from the API
        const topBlogs: Blog[] = await fetchTopBlogs();

        // Show the top 10 blogs without slicing
        const topTenBlogs = topBlogs.slice(0, 10);

        return (
            <div className="w-full p-2 md:p-3 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Our Top 10</h2>
                <p className="text-xs text-gray-500 mb-6">Most viewed this week</p>
                {topTenBlogs && topTenBlogs.length > 0 ? (
                    <ul className="space-y-4">
                        {topTenBlogs.map((blog: Blog, index: number) => (
                            <li key={blog._id}>
                                <a
                                    href={`/${blog.categories[0] || 'search'}/${blog.slug}`}
                                    className="block text-lg font-semibold text-gray-800 hover:text-blue-600"
                                >
                                    <span className="font-bold">#{index + 1}</span> {blog.heading}
                                </a>
                                <p className="text-gray-600 mt-1 text-sm">{blog.shortSummary}</p>
                                <p className="text-xs text-gray-500 mt-1">{blog.views.toLocaleString()} views</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No top blogs available.</p>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error fetching top blogs:', error);
        return <p className="text-red-500">Error loading top blogs.</p>;
    }
};

export default TopBlogsComponent;
