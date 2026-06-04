'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Newspaper, Eye, Archive } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

const TYPE_LABELS: Record<string, string> = { PRESS_RELEASE: 'Press Release', MEDIA_COVERAGE: 'Media Coverage', PHOTO_GALLERY_ITEM: 'Photo', VIDEO: 'Video', SPEECH: 'Speech', INTERVIEW: 'Interview', NEWS_UPDATE: 'News Update', CUSTOM_NEWSROOM: 'Custom' };
const STATUS_LABELS: Record<string, string> = { NR_DRAFT: 'Draft', NR_UNDER_REVIEW: 'Under Review', NR_APPROVED: 'Approved', NR_PUBLISHED: 'Published', NR_ARCHIVED: 'Archived' };
const STATUS_COLORS: Record<string, string> = { NR_DRAFT: 'bg-yellow-100 text-yellow-800', NR_UNDER_REVIEW: 'bg-blue-100 text-blue-800', NR_APPROVED: 'bg-green-100 text-green-800', NR_PUBLISHED: 'bg-emerald-100 text-emerald-800', NR_ARCHIVED: 'bg-gray-100 text-gray-800' };

interface NRItem { id: string; title: string; slug: string; summary: string | null; itemType: string; status: string; priority: string; eventDate: string | null; publishedAt: string | null; featuredImageUrl: string | null; category: { name: string } | null; }

export default function NewsroomPage() { return <AdminPageShell sectionTitle="Newsroom">{() => <Content />}</AdminPageShell>; }

function Content() {
  const router = useRouter();
  const [items, setItems] = useState<NRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams(); params.set('page', String(page)); params.set('limit', '10'); if (search) params.set('search', search); if (typeFilter) params.set('itemType', typeFilter); if (statusFilter) params.set('status', statusFilter); const data: any = await apiClient(`/newsroom?${params}`); setItems(data.data || []); setTotalPages(data.meta?.totalPages || 1); } catch {} finally { setLoading(false); }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { apiClient('/newsroom/summary').then((d: any) => setSummary(d)).catch(() => {}); }, []);

  const handleAction = async (id: string, action: string) => { try { await apiClient(`/newsroom/${id}/${action}`, { method: 'POST' }); fetchData(); } catch (e: any) { alert(e.message); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Newsroom</h1><p className="text-sm text-muted-foreground mt-1">Press releases, media coverage, and news updates</p></div>
        <button onClick={() => router.push('/newsroom/new')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"><Plus className="h-4 w-4" />Create</button>
      </div>
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{summary.total}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Press Releases</p><p className="text-2xl font-bold text-blue-600">{summary.pressReleases}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Published</p><p className="text-2xl font-bold text-green-600">{summary.published}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Featured</p><p className="text-2xl font-bold text-purple-600">{summary.featured}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">Categories</p><p className="text-2xl font-bold">{summary.categories}</p></div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm"><option value="">All Types</option>{Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm"><option value="">All Status</option>{Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg border bg-muted/50 animate-pulse" />)}</div> : items.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card"><Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No newsroom items found</p></div>
      ) : (
        <div className="space-y-2">{items.map(item => (
          <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => router.push(`/newsroom/${item.id}`)}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700">{TYPE_LABELS[item.itemType] || item.itemType}</span><h3 className="font-medium text-sm truncate">{item.title}</h3><span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[item.status] || ''}`}>{STATUS_LABELS[item.status]}</span>{item.priority === 'NR_FEATURED' && <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">Featured</span>}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.category?.name || 'Uncategorized'}{item.eventDate ? ` · ${new Date(item.eventDate).toLocaleDateString()}` : ''}</p>
            </div>
            <div className="flex items-center gap-1">
              {item.status === 'NR_APPROVED' && <button onClick={e => { e.stopPropagation(); handleAction(item.id, 'publish'); }} className="p-2 rounded-md hover:bg-green-50 text-green-600"><Eye className="h-4 w-4" /></button>}
              {item.status === 'NR_PUBLISHED' && <button onClick={e => { e.stopPropagation(); handleAction(item.id, 'archive'); }} className="p-2 rounded-md hover:bg-gray-100 text-gray-600"><Archive className="h-4 w-4" /></button>}
            </div>
          </div>
        ))}</div>
      )}
      {totalPages > 1 && <div className="flex justify-center gap-2"><button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50">Prev</button><span className="text-sm text-muted-foreground">Page {page}/{totalPages}</span><button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50">Next</button></div>}
    </div>
  );
}
