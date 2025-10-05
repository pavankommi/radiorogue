'use client';

import { downvoteBlog, upvoteBlog } from '@/api/blogService';
import React, { useState } from 'react';

interface VotesComponentProps {
    slug: string;
    initialUpvotes: number;
    initialDownvotes: number;
}

const VotesComponent: React.FC<VotesComponentProps> = ({ slug, initialUpvotes, initialDownvotes }) => {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [loading, setLoading] = useState(false); // Tracks loading state for buttons
    const [error, setError] = useState<string | null>(null); // Tracks any errors

    const handleVote = async (action: 'upvote' | 'downvote') => {
        if (loading) return; // Prevent duplicate actions while a request is in progress
        setLoading(true);
        setError(null); // Clear previous errors

        const voteHandler = action === 'upvote' ? upvoteBlog : downvoteBlog;

        try {
            const result = await voteHandler(slug);
            console.log(result);
            if (result) {
                setUpvotes(result.upvotes);
                setDownvotes(result.downvotes);
            } else {
                setError('Vote failed. Already hit it?');
            }
        } catch (err: any) {
            let backendMessage = 'An error occurred while processing your vote. Please try again.';

            // Attempt to extract backend error message
            if (err instanceof Response) {
                try {
                    const errorResponse = await err.json();
                    backendMessage = errorResponse.error || backendMessage; // Use backend error message if available
                } catch (parseError) {
                    console.error('Error parsing backend response:', parseError);
                }
            }

            setError(backendMessage); // Set the extracted error message
            console.error(`Error during ${action}:`, err);
        } finally {
            setLoading(false); // Reset loading state
        }
    };


    return (
        <div className="flex flex-col items-start space-y-2">
            {/* Buttons for Upvote and Downvote */}
            <div className="flex items-center space-x-4">
                <button
                    className="flex items-center space-x-1 text-sm text-gray-700 hover:text-orange-500"
                    onClick={() => handleVote('upvote')}
                    disabled={loading}
                >
                    🔥 <span>{upvotes}</span>
                </button>
                <button
                    className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-500"
                    onClick={() => handleVote('downvote')}
                    disabled={loading}
                >
                    ❄️ <span>{downvotes}</span>
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default VotesComponent;
