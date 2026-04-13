import React from 'react';

export default function ActionIcon({ action, className = "h-[1em] w-auto inline-block align-middle" }) {
  if (!action) return null;
  
  const normalized = action.toString().toLowerCase().trim();

  if (normalized.includes(' to ')) {
    const parts = normalized.split(' to ');
    return (
      <span className="inline-flex items-center gap-1.5 align-middle">
        <ActionIcon action={parts[0].trim()} className={className} />
        <span className="text-primary font-headline text-[0.85em] font-[600] uppercase pt-[1px]">to</span>
        <ActionIcon action={parts[1].trim()} className={className} />
      </span>
    );
  }

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
      <svg viewBox="0 0 36 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <polygon points="5.25 8.75, 8.5 12, 5.25 15.25, 2 12" />
        <polygon points="10.5 12, 6.25 7.75, 12 2, 22 12, 12 22, 6.25 16.25" />
        <polygon points="24 12, 20.4 8.4, 25.3 3.5, 33.8 12, 25.3 20.5, 20.4 15.6" />
      </svg>
    );
  }

  if (normalized === '3' || normalized === 'three') {
    return (
      <svg viewBox="0 0 46 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <polygon points="5.25 8.75, 8.5 12, 5.25 15.25, 2 12" />
        <polygon points="10.5 12, 6.25 7.75, 12 2, 22 12, 12 22, 6.25 16.25" />
        <polygon points="24 12, 20.4 8.4, 25.3 3.5, 33.8 12, 25.3 20.5, 20.4 15.6" />
        <polygon points="35.8 12, 32.8 9, 36.8 5, 43.8 12, 36.8 19, 32.8 15" />
      </svg>
    );
  }

  if (normalized === 'free' || normalized === 'f') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter" className={className} xmlns="http://www.w3.org/2000/svg">
        <polygon points="5.25 8.75, 8.5 12, 5.25 15.25, 2 12" />
        <polygon points="10.5 12, 6.25 7.75, 12 2, 22 12, 12 22, 6.25 16.25" />
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
