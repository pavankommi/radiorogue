import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import MainListComponent from '@/components/MainListComponent';
import NewsComponent from '@/components/NewsComponent';
import HashtagsComponent from '@/components/HashtagsComponent';

interface Blog {
    _id: string;
    title: string;
    heading: string;
    slug: string;
    shortSummary: string;
    createdAt: string;
    image: string;
    content: string;
    author: string;
    categories: string[];
}

interface NewsItem {
    _id: string;
    title: string;
    description: string;
    url: string;
    image: string;
    publishedAt: string;
    source: string;
}

interface CategoryPageProps {
    blogs: Blog[];
    newsItems: NewsItem[];
    currentPage: number;
    hasMore: boolean;
    category: string;
    pageTitle: string;
    showHashtags?: boolean;  // New prop to conditionally show HashtagsComponent
}

const CategoryPage = ({ blogs, newsItems, currentPage, hasMore, category, pageTitle, showHashtags = false }: CategoryPageProps) => {
    // Determine width classes based on whether hashtags are shown
    const mainListWidthClass = showHashtags ? 'lg:w-2/3' : 'lg:w-2/3';
    const sideComponentWidthClass = showHashtags ? 'lg:w-1/3' : 'lg:w-1/3';

    return (
        <div className="container mx-auto p-1 pt-10 md:pt-24">
            {blogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 w-full text-gray-600 text-center">
                    <p className="text-xl font-semibold mb-2">No blogs in this category yet.</p>
                    <p className="text-sm text-gray-500 mb-4">Looks like we’re out of fresh content here, but don’t worry, we’re cooking up something soon. Stay tuned.</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row mt-4">
                    {/* Main Blog List */}
                    <div className={`w-full ${mainListWidthClass}`}>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {pageTitle.startsWith('%23') ? (
                                <>
                                    <span className="text-red-600 mr-1">#</span>
                                    {pageTitle.slice(3)}
                                </>
                            ) : (
                                pageTitle
                            )}
                        </h2>
                        <MainListComponent blogs={blogs} currentPage={category} />

                        {/* Pagination */}
                        <div className="flex justify-center items-center mt-4">
                            <div className={`flex items-center ${currentPage > 1 ? 'text-blue-500 hover:underline' : 'text-gray-400 cursor-not-allowed'} mr-4`}>
                                {currentPage > 1 ? (
                                    <a href={`?page=${currentPage - 1}`}>
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </a>
                                ) : (
                                    <ChevronLeftIcon className="h-5 w-5" />
                                )}
                            </div>

                            <span className="text-gray-700 mx-2">{currentPage}</span>

                            <div className={`flex items-center ${hasMore ? 'text-blue-500 hover:underline' : 'text-gray-400 cursor-not-allowed'} ml-4`}>
                                {hasMore ? (
                                    <a href={`?page=${currentPage + 1}`}>
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </a>
                                ) : (
                                    <ChevronRightIcon className="h-5 w-5" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Conditional News or Hashtags Component */}
                    <div className={`w-full ${sideComponentWidthClass} m-0 md:m-1`}>
                        {showHashtags ? (
                            <HashtagsComponent />  // Render HashtagsComponent if the page is a hashtag page
                        ) : (
                            <NewsComponent newsItems={newsItems} title="Latest News" subTitle="by Radiorogue" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
