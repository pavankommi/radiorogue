'use client';

import dynamic from 'next/dynamic';

const Loader = () => (
  <div className="top-4 left-0 w-full text-center">
    <p className="text-lg font-bold text-gray-800">Cooking content!</p>
  </div>
);

const HashtagsComponent = dynamic(() => import('@/components/HashtagsComponent'), {
  ssr: false,
  loading: () => <Loader />,
});

export default HashtagsComponent;
