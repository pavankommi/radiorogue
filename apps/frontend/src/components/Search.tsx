'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    function handleSearch() {
        if (inputValue.trim()) {
            router.push(`/search?query=${encodeURIComponent(inputValue.trim())}`);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }

    return (
        <div className="flex justify-center w-full">
            <div className="relative w-full">
                <input
                    type="text"
                    className="block w-full rounded-full border border-gray-300 py-3 pl-4 pr-12 text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:outline-none text-gray-900"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700 hover:text-blue-900 rounded-full"
                    aria-label="Search"
                >
                    <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
