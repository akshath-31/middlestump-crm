import React, { useState, useEffect } from 'react';
import { getCampaignCommunications } from '../../api/client';
import { StatusBadge } from '../ui/StatusBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    })
  } catch {
    return '-'
  }
}

export function DeliveryLog({ campaignId }) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCampaignCommunications(campaignId)
      .then(data => {
        if (mounted) {
          setCommunications(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [campaignId]);

  if (loading) return <div className="p-4 text-center text-text-muted">Loading logs...</div>;
  if (!communications.length) return <div className="p-4 text-center text-text-muted">No communications found.</div>;

  const totalPages = Math.ceil(communications.length / limit);
  const paginated = communications.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface2 text-text-muted uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-semibold">Shopper Name</th>
              <th className="px-6 py-3 font-semibold">Phone</th>
              <th className="px-6 py-3 font-semibold">Channel</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Sent At</th>
              <th className="px-6 py-3 font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-surface2">
                <td className="px-6 py-4 font-medium text-text-primary">{c.shoppers?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-text-secondary">{c.shoppers?.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-text-secondary uppercase text-xs font-semibold">{c.channel}</td>
                <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                <td className="px-6 py-4 text-text-secondary">{formatDate(c.created_at)}</td>
                <td className="px-6 py-4 text-text-secondary">{formatDate(c.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-surface2 rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-surface2 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
