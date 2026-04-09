import React from 'react';

export default function ActionIcon({ action, className = "h-[1em] w-auto inline-block align-middle" }) {
    if (!action) return null;
    
    const normalized = action.toString().toLowerCase().trim();

    if (normalized === '1' || normalized === 'single') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
                <polygon points="5.25 8.75, 8.5 12, 5.25 15.25, 2 12" />
                <polygon points="10.5 12, 6.25 7.75, 12 2, 22 12, 12 22, 6.25 16.25" />
            </svg>
        );
    }

    if (normalized === '2' || normalized === 'two') {
        return (
            <svg viewBox="0 0 38 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
                <polygon points="5.25 8.75, 8.5 12, 5.25 15.25, 2 12" />
                <polygon points="10.5 12, 6.25 7.75, 12 2, 22 12, 12 22, 6.25 16.25" />
                <polygon points="24 12, 19.75 7.75, 25.5 2, 35.5 12, 25.5 22, 19.75 16.25" />
            </svg>
        );
    }

    if (normalized === '3' || normalized === 'three') {
        return (
            <svg viewBox="0 0 52 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
                <polygon points="5.25 8.75, 8.5 12, 5.25 15.25, 2 12" />
                <polygon points="10.5 12, 6.25 7.75, 12 2, 22 12, 12 22, 6.25 16.25" />
                <polygon points="24 12, 19.75 7.75, 25.5 2, 35.5 12, 25.5 22, 19.75 16.25" />
                <polygon points="37.5 12, 33.25 7.75, 39 2, 49 12, 39 22, 33.25 16.25" />
            </svg>
        );
    }

    if (normalized === 'free' || normalized === 'f') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M 12 2 L 22 12 L 12 22 L 2 12 Z M 12 4.5 L 19.5 12 L 12 19.5 L 4.5 12 Z" fillRule="evenodd" />
                <polygon points="8.5 10, 10.5 12, 8.5 14, 6.5 12" />
            </svg>
        );
    }

    if (normalized === 'reaction' || normalized === 'r') {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M 21 11 C 21 5, 14 2, 8 3 C 3 4, 1 9, 3 14 L 0 14 L 8 21 L 13 14 L 9 15 C 6 13, 5 9, 8 6 C 11 4, 16 4, 19 7 C 20.5 8.5, 21 10, 21 11 Z" />
            </svg>
        );
    }

    return null;
}
