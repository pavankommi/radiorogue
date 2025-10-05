import Link from 'next/link';
import Search from './Search';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';

interface Blog {
    _id: string;
    heading: string;
    slug: string;
    shortSummary: string;
    source?: string;
    createdAt: string;
    updatedAt?: string;
    categories: string[];
}

interface MainListComponentProps {
    blogs: Blog[];
    currentPage: string;
}

// Helper function to safely parse a date string
const parseDateString = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

// Helper function to format the relative time
const formatRelativeTime = (dateString: string) => {
    const date = parseDateString(dateString);
    if (!date) return null; // Return null for invalid dates
    return formatDistanceToNow(date, { addSuffix: true });
};

// Helper function to check if updatedAt and createdAt are within 10 minutes
const isSameDateWithin10Minutes = (createdAt: string, updatedAt?: string) => {
    const createdDate = parseDateString(createdAt);
    const updatedDate = parseDateString(updatedAt || '');
    if (!createdDate || !updatedDate) return false; // Handle invalid dates

    const difference = differenceInMinutes(updatedDate, createdDate);
    return difference < 10;
};

const MainListComponent: React.FC<MainListComponentProps> = ({ blogs, currentPage }) => {
    const isRoguesPickPage = ['rogues-pick', 'whats-hot', 'search'].includes(currentPage);
    return (
        <div>
            {/* Centered Search Bar */}
            <div className="flex justify-center w-full mb-3">
                <div className="w-full"> {/* Centered and padded */}
                    <Search placeholder="Search it here!" />
                </div>
            </div>

            {/* Conditionally render grid layout for rogues-pick */}
            <div className={isRoguesPickPage ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                {/* Blog List */}
                {blogs.map((blog) => {
                    const createdAtText = formatRelativeTime(blog.createdAt);
                    return (
                        <div key={blog._id} className="flex flex-col space-y-1">
                            <Link href={`/${currentPage || blog.categories[0]}/${blog.slug}`}>
                                <h2 className="text-lg md:text-xl font-bold text-black hover:text-blue-600 transition-all duration-150 ease-in-out">
                                    {blog.heading}
                                </h2>
                            </Link>
                            <p className="text-gray-600">{blog.shortSummary}</p>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{createdAtText ? `Posted ${createdAtText}` : "This date's gone rogue."}</span>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default MainListComponent;
