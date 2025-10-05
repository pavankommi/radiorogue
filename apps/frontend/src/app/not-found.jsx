'use client'; // Marks this as a client component

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
            <h1 className="text-7xl md:text-8xl font-bold text-[#DC2626] text-center mb-2">
                404
            </h1>
            <p className="text-base text-gray-600 text-center mb-2">
                Well, this is awkward. No page here.
            </p>
            <Link
                href="/"
                title="Return to the homepage"
                className="text-[#DC2626] font-medium underline hover:text-[#b21f1f] transition duration-200"
            >
                Get me outta here!
            </Link>
        </div>
    );
}
