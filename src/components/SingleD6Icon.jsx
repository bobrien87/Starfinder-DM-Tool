import React from 'react';

const SingleD6Icon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id="d6lines">
        <rect width="24" height="24" fill="white" />
        <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Isometric Hexagon (Cube bounds) */}
          <polygon points="12 3, 21 8, 21 18, 12 23, 3 18, 3 8" />
          {/* Center Isoline Radiants */}
          <line x1="12" y1="13" x2="12" y2="23" />
          <line x1="12" y1="13" x2="3" y2="8" />
          <line x1="12" y1="13" x2="21" y2="8" />
        </g>
      </mask>
    </defs>
    <polygon points="12 3, 21 8, 21 18, 12 23, 3 18, 3 8" mask="url(#d6lines)" />
  </svg>
);

export default SingleD6Icon;
