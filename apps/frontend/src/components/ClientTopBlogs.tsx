'use client';

import dynamic from 'next/dynamic';

const TopBlogsComponent = dynamic(() => import('@/components/TopBlogsComponent'), {
  ssr: false,
});

export default TopBlogsComponent;
