'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Plus, Search, FileText, Eye, Archive, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';

const STATUS_LABELS: Record<string, string> = { SS_DRAFT: 'Draft', SS_UNDER_REVIEW: 'Under Review', SS_APPROVED: 'Approved', SS_PUBLISHED: 'Published', SS_ARCHIVED: 'Archived', SS_EXPIRED: 'Expired' };
const STATUS_COLORS: Record<string, string> = { SS_DRAFT: 'bg-yellow-100 text-yellow-800', SS_UNDER_REVIEW: 'bg-blue-100 text-blue-800', SS_APPROVED: 'bg-green-100 text-green-800', SS_PUBLISHED: 'bg-emerald-100 text-emerald-800', SS_ARCHIVED: 'bg-gray-100 text-gray-800', SS_EXPIRED: 'bg-red-100 text-red-800' };

interface SSItem { id: string; title: string; slug: string; summary: string | null; type: string; status: string; applicationMode: string; publishedAt: string | null; createdAt: string; category: { name: string } | null; department: { name: string } | null; }

export default function SchemeServicesPage() {
  return <AdminPageShell sectionTitle="Schemes & Services">{() => <Content />}</AdminPageShell>;
}

function Content() {
  const router = useRouter();
  const [items, setItems] = useState<SSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page)); params.set('limit', '10');
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const data: any = await apiClient(`/scheme-services?${params.toString()}`);
      setItems(data.data || []); setTotalPages(data.meta?.totalPages || 1);
    } catch {} finally { setLoading(false); }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { apiClient('/scheme-services/summary').then((d: any) => setSummary(d)).catch(() => {}); }, []);

  const handleAction = async (id: string, action: string) => {
    try { await apiClient(`/scheme-services/${id}/${action}`, { method: 'POST' }); fetchData(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Schemes & Services</h1><p className="text-sm text-muted-foreground mt-1">Manage government schemes and citizen services</p></div>
        <button onClick={() => router.push('/scheme-services/new')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"><Plus className="h-4 w-4" />Create New</button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{summary.total}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Schemes</p><p className="text-2xl font-bold text-blue-600">{summary.schemes}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Services</p><p className="text-2xl font-bold text-purple-600">{summary.services}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Published</p><p className="text-2xl font-bold text-green-600">{summary.published}</p></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm"><option value="">All Types</option><option value="SCHEME">Schemes</option><option value="SERVICE">Services</option></select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm"><option value="">All Status</option>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-lg border bg-muted/50 animate-pulse" />)}</div> : items.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No schemes or services found</p></div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => router.push(`/scheme-services/${item.id}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${item.type === 'SCHEME' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{item.type}</span>
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>{STATUS_LABELS[item.status]}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.category?.name || 'Uncategorized'}{item.department ? ` · ${item.department.name}` : ''}</p>
              </div>
              <div className="flex items-center gap-1">
                {item.status === 'SS_DRAFT' && <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'submit-review'); }} className="p-2 rounded-md hover:bg-blue-50 text-blue-600 text-xs">Submit</button>}
                {item.status === 'SS_APPROVED' && <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'publish'); }} className="p-2 rounded-md hover:bg-green-50 text-green-600"><Eye className="h-4 w-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 hover:bg-muted">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 hover:bg-muted">Next</button>
        </div>
      )}
    </div>
  );
}
