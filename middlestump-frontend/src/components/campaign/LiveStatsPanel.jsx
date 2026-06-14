import React from 'react';

export function LiveStatsPanel({ stats }) {
  if (!stats) return null;

  const total_sent = stats.total_sent ?? 0;
  const total_delivered = stats.total_delivered ?? 0;
  const total_opened = stats.total_opened ?? 0;
  const total_clicked = stats.total_clicked ?? 0;
  const total_converted = stats.total_converted ?? 0;
  const total_failed = stats.total_failed ?? 0;

  const openRate = total_delivered > 0 
    ? ((total_opened / total_delivered) * 100).toFixed(1) 
    : '0.0';

  const clickRate = total_opened > 0 
    ? ((total_clicked / total_opened) * 100).toFixed(1) 
    : '0.0';

  const convRate = total_clicked > 0 
    ? ((total_converted / total_clicked) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="bg-surface rounded-xl border border-border/70 shadow-sm w-full max-w-3xl mb-6 p-6">
      <h3 className="font-serif font-bold text-xl mb-1 flex items-center">
        Campaign firing — tracking live results
        {stats.status !== 'completed' && (
          <span className="ml-3 flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        )}
      </h3>
      
      <div className="mt-6 mb-8 flex justify-between items-center text-center">
        <div className="flex-1">
          <div className="text-xs uppercase text-text-muted font-bold mb-2">Sent</div>
          <div className="font-serif text-3xl font-bold">{total_sent}</div>
        </div>
        <div className="text-text-muted">→</div>
        <div className="flex-1">
          <div className="text-xs uppercase text-info font-bold mb-2">Delivered</div>
          <div className="font-serif text-3xl font-bold text-info">{total_delivered}</div>
        </div>
        <div className="text-text-muted">→</div>
        <div className="flex-1">
          <div className="text-xs uppercase text-amber font-bold mb-2">Opened</div>
          <div className="font-serif text-3xl font-bold text-amber">{total_opened}</div>
        </div>
        <div className="text-text-muted">→</div>
        <div className="flex-1">
          <div className="text-xs uppercase text-primary font-bold mb-2">Clicked</div>
          <div className="font-serif text-3xl font-bold text-primary">{total_clicked}</div>
        </div>
        <div className="text-text-muted">→</div>
        <div className="flex-1">
          <div className="text-xs uppercase text-primary font-bold mb-2">Converted</div>
          <div className="font-serif text-3xl font-bold text-primary">{total_converted}</div>
        </div>
      </div>

      <div className="bg-surface2 p-4 rounded-md flex justify-around items-center mb-4">
        <div><span className="text-text-muted text-sm mr-2">Open Rate:</span><span className="font-bold">{openRate}%</span></div>
        <div><span className="text-text-muted text-sm mr-2">Click Rate:</span><span className="font-bold">{clickRate}%</span></div>
        <div><span className="text-text-muted text-sm mr-2">Conv Rate:</span><span className="font-bold">{convRate}%</span></div>
        {total_failed > 0 && <div><span className="text-danger text-sm mr-2">Failed:</span><span className="font-bold text-danger">{total_failed}</span></div>}
      </div>

      <div className="text-center text-sm text-text-secondary border-t border-border pt-4 mt-4">
        vs Predicted: Open {((stats.predicted_open_rate || 0) * 100).toFixed(1)}% | Click {((stats.predicted_click_rate || 0) * 100).toFixed(1)}% | Conv {stats.predicted_conversions ?? 0}
      </div>
    </div>
  );
}
