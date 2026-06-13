import React from 'react';

export function SegmentBadge({ segment }) {
  if (!segment) return null;
  
  return (
    <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap">
      {segment.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
