import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as cheerio from 'cheerio';
import { BoltIcon } from '@heroicons/react/16/solid';
import { VotesComponent, RelatedBlogsComponent, LazyFormattedDate, Comments } from './ClientBlogComponents';

interface BlogDetailProps {
    blog: Blog | null;
    currentPage: string;
}

interface Blog {
    heading: string;
    slug: string;
    articleAuthor: string;
    metaDescription: string;
    tldr?: string;
    source: string;
    content: string;
    createdAt: Date;
    views: number;
    categories: string[];
    upvotes: number;
    downvotes: number;
}

// Reusable UI Components
const TLDRBadge = ({ className = '' }) => (
    <div className={`
        flex items-center 
        bg-red-50 border border-red-200 
        rounded-sm px-3 py-1 
        w-fit 
        transition-colors 
        hover:bg-red-100 
        ${className}
    `}>
        <BoltIcon className="w-4 h-4 mr-2 text-red-600" />
        <span className="text-xs font-medium text-red-800">TL;DR</span>
    </div>
);

const MoreOptionsIcon = () => (
    <div className="flex items-center">
        <div className="relative group">
            <span className="
                inline-block 
                bg-red-700 // Darker red for better contrast
                text-white 
                text-xs 
                font-semibold 
                px-2 
                py-1 
                rounded-full 
                uppercase 
                tracking-wider
                hover:bg-red-800 // Darker hover state
                transition-colors
                duration-300
                cursor-pointer
                // Add focus state for accessibility
                focus:outline-none 
                focus:ring-2 
                focus:ring-red-500 
                focus:ring-opacity-50
            ">
                Full Story
            </span>
        </div>
    </div>
);

function calculateReadTime(content?: string): string {
    if (!content) return 'N/A';
    const words = content.split(/\s+/).filter(Boolean).length;
    return `${Math.ceil(words / 200)} minute read`;
}

function transformContent(htmlContent: string | null, hasTldr: boolean): string {
    const content = htmlContent ?? '';
    const $ = cheerio.load(content);

    // If there is a TLDR, replace all <h1> tags with <h2>
    if (hasTldr) {
        $("h1").each((_, h1) => {
            const h1Element = $(h1);
            const h2 = $("<h2></h2>").html(h1Element.html() || '');
            h1Element.replaceWith(h2);
        });
    } else {
        // If no TLDR, replace all subsequent <h1> tags with <h2> (except the first one)
        let firstH1Found = false;
        $("h1").each((_, h1) => {
            const h1Element = $(h1);
            if (firstH1Found) {
                const h2 = $("<h2></h2>").html(h1Element.html() || '');
                h1Element.replaceWith(h2);
            } else {
                firstH1Found = true;
            }
        });
    }

    return $.html();
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blog, currentPage }) => {
    if (!blog || !blog.content) {
        notFound();
    }

    const readingTime = calculateReadTime(blog.content);
    const transformedContent = transformContent(blog.content, !!blog.tldr);

    return (
        <article className="container mx-auto mt-4 pt-10 md:pt-24">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-1">
                <ol className="text-xs font-medium text-gray-500 flex flex-wrap items-center">
                    <li className="whitespace-nowrap">
                        <Link href="/" className="hover:underline">Home</Link>
                        <span className="px-1">/</span>
                    </li>
                    <li className="whitespace-nowrap">
                        <a href={`/${blog.categories[0] || ''}`} className="hover:underline">
                            {currentPage.replace(/^\//, '')}
                        </a>
                        <span className="px-1">/</span>
                    </li>
                    {blog.heading && (
                        <li className="truncate text-ellipsis overflow-hidden max-w-full" title={blog.heading}>
                            {blog.heading}
                        </li>
                    )}
                </ol>
            </nav>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Article Meta */}
                    <div className="text-gray-500 text-xs font-medium">
                        <p>
                            <span>{blog.source}</span>
                            <span className="mx-1">|</span>
                            <span>{readingTime.replace(' ', '\u00A0')}</span>
                        </p>
                    </div>

                    {/* TLDR Section */}
                    {blog.tldr && (
                        <div className="space-y-2">
                            {/* Article Heading */}
                            <h1 className="text-3xl font-bold mb-3 text-black">{blog.heading}</h1>

                            <TLDRBadge />

                            {/* TLDR Content */}
                            <div
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: blog.tldr }}
                            />

                            {/* If TLDR exists, show the details toggle */}
                            <details>
                                <summary className="m-0 p-0 block"><MoreOptionsIcon /></summary>
                                <div
                                    className="prose max-w-none text-black mt-2"
                                    dangerouslySetInnerHTML={{ __html: transformedContent }}
                                />
                            </details>
                        </div>
                    )}

                    {/* If TLDR does not exist, show content normally */}
                    {!blog.tldr && (
                        <div
                            className="prose max-w-none text-black"
                            dangerouslySetInnerHTML={{ __html: transformedContent }}
                        />
                    )}

                    {/* Article Footer */}
                    <footer className="mt-4 text-gray-500 text-xs font-medium">
                        <div className="flex flex-col">
                            <p className="mb-2">
                                <LazyFormattedDate createdAt={blog.createdAt} />
                            </p>
                            <VotesComponent
                                slug={blog.slug}
                                initialUpvotes={blog.upvotes}
                                initialDownvotes={blog.downvotes}
                            />
                        </div>
                    </footer>

                    {/* Comments Section */}
                    <div className="mt-8 border-t border-gray-100">
                        <Comments slug={blog.slug} />
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <RelatedBlogsComponent slug={blog.slug} />
                </aside>
            </section>
        </article>
    );
};

export default BlogDetail;
