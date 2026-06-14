import React from 'react';
import { cn } from './StatCard';

export function StatusBadge({ status }) {
  const statusMap = {
    sent: { bg: 'bg-surface2', text: 'text-text-muted', label: 'Sent', border: 'border-border' },
    delivered: { bg: 'bg-info-light', text: 'text-info', label: 'Delivered', border: 'border-info/20' },
    opened: { bg: 'bg-amber-light', text: 'text-amber', label: 'Opened', border: 'border-amber/20' },
    clicked: { bg: 'bg-primary-light', text: 'text-primary', label: 'Clicked', border: 'border-primary/20' },
    converted: { bg: 'bg-primary', text: 'text-white', label: 'Converted', border: 'border-primary' },
    failed: { bg: 'bg-danger-light', text: 'text-danger', label: 'Failed', border: 'border-danger/20' },
    draft: { bg: 'bg-surface2', text: 'text-text-muted', label: 'Draft', border: 'border-border' },
    completed: { bg: 'bg-primary-light', text: 'text-primary', label: 'Completed', border: 'border-primary/20' },
    processing: { bg: 'bg-info-light', text: 'text-info', label: 'Processing', border: 'border-info/20' }
  };

  const config = statusMap[status?.toLowerCase()] || statusMap.sent;

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap", config.bg, config.text, config.border)}>
      {config.label}
    </span>
  );
}
