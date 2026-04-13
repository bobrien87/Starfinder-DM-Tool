import React from 'react';

const SingleD10Icon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id="d10lines">
        <rect width="24" height="24" fill="white" />
        <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Shield Silhouette */}
          <polygon points="12,2 19,5 22,10 22,17 17,22 12,23 7,22 2,17 2,10 5,5" />
          {/* Internal Radial Focus Group */}
          <line x1="12" y1="14" x2="12" y2="2" />
          <line x1="12" y1="14" x2="22" y2="10" />
          <line x1="12" y1="14" x2="17" y2="22" />
          <line x1="12" y1="14" x2="7" y2="22" />
          <line x1="12" y1="14" x2="2" y2="10" />
        </g>
      </mask>
    </defs>
    <polygon points="12,2 19,5 22,10 22,17 17,22 12,23 7,22 2,17 2,10 5,5" mask="url(#d10lines)" />
  </svg>
);

export default SingleD10Icon;
