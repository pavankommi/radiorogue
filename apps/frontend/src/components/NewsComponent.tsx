// src/components/NewsComponent.tsx

import { FC } from 'react';
import Head from 'next/head';

interface NewsItem {
    _id: string;
    title: string;
    description: string;
    url: string;
    image: string;
    publishedAt: string;
    source: string;
}

interface NewsComponentProps {
    newsItems: NewsItem[];
    title: string;
    subTitle: string;
    customClass?: string;
}

const NewsComponent: FC<NewsComponentProps> = ({ newsItems, title, subTitle, customClass = "" }) => {
    // console.log(newsItems)
    return (
        <>
            {/* Add SEO meta tags */}
            <Head>
                <title>{title} | Radiorogue</title>
                <meta name="description" content={subTitle} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={subTitle} />
            </Head>

            <div className="w-full md:p-2 md:border-l border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-xs text-gray-500 mb-5">{subTitle}</p>
                {newsItems && newsItems.length > 0 ? (
                    <ul className="space-y-6">
                        {newsItems.map((news: NewsItem) => (
                            <li key={news._id}>
                                <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                                    {news.image && (
                                        <img
                                            src={news.image}
                                            alt={news.title}
                                            className="w-full h-auto"
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="p-1 md:p-2">
                                        <a
                                            href={news.url}
                                            className="text-lg font-semibold text-gray-800 hover:text-blue-600 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {news.title}
                                        </a>
                                        <p className="text-gray-600 mt-1 md:mt-2">
                                            {news.description?.length > 150
                                                ? `${news.description.substring(0, 150)}...`
                                                : news.description}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1 md:mt-2">
                                            {news.source}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No news available.</p>
                )}
            </div>
        </>
    );
};

export default NewsComponent;
