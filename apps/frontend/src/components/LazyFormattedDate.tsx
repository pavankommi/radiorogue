import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LazyFormattedDateProps {
    createdAt: Date | string;  // Ensure it can be a Date or string
}

// Helper function to format the relative time
const formatRelativeTime = (dateInput: Date | string) => {
    const date = new Date(dateInput);

    // Ensure the date is valid before formatting
    if (isNaN(date.getTime())) {
        return "This date's gone rogue.";  // Return the Radiorogue-style message for invalid date
    }

    return `Posted ${formatDistanceToNow(date, { addSuffix: true })}`;
};

const LazyFormattedDate: React.FC<LazyFormattedDateProps> = ({ createdAt }) => {
    return (
        <span className="text-gray-500 text-sm">{formatRelativeTime(createdAt)}</span>
    );
};

export default LazyFormattedDate;
