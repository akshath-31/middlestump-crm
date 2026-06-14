import React from 'react';
import { MapPin } from 'lucide-react';

export function SegmentBadge({ segment }) {
  if (!segment) return null;
  
  return (
    <span className="inline-flex items-center bg-primary-light text-primary px-3 py-1 rounded-full border border-primary/20 text-xs font-medium whitespace-nowrap">
      <MapPin className="w-3 h-3 mr-1" />
      {segment.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
