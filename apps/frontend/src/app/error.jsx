'use client'; // Marks this as a client component

export default function Error({ error }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
            <h1 className="text-3xl md:text-5xl font-bold text-[#DC2626] text-center mb-4">
                500 - Internal Server Error
            </h1>
            <p className="text-base md:text-lg text-gray-800 text-center mb-4">
                Something went wrong on our end. Please check back later.
            </p>

            {/* Display error details in development mode */}
            {process.env.NODE_ENV === 'development' && (
                <pre className="text-sm md:text-base text-gray-600 text-center break-words w-full max-w-md overflow-x-auto">
                    {error.message}
                </pre>
            )}
        </div>
    );
}
