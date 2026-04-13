import React from 'react';

const SingleD8Icon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id="d8lines">
        <rect width="24" height="24" fill="white" />
        <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Diamond Silhouette */}
          <polygon points="12,2 22,12 12,22 2,12" />
          {/* Internal Cross Sectors */}
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </g>
      </mask>
    </defs>
    <polygon points="12,2 22,12 12,22 2,12" mask="url(#d8lines)" />
  </svg>
);

export default SingleD8Icon;
