import React from 'react';
import { cn } from './StatCard';

export function StatusBadge({ status }) {
  const statusMap = {
    sent: { bg: 'bg-surface2', text: 'text-text-muted', label: 'Sent' },
    delivered: { bg: 'bg-info-light', text: 'text-info', label: 'Delivered' },
    opened: { bg: 'bg-amber-light', text: 'text-amber', label: 'Opened' },
    clicked: { bg: 'bg-primary-light', text: 'text-primary', label: 'Clicked' },
    converted: { bg: 'bg-primary', text: 'text-white', label: 'Converted' },
    failed: { bg: 'bg-danger-light', text: 'text-danger', label: 'Failed' },
    draft: { bg: 'bg-surface2', text: 'text-text-muted', label: 'Draft' },
    completed: { bg: 'bg-primary-light', text: 'text-primary', label: 'Completed' },
    processing: { bg: 'bg-info-light', text: 'text-info', label: 'Processing' }
  };

  const config = statusMap[status?.toLowerCase()] || statusMap.sent;

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap", config.bg, config.text)}>
      {config.label}
    </span>
  );
}
