import React from 'react';

const SingleD12Icon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id="d12lines">
        <rect width="24" height="24" fill="white" />
        <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Decagon */}
          <polygon points="12,1 18,3 22,9 22,15 18,21 12,23 6,21 2,15 2,9 6,3" />
          {/* Inner Pentagon */}
          <polygon points="12,7 17,10 15,16 9,16 7,10" />
          {/* Connecting Lines */}
          <line x1="12" y1="7" x2="12" y2="1" />
          <line x1="17" y1="10" x2="22" y2="9" />
          <line x1="15" y1="16" x2="18" y2="21" />
          <line x1="9" y1="16" x2="6" y2="21" />
          <line x1="7" y1="10" x2="2" y2="9" />
        </g>
      </mask>
    </defs>
    <polygon points="12,1 18,3 22,9 22,15 18,21 12,23 6,21 2,15 2,9 6,3" mask="url(#d12lines)" />
  </svg>
);

export default SingleD12Icon;
