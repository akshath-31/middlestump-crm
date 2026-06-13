import React, { useState } from 'react';
import { useShoppers } from '../hooks/useShoppers';
import { SegmentBadge } from '../components/ui/SegmentBadge';

export function Shoppers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  
  const { data, isLoading } = useShoppers({ page, limit: 50, search, shopper_type: type });

  const getLastOrderColor = (dateString) => {
    if (!dateString) return 'text-text-muted';
    const days = (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24);
    if (days < 30) return 'text-primary font-semibold';
    if (days < 90) return 'text-amber font-semibold';
    return 'text-danger font-semibold';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-text-primary">Shoppers</h1>
          <span className="bg-surface2 text-text-secondary px-2.5 py-1 rounded-full text-xs font-semibold">
            {data?.total_count || 0} total
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="px-4 py-2 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors w-64"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select 
            className="px-4 py-2 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors bg-white"
            value={type}
            onChange={e => { setType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="guest">Guest</option>
            <option value="registered">Registered</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-y-auto flex-1 relative">
          {isLoading && <div className="absolute inset-0 bg-surface/50 flex items-center justify-center text-text-muted z-10">Loading shoppers...</div>}
          <table className="w-full text-sm text-left">
            <thead className="bg-surface2 text-text-muted uppercase text-[11px] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">City</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold text-right">Orders</th>
                <th className="px-6 py-3 font-semibold text-right">Total Spend</th>
                <th className="px-6 py-3 font-semibold">Last Order</th>
                <th className="px-6 py-3 font-semibold">Channel</th>
                <th className="px-6 py-3 font-semibold">Tags</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(s => (
                <tr key={s.id} className="border-b border-border hover:bg-surface2 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{s.name}</td>
                  <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{s.city}</td>
                  <td className="px-6 py-4"><span className="bg-surface2 px-2 py-1 rounded text-xs font-semibold uppercase">{s.shopper_type}</span></td>
                  <td className="px-6 py-4 text-right font-medium">{s.total_orders}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{(s.total_spend || 0).toLocaleString('en-IN')}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${getLastOrderColor(s.last_order_date)}`}>
                    {s.last_order_date ? new Date(s.last_order_date).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase">{s.preferred_channel}</td>
                  <td className="px-6 py-4 flex flex-wrap gap-1">
                    {s.tags?.slice(0, 2).map(t => <SegmentBadge key={t} segment={t} />)}
                    {s.tags?.length > 2 && <span className="text-xs text-text-muted ml-1">+{s.tags.length - 2}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data?.total_count > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-white shrink-0">
            <span className="text-sm text-text-muted">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total_count)} of {data.total_count}
            </span>
            <div className="space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-surface2 hover:bg-border rounded text-sm disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button 
                disabled={page * 50 >= data.total_count} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-surface2 hover:bg-border rounded text-sm disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
