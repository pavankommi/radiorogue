import { Metadata } from 'next';
import { fetchBlogsBySearchQuery } from '@/api/blogService';
import MainListComponent from '@/components/MainListComponent';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Search from '@/components/Search';

export const metadata: Metadata = {
    title: "Search - Radiorogue",
    description: "Search through the best articles and blogs on Radiorogue. Find what you're looking for with our powerful search feature.",
};

interface SearchPageProps {
    searchParams: Promise<{ query?: string; page?: string }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || '';
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const blogs = await fetchBlogsBySearchQuery(query, currentPage, 20);
    const hasMore = Array.isArray(blogs) && blogs.length === 20;

    return (
        <div className="container mx-auto p-1 pt-16 md:pt-24">

            {query && (
                <p className="text-gray-600 pt-3 pb-2">Search results for &quot;{query}&quot;</p>
            )}


            {Array.isArray(blogs) && blogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 pt-6">
                    <p className="text-gray-500 text-lg">Came up empty—throw in something bold.</p>

                    {/* Centered Search Bar */}
                    <div className="w-full">
                        <Search
                            placeholder="Search it here!"
                        // className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
                        />
                    </div>
                </div>

            ) : (
                <>
                    <MainListComponent blogs={blogs || []} currentPage="search" />

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-4">
                        {/* Previous Page */}
                        <div className={`flex items-center ${currentPage > 1 ? 'text-blue-500 hover:underline' : 'text-gray-400 cursor-not-allowed'} mr-4`}>
                            {currentPage > 1 ? (
                                <a href={`?query=${query}&page=${currentPage - 1}`}>
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </a>
                            ) : (
                                <ChevronLeftIcon className="h-5 w-5" />
                            )}
                        </div>

                        {/* Current Page Number */}
                        <span className="text-gray-700 mx-2">{currentPage}</span>

                        {/* Next Page */}
                        <div className={`flex items-center ${hasMore ? 'text-blue-500 hover:underline' : 'text-gray-400 cursor-not-allowed'} ml-4`}>
                            {hasMore ? (
                                <a href={`?query=${query}&page=${currentPage + 1}`}>
                                    <ChevronRightIcon className="h-5 w-5" />
                                </a>
                            ) : (
                                <ChevronRightIcon className="h-5 w-5" />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchPage;
