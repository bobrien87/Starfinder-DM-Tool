import React from 'react';

const SingleD4Icon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id="d4lines">
        <rect width="24" height="24" fill="white" />
        <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Tetrahedron Base */}
          <polygon points="12 3, 22 20, 2 20" />
          {/* Internal Isometric Center */}
          <line x1="12" y1="3" x2="12" y2="15" />
          <line x1="22" y1="20" x2="12" y2="15" />
          <line x1="2" y1="20" x2="12" y2="15" />
        </g>
      </mask>
    </defs>
    <polygon points="12 3, 22 20, 2 20" mask="url(#d4lines)" />
  </svg>
);

export default SingleD4Icon;
