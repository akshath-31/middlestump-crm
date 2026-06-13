import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyzeCampaign, confirmCampaign, getCampaignSummary } from '../api/client';
import { useCampaignStats } from '../hooks/useCampaignStats';
import { RecommendationCard } from '../components/campaign/RecommendationCard';
import { LiveStatsPanel } from '../components/campaign/LiveStatsPanel';

export function Campaign() {
  const location = useLocation();
  const presetGoal = location.state?.presetGoal || '';
  
  const [goal, setGoal] = useState(presetGoal);
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState('idle'); // idle, analyzing, recommendation_shown, confirming, firing, live_tracking, completed
  const [recommendation, setRecommendation] = useState(null);
  const [campaignId, setCampaignId] = useState(null);
  const [summary, setSummary] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  const { data: stats, isComplete } = useCampaignStats(campaignId, state === 'live_tracking');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state, stats]);

  // Auto-submit if preset goal is provided
  useEffect(() => {
    if (presetGoal && state === 'idle') {
      handleAnalyze(presetGoal);
    }
  }, [presetGoal, state]);

  // Handle completion
  useEffect(() => {
    if (state === 'live_tracking' && isComplete) {
      setState('completed');
      setMessages(prev => [...prev, { role: 'system', content: 'Generating final summary...' }]);
      
      getCampaignSummary(campaignId).then(res => {
        setSummary(res.summary);
        setMessages(prev => prev.filter(m => m.content !== 'Generating final summary...').concat({
          role: 'ai',
          type: 'summary',
          content: res.summary
        }));
      }).catch(err => {
        setMessages(prev => prev.filter(m => m.content !== 'Generating final summary...').concat({
          role: 'ai',
          content: 'Failed to generate summary.'
        }));
      });
    }
  }, [isComplete, state, campaignId]);

  const handleAnalyze = async (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setGoal('');
    setState('analyzing');
    
    try {
      const rec = await analyzeCampaign(text);
      console.log('API Response (analyzeCampaign):', rec);
      setRecommendation(rec);
      setState('recommendation_shown');
      setMessages(prev => [...prev, { role: 'ai', type: 'recommendation', data: rec }]);
    } catch (err) {
      console.error('API Error (analyzeCampaign):', err);
      setState('idle');
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Something went wrong analyzing your data. Please try again.',
        retryGoal: text 
      }]);
    }
  };

  const handleConfirm = async () => {
    setState('confirming');
    setMessages(prev => [...prev, { role: 'system', content: `Firing campaign to ${recommendation.actual_reach} shoppers via ${recommendation.channel}...` }]);
    
    try {
      const res = await confirmCampaign(recommendation.campaign_id);
      setCampaignId(recommendation.campaign_id);
      setState('live_tracking');
      setMessages(prev => [...prev, { role: 'ai', type: 'live_tracking' }]);
    } catch (err) {
      setState('recommendation_shown');
      setMessages(prev => [...prev, { role: 'ai', content: 'Failed to launch campaign. Please try again.' }]);
    }
  };

  const handleEdit = () => {
    setState('idle');
    setRecommendation(null);
  };

  const suggestions = [
    "Re-engage lapsed club players before the season",
    "Increase revenue from high-value shoppers",
    "Win back academy coaches who haven't ordered in 3 months"
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-text-primary">AI Campaign Builder</h1>
        <p className="text-sm text-text-secondary">Describe your goal. The AI handles the rest.</p>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-t-lg overflow-y-auto p-6 flex flex-col shadow-sm">
        {state === 'idle' && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-8">What's your marketing goal today?</h2>
            <div className="flex flex-col space-y-3 w-full">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAnalyze(s)}
                  className="bg-surface2 hover:bg-border text-sm font-medium text-text-secondary py-3 px-6 rounded-full transition-colors text-left"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.role === 'user' && (
                  <div className="bg-sidebar text-white py-3 px-5 rounded-[20px] rounded-tr-[4px] max-w-[70%] shadow-sm">
                    {m.content}
                  </div>
                )}
                {m.role === 'system' && (
                  <div className="text-sm text-text-muted italic flex items-center bg-surface2 px-4 py-2 rounded-full">
                    {m.content}
                    {state === 'confirming' && (
                      <div className="ml-3 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                )}
                {m.role === 'ai' && m.type === 'recommendation' && (
                  <RecommendationCard 
                    recommendation={m.data} 
                    onConfirm={handleConfirm} 
                    onEdit={handleEdit}
                    isConfirming={state === 'confirming'}
                  />
                )}
                {m.role === 'ai' && m.type === 'live_tracking' && (
                  <LiveStatsPanel stats={stats} recommendation={recommendation} />
                )}
                {m.role === 'ai' && m.type === 'summary' && (
                  <div className="bg-surface border border-border py-4 px-6 rounded-lg max-w-3xl whitespace-pre-wrap text-sm text-text-primary shadow-sm border-l-4 border-l-primary">
                    <h4 className="font-bold mb-2 flex items-center"><span className="mr-2">✨</span>Campaign Summary</h4>
                    {m.content}
                  </div>
                )}
                {m.role === 'ai' && !m.type && m.content && (
                  <div className="bg-surface2 text-text-primary py-3 px-5 rounded-[20px] rounded-tl-[4px] max-w-[70%]">
                    <div>{m.content}</div>
                    {m.retryGoal && (
                      <button 
                        onClick={() => handleAnalyze(m.retryGoal)}
                        className="mt-3 bg-white border border-border text-sm font-semibold px-4 py-2 rounded-md hover:bg-surface2 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Retry Goal
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {state === 'analyzing' && (
              <div className="flex items-center text-sm text-text-secondary font-medium bg-surface2 px-4 py-2 rounded-full self-start">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Analyzing your shopper base...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-surface border-x border-b border-border rounded-b-lg p-4 shrink-0 shadow-sm relative">
        <div className="relative">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(goal)}
            placeholder={state === 'completed' ? "Start a new campaign..." : "Describe your marketing goal..."}
            disabled={['analyzing', 'confirming', 'live_tracking'].includes(state)}
            className="w-full bg-surface2 border border-border rounded-full py-4 pl-6 pr-14 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleAnalyze(goal)}
            disabled={!goal.trim() || ['analyzing', 'confirming', 'live_tracking'].includes(state)}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
