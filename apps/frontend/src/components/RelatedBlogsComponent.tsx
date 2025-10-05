import { formatDistanceToNow } from 'date-fns'; // Import date-fns for formatting dates
import { fetchRelatedBlogs } from '@/api/blogService'; // Import the API call function

interface Blog {
    _id: string;
    heading: string;
    slug: string;
    shortSummary: string;
    createdAt: string;
}

interface RelatedBlog {
    blog: Blog;
}

// Function to format the date and handle invalid date strings
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Unknown time"; // Fallback if the date is invalid
    }
    return formatDistanceToNow(date, { addSuffix: true });
};

const RelatedBlogsComponent = async ({ slug }: { slug: string }) => {
    try {
        // Fetch related blogs from the API using the provided slug
        const relatedBlogs: RelatedBlog[] = await fetchRelatedBlogs(slug);

        return (
            <div className="w-full p-2 md:p-3 border border-gray-200 min-h-[200px]">
                <h2 className="text-xl font-bold text-gray-800">Related Blogs</h2>
                <p className="text-xs text-gray-500 mb-6">You might also like</p>
                {relatedBlogs && relatedBlogs.length > 0 ? (
                    <ul className="space-y-4">
                        {relatedBlogs.map(({ blog }: RelatedBlog) => (
                            <li key={blog._id}>
                                <a
                                    href={`/search/${blog.slug}`}
                                    className="block text-lg font-semibold text-gray-800 hover:text-blue-600"
                                >
                                    {blog.heading}
                                </a>
                                <p className="text-gray-600 mt-1">{blog.shortSummary}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Published {blog.createdAt ? formatRelativeTime(blog.createdAt) : "Unknown time"}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No related blogs available.</p>
                )}
            </div>
        );
    } catch (error) {
        console.error('Error fetching related blogs:', error);
        return (
            <div className="w-full p-2 md:p-3 border border-gray-200 min-h-[200px]">
                <p className="text-red-500">Error loading related blogs.</p>
            </div>
        );
    }
};

export default RelatedBlogsComponent;
