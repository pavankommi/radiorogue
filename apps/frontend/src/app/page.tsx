import { Metadata } from 'next';
import Link from 'next/link';
import sanitizeHtml from 'sanitize-html';
import { fetchTopBlogs, fetchBlogsByCategory, fetchFeaturedBlog } from '@/api/blogService';
import { SEO } from '@/components/SEO';
import Search from '@/components/Search';
import HashtagsComponent from '@/components/ClientHashtags';
import TopBlogsComponent from '@/components/ClientTopBlogs';

export const metadata: Metadata = {
  title: 'Radiorogue - Bold Blogs in Tech, Sports, and Culture',
  description: 'Explore real-time, bold, and unfiltered blogs on technology, sports, and culture. Stay ahead with Radiorogue.',
  metadataBase: new URL('https://radiorogue.com'),
  openGraph: {
    title: 'Radiorogue - Bold Blogs in Tech, Sports, and Culture',
    description: 'Discover the latest trends and insights with Radiorogue. Bold, real-time, and unfiltered blogs you can trust.',
    url: 'https://www.radiorogue.com',
    type: 'website',
    siteName: 'Radiorogue',
    images: ['https://radiorogue.com/images/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Radiorogue - Bold Blogs in Tech, Sports, and Culture',
    description: 'Stay bold and unfiltered with Radiorogue. Get the latest blogs on technology, sports, and culture.',
    images: ['https://radiorogue.com/images/logo.png'],
    site: '@fknradiorogue',
  },
  alternates: {
    canonical: 'https://www.radiorogue.com/whats-hot',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface Blog {
  _id: string;
  heading: string;
  shortSummary: string;
  slug: string;
  tldr: string;
  createdAt: string;
  image?: string;
  author: string;
  authorUrl?: string;
  categories: string[];
}

interface FeaturedBlog extends Blog {
  metaDescription: string;
  content: string;
}

const BlogCard = ({ blog, category }: { blog: Blog; category: string }) => (
  <div key={blog._id} className="pb-0 sm:pb-1">
    <Link href={`/${category}/${blog.slug}`}>
      <h3
        className="text-xl font-semibold text-gray-900 mb-1 transition-colors duration-300 hover:text-red-600"
        tabIndex={0}
      >
        {blog.heading}
      </h3>
    </Link>
    <p className="text-sm text-gray-600 mb-2">{blog.shortSummary}</p>
  </div>
);

const BlogSection = ({
  title,
  blogs,
  category,
}: {
  title: string;
  blogs: Blog[];
  category: string;
}) => (
  <section id={category} className="mt-8">
    <h2 className="text-2xl font-bold text-left text-gray-900 mb-3 inline-block">
      <span className="text-red-600 mr-1 text-3xl">#</span>
      {title}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog._id} blog={blog} category={category} />
      ))}
    </div>
    <div className="mt-2 text-left">
      <Link href={`/${category}`} className="inline-block text-blue-700 hover:underline text-lg font-bold">
        Check Out {title}
      </Link>
    </div>
  </section>
);

const FeaturedBlog = ({ blog }: { blog: FeaturedBlog | null }) => {
  if (!blog) return <p className="text-gray-500">No featured story available at the moment.</p>;

  // Use TLDR if available, otherwise use sanitized content
  const displayContent = blog.tldr
    ? sanitizeHtml(blog.tldr)
    : sanitizeHtml(blog.content.slice(0, 1500));

  return (
    <div key={blog._id} className="border-l-4 border-red-600 pl-4 mb-4 relative bg-gray-50 rounded-r-lg p-4 shadow-sm">

      <div className="prose max-w-none text-black overflow-hidden relative">
        <div className='text-2xl font-bold text-left text-gray-900 inline-block'>{blog.heading}</div>
        <div
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        ></div>
      </div>
      <Link
        href={`/${blog.categories[0] || 'search'}/${blog.slug}`}
        className="text-red-700 hover:underline inline-block font-semibold text-lg"
      >
        Read Full Story
      </Link>
    </div>
  );
};

const HomePage = async () => {
  try {
    const [featuredBlog, whatshotBlogs, sportBlogs] = await Promise.all([
      fetchFeaturedBlog(),
      fetchBlogsByCategory('whats-hot', 1, 6),
      fetchBlogsByCategory('sport', 1, 6),
    ]);

    return (
      <>
        <SEO breadcrumbs={[{ name: 'Home', url: 'https://radiorogue.com/' }]} blogs={whatshotBlogs} />
        <section id="hero" className="container mx-auto mt-2 p-1 py-10 md:pt-28 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Search placeholder="Search it here!" />
            <h1 className="text-xs font-bold text-left text-gray-900 mt-3 mb-0">Today&apos;s Pick</h1>
            <FeaturedBlog blog={featuredBlog} />
            <BlogSection title="What’s Hot" blogs={whatshotBlogs} category="whats-hot" />
            <BlogSection title="Sport" blogs={sportBlogs} category="sport" />
          </div>
          <div className="lg:col-span-1">
            <HashtagsComponent />
            <div className="mt-4">
              <TopBlogsComponent />
            </div>
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error('Error loading homepage:', error);
    return <p className="text-red-500">Error loading content. Please try again later.</p>;
  }
};

export default HomePage;
