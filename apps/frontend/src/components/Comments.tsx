'use client';

import React, { useState, useEffect } from 'react';
import { fetchCommentsForBlog, postCommentForBlog } from '@/api/blogService';

interface Comment {
    content: string;
    userId: string;
    createdAt: string;
}

interface CommentsProps {
    slug: string;
}

const COMMENTS_PER_PAGE = 5;

const Comments: React.FC<CommentsProps> = ({ slug }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [displayedComments, setDisplayedComments] = useState<number>(COMMENTS_PER_PAGE);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const loadComments = async () => {
            const fetchedComments = await fetchCommentsForBlog(slug);
            setComments(fetchedComments);
        };

        loadComments();
    }, [slug]);

    const handleLoadMore = () => {
        setDisplayedComments(prev => prev + COMMENTS_PER_PAGE);
    };

    const handleAddComment = async () => {

        if (!newComment.trim()) {
            setError('Please write something to post.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const addedComment = await postCommentForBlog(slug, newComment);

            if (addedComment) {
                const validatedComment = {
                    content: addedComment.content || newComment,
                    userId: addedComment.userId || 'Anonymous',
                    createdAt: addedComment.createdAt || new Date().toISOString(),
                };

                setComments([validatedComment, ...comments]);
                setNewComment('');
                setIsExpanded(false);
            } else {
                setError('Unable to post comment. Please try again.');
            }
        } catch (e) {
            setError('Unable to post comment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.metaKey) {
            handleAddComment();
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return {
            date: d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: d.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const getInitials = (userId: string) => {
        return userId.slice(0, 2).toUpperCase();
    };

    return (
        <section className="mx-auto mt-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Comments {comments.length > 0 && `(${comments.length})`}
                </h2>
            </div>

            {/* Comment Input */}
            <div className="mb-6">
                <div className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => {
                            setNewComment(e.target.value);
                            setIsExpanded(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Add to the discussion..."
                        className={`w-full p-3 border border-gray-200 rounded-lg resize-none text-gray-800
                            focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none
                            transition-all duration-200 ease-in-out placeholder-gray-500
                            ${isExpanded ? 'h-24' : 'h-12'}`}
                    />
                    {isExpanded && (
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Press ⌘ + Enter to post
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddComment}
                                    disabled={loading || !newComment.trim()}
                                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg
                                        hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-colors duration-200"
                                >
                                    {loading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-xs text-red-600">{error}</p>
                )}
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
                <div className="space-y-4 pb-6">
                    {comments.slice(0, displayedComments).map((comment, index) => {
                        const formattedDate = formatDate(comment.createdAt);
                        return (
                            <div key={index} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center flex-shrink-0 border border-red-200">
                                    <span className="text-xs font-medium text-red-600">
                                        {getInitials(comment.userId)}
                                    </span>
                                </div>

                                <div className="flex-1 rounded-lg bg-gray-50 p-3 border border-gray-100">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap mb-1.5">
                                        {comment.content}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <span>{formattedDate.date}</span>
                                        <span>•</span>
                                        <span>{formattedDate.time}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {comments.length > displayedComments && (
                        <div className="text-center pt-2">
                            <button
                                onClick={handleLoadMore}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                                Load More Comments
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-2 pb-6">
                    <p className="text-gray-500 text-sm">No comments yet. Start the discussion!</p>
                </div>
            )}
        </section>
    );
};

export default Comments;