import React from 'react';
import { SegmentBadge } from '../ui/SegmentBadge';

export function RecommendationCard({ recommendation, onConfirm, onEdit, isConfirming }) {
  if (!recommendation) return null;

  return (
    <div className="bg-surface rounded-lg border-l-4 border-l-primary border-t border-r border-b border-border shadow-sm w-full max-w-3xl mb-6">
      <div className="p-5 border-b border-border">
        <h3 className="font-bold text-lg text-text-primary mb-2">{recommendation.campaign_name || 'Unnamed Campaign'}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Target:</span>
          <SegmentBadge segment={recommendation.target_segment_name || recommendation.segment?.filter_tags?.[0] || 'Shoppers'} />
          <span className="text-sm text-text-secondary ml-2">Channel:</span>
          <span className="bg-surface2 text-text-secondary px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap">
            {(recommendation.channel || 'unknown').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <h4 className="text-sm font-bold flex items-center mb-1 text-text-primary">💡 Opportunity</h4>
          <p className="text-sm text-text-secondary">{recommendation.opportunity || 'No opportunity description provided.'}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold flex items-center mb-1 text-text-primary">📊 Why It Matters</h4>
          <p className="text-sm text-text-secondary">{recommendation.why_it_matters || 'No explanation provided.'}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold flex items-center mb-1 text-text-primary">👥 Audience</h4>
          <p className="text-sm text-text-secondary font-medium">{recommendation.actual_reach || 0} shoppers matched</p>
          <p className="text-sm text-text-muted">{recommendation.audience_reasoning || ''}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold flex items-center mb-2 text-text-primary">💬 Message Preview</h4>
          <div className="bg-surface2 p-4 rounded-md italic text-sm text-text-secondary">
            {recommendation.message_preview || 'No message preview available.'}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold flex items-center mb-2 text-text-primary">📈 Predicted Performance</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-surface2 p-3 rounded-md text-center">
              <div className="text-xs text-text-muted uppercase font-semibold">Open</div>
              <div className="font-bold text-primary">{((recommendation.predicted_open_rate || 0) * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-surface2 p-3 rounded-md text-center">
              <div className="text-xs text-text-muted uppercase font-semibold">Click</div>
              <div className="font-bold text-primary">{((recommendation.predicted_click_rate || 0) * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-surface2 p-3 rounded-md text-center">
              <div className="text-xs text-text-muted uppercase font-semibold">Conversions</div>
              <div className="font-bold text-primary">{recommendation.predicted_conversions || 0}</div>
            </div>
            <div className="bg-surface2 p-3 rounded-md text-center border border-primary-light">
              <div className="text-xs text-text-muted uppercase font-semibold">Est. Revenue</div>
              <div className="font-bold text-primary">₹{(recommendation.predicted_revenue || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-surface2 border-t border-border flex flex-col space-y-3">
        <button 
          onClick={onConfirm}
          disabled={isConfirming}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          {isConfirming ? 'Firing Campaign...' : 'Confirm & Fire Campaign'}
        </button>
        <button 
          onClick={onEdit}
          disabled={isConfirming}
          className="w-full bg-transparent hover:bg-surface border border-border text-text-secondary font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          Edit Goal
        </button>
      </div>
    </div>
  );
}
