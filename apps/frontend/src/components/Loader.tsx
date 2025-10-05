'use client';

import { useState, useTransition, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const Loader = () => {
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Start showing the loader when navigation starts
        setLoading(true);

        // When transition completes, stop showing the loader
        startTransition(() => {
            setLoading(false);
        });
    }, [pathname, searchParams]);

    return (isPending || loading) ? (
        <div className="fixed top-0 left-0 w-full z-50 bg-white">
            <div className="h-1 w-full bg-red-600 animate-pulse"></div>
        </div>
    ) : null;
};

export default Loader;
