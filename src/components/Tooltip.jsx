import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ content, children, className = "" }) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        setCoords({ x: e.clientX, y: e.clientY });
    };

    if (!content) return <div className={className}>{children}</div>;

    const tooltipNode = isVisible && typeof document !== 'undefined' ? (
        <div 
            className="fixed z-[99999] w-64 p-3 bg-surface-container-highest border border-primary/40 shadow-[0_4px_30px_rgba(0,0,0,0.8)] pointer-events-none backdrop-blur-md rounded"
            style={{ 
                left: Math.min(coords.x + 15, typeof window !== 'undefined' ? window.innerWidth - 270 : coords.x) + 'px', 
                top: Math.min(coords.y + 15, typeof window !== 'undefined' ? window.innerHeight - 150 : coords.y) + 'px' 
            }}
        >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
            <div className="text-[11px] text-secondary leading-relaxed normal-case tracking-normal font-sans font-medium">
                {content}
            </div>
        </div>
    ) : null;

    return (
        <div 
            className={`inline-block ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onMouseMove={handleMouseMove}
        >
            {children}
            {tooltipNode && createPortal(tooltipNode, document.body)}
        </div>
    );
}
