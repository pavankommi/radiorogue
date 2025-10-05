'use client';

import dynamic from 'next/dynamic';

const RelatedBlogsSkeleton = () => (
  <div className="w-full p-2 md:p-3 border border-gray-200 h-[300px] animate-pulse">
    <div className="h-6 bg-gray-200 mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-200 mb-4 w-1/2"></div>
    {[1, 2, 3].map((_, index) => (
      <div key={index} className="mb-4">
        <div className="h-5 bg-gray-200 w-full mb-2"></div>
        <div className="h-4 bg-gray-200 w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-200 w-1/2"></div>
      </div>
    ))}
  </div>
);

export const VotesComponent = dynamic(() => import('./VotesComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-16 bg-gray-200 animate-pulse">
      <p className="text-center text-gray-500 text-sm">Loading reactions...</p>
    </div>
  ),
});

export const RelatedBlogsComponent = dynamic(() => import('./RelatedBlogsComponent'), {
  ssr: false,
  loading: () => <RelatedBlogsSkeleton />,
});

export const LazyFormattedDate = dynamic(() => import('./LazyFormattedDate'), {
  ssr: false,
  loading: () => <span>Loading time...</span>,
});

export const Comments = dynamic(() => import('./Comments'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-32 bg-gray-200 animate-pulse">
      <p className="text-center text-gray-500 text-sm">Loading comments...</p>
    </div>
  ),
});
