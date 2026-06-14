import React, { useState } from 'react';
import { 
  MessageCircle, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Mail, 
  Code2, 
  ChevronDown, 
  Sparkles 
} from 'lucide-react';

const CircularBadge = ({ number }) => (
  <div className="w-6 h-6 rounded-full bg-primary-light text-primary font-semibold text-xs flex items-center justify-center shrink-0">
    {number}
  </div>
);

export function RecommendationCard({ recommendation, onConfirm, onEdit, isConfirming }) {
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(recommendation?.channel || 'whatsapp');

  if (!recommendation) return null;

  const segment = recommendation.segment || {};
  
  const countConditions = (seg) => {
    let count = 0;
    if (seg.filter_tags?.length > 0) count++;
    if (seg.shopper_types?.length > 0) count++;
    if (seg.min_spend !== null && seg.min_spend !== undefined) count++;
    if (seg.min_days_since_order !== null && seg.min_days_since_order !== undefined) count++;
    if (seg.max_days_since_order !== null && seg.max_days_since_order !== undefined) count++;
    return count;
  };

  const getChannelIcon = (ch, className) => {
    if (ch === 'whatsapp') return <MessageCircle className={className} />;
    if (ch === 'sms') return <MessageSquare className={className} />;
    if (ch === 'email') return <Mail className={className} />;
    return <MessageCircle className={className} />;
  };

  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'sms', label: 'SMS' },
    { id: 'email', label: 'Email' }
  ];

  const allChecksPassed = recommendation.pre_send_checks?.every(c => c.passed);

  return (
    <div className="bg-surface rounded-xl border border-border/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)] w-full max-w-3xl mb-6">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center text-sm font-bold text-text-primary mb-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 mr-2" /> AI PROPOSED PLAN
          </div>
          <span className="bg-surface2 text-text-secondary px-3 py-1 rounded-full text-xs font-semibold">Ready</span>
        </div>
        <h3 className="font-serif font-bold text-3xl text-text-primary mb-1">{recommendation.campaign_name || 'Unnamed Campaign'}</h3>
        <p className="text-text-secondary italic">"{recommendation.goal || 'Goal not specified'}"</p>
      </div>

      <div className="px-6 pb-6 space-y-8">
        {/* SECTION 1 - AUDIENCE */}
        <div className="border-t border-border/50 pt-6">
          <h4 className="text-sm font-bold flex items-center mb-4 text-text-primary uppercase tracking-wide">
            <CircularBadge number="1" /><span className="ml-3">Audience</span>
          </h4>
          <div className="flex justify-between items-start gap-6 mb-4">
            <div className="w-[60%]">
              <p className="text-text-primary font-medium text-lg leading-snug mb-4">
                {recommendation.reasoning || 'Targeted segment of shoppers.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {segment.filter_tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center bg-surface2 text-text-secondary px-3 py-1 rounded-full border border-border text-sm font-medium whitespace-nowrap">
                    <MapPin className="w-3 h-3 mr-1.5" />
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
                {segment.shopper_types?.map(type => (
                  <span key={type} className="inline-flex items-center bg-surface2 text-text-secondary px-3 py-1 rounded-full border border-border text-sm font-medium whitespace-nowrap">
                    <Users className="w-3 h-3 mr-1.5" />
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-[40%] bg-primary-light border border-primary/20 rounded-xl p-5 text-center shadow-sm">
              <div className="font-serif text-[42px] font-bold text-primary leading-none mb-2">
                {recommendation.actual_reach || 0}
              </div>
              <div className="text-[11px] font-bold text-text-secondary mb-1 uppercase tracking-wide">
                shoppers in segment
              </div>
            </div>
          </div>

          {/* Derived filter */}
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <button 
              onClick={() => setFilterExpanded(!filterExpanded)}
              className="w-full flex items-center justify-between p-3 bg-surface hover:bg-surface2 transition-colors text-sm font-medium text-text-secondary"
            >
              <div className="flex items-center">
                <Code2 className="w-4 h-4 mr-2" /> Derived filter · {countConditions(segment)} conditions
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${filterExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${filterExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-surface2 p-4 font-mono text-xs text-text-secondary space-y-1">
                {segment.filter_tags?.length > 0 && <div>tags CONTAINS {JSON.stringify(segment.filter_tags)}</div>}
                {segment.shopper_types?.length > 0 && <div>shopper_type IN {JSON.stringify(segment.shopper_types)}</div>}
                {segment.min_spend && <div>total_spend &gt;= {segment.min_spend}</div>}
                {segment.min_days_since_order && <div>days_since_order &gt;= {segment.min_days_since_order}</div>}
                {segment.max_days_since_order && <div>days_since_order &lt;= {segment.max_days_since_order}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 - MESSAGE */}
        <div>
          <h4 className="text-sm font-bold flex items-center mb-4 text-text-primary uppercase tracking-wide">
            <CircularBadge number="2" /><span className="ml-3">Message</span>
          </h4>
          
          <div className="flex space-x-2 mb-4 bg-surface2 p-1 rounded-lg inline-flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedChannel(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedChannel === tab.id 
                    ? 'bg-surface shadow-sm text-text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {getChannelIcon(tab.id, "w-4 h-4 mr-2")}
                {tab.label}
                {recommendation.channel === tab.id && (
                  <Sparkles className="w-3 h-3 ml-2 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-primary-light rounded-xl p-5 border border-primary/20">
            <div className="text-xs text-text-muted mb-2">
              to [Shopper Name] · [City]
            </div>
            <div className="text-text-primary text-sm whitespace-pre-wrap leading-relaxed">
              {recommendation.message_previews?.[selectedChannel] || recommendation.message_preview || 'No message available for this channel.'}
            </div>
          </div>
        </div>

        {/* SECTION 3 - RECOMMENDED CHANNEL */}
        <div>
          <h4 className="text-sm font-bold flex items-center mb-4 text-text-primary uppercase tracking-wide">
            <CircularBadge number="3" /><span className="ml-3">Recommended Channel</span>
          </h4>
          <div className="bg-surface2 border border-border/70 rounded-xl p-5">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface text-text-primary flex items-center justify-center mr-3 border border-border">
                {getChannelIcon(recommendation.channel, "w-5 h-5")}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-bold text-lg text-text-primary capitalize mr-2">{recommendation.channel}</span>
                  <span className="bg-primary-light text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">AI Pick</span>
                </div>
              </div>
            </div>
            <p className="text-text-secondary text-sm">
              {recommendation.channel_reasoning || 'Best channel for this audience based on historical interaction data.'}
            </p>
          </div>
        </div>

        {/* SECTION 4 - PRE-SEND CHECKS */}
        <div>
          <h4 className="text-sm font-bold flex items-center mb-4 text-text-primary uppercase tracking-wide">
            <CircularBadge number="4" /><span className="ml-3">Pre-Send Checks</span>
          </h4>
          <div className="bg-surface border border-border/70 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
              <div className="flex items-center font-bold text-text-primary">
                <CheckCircle className="w-5 h-5 mr-2 text-primary" /> Pre-send checks
              </div>
              {allChecksPassed ? (
                <span className="text-xs text-text-secondary">all clear</span>
              ) : (
                <span className="text-xs text-amber font-semibold">review needed</span>
              )}
            </div>
            <div className="space-y-4">
              {recommendation.pre_send_checks?.map((check, idx) => (
                <div key={idx} className="flex items-start">
                  {check.passed ? (
                    <CheckCircle className="w-4 h-4 mr-3 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-3 text-amber shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-sm text-text-primary">{check.label}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{check.detail}</div>
                  </div>
                </div>
              ))}
              {(!recommendation.pre_send_checks || recommendation.pre_send_checks.length === 0) && (
                <div className="text-sm text-text-muted">Checks not available.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-5 bg-surface2 border-t border-border/70 rounded-b-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-text-muted">
          Human-in-the-loop. Nothing sends without your approval.
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button 
            onClick={onEdit}
            disabled={isConfirming}
            className="px-6 bg-surface hover:bg-surface2 border border-border text-text-primary font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50 text-sm"
          >
            Refine
          </button>
          <button 
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-6 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50 text-sm flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isConfirming ? 'Launching...' : 'Launch campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
