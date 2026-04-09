import React from 'react';

const SingleD20Icon = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <defs>
            <mask id="d20lines">
                <rect width="24" height="24" fill="white" />
                <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2, 21 7, 21 17, 12 22, 3 17, 3 7" />
                    <polygon points="7 9, 17 9, 12 17" />
                    <line x1="12" y1="2" x2="7" y2="9" />
                    <line x1="12" y1="2" x2="17" y2="9" />
                    <line x1="3" y1="7" x2="7" y2="9" />
                    <line x1="21" y1="7" x2="17" y2="9" />
                    <line x1="3" y1="17" x2="7" y2="9" />
                    <line x1="3" y1="17" x2="12" y2="17" />
                    <line x1="21" y1="17" x2="17" y2="9" />
                    <line x1="21" y1="17" x2="12" y2="17" />
                    <line x1="12" y1="22" x2="12" y2="17" />
                </g>
            </mask>
        </defs>
        <polygon points="12 2, 21 7, 21 17, 12 22, 3 17, 3 7" mask="url(#d20lines)" />
    </svg>
);

export default SingleD20Icon;
