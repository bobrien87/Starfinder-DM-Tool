import React from 'react';

export default function SectionHeader({ title, className = "", children }) {
  return (
    <h3 className={className}>
      {title}
      {children}
    </h3>
  );
}
