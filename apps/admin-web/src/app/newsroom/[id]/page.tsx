'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Eye, Send, CheckCircle, Archive } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

export default function NewsroomDetailPage() { return <AdminPageShell sectionTitle="Newsroom Detail">{() => <Content />}</AdminPageShell>; }

function Content() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { setLoading(true); try { const data = await apiClient(`/newsroom/${id}`); setItem(data); } catch (e: any) { alert(e.message); router.push('/newsroom'); } setLoading(false); }, [id, router]);
  useEffect(() => { load(); }, [load]);

  const handleAction = async (action: string) => { try { await apiClient(`/newsroom/${id}/${action}`, { method: 'POST' }); load(); } catch (e: any) { alert(e.message); } };

  if (loading || !item) return <div className="h-64 rounded-lg border bg-muted/50 animate-pulse" />;

  const STATUS_LABELS: Record<string, string> = { NR_DRAFT: 'Draft', NR_UNDER_REVIEW: 'Under Review', NR_APPROVED: 'Approved', NR_PUBLISHED: 'Published', NR_ARCHIVED: 'Archived' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={() => router.push('/newsroom')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button><div><h1 className="text-2xl font-bold">{item.title}</h1><p className="text-sm text-muted-foreground">{item.itemType.replace(/_/g, ' ')} · {STATUS_LABELS[item.status]}</p></div></div>
        <div className="flex gap-2">
          {item.status === 'NR_DRAFT' && <button onClick={() => handleAction('submit-review')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"><Send className="h-4 w-4" />Submit</button>}
          {item.status === 'NR_UNDER_REVIEW' && <button onClick={() => handleAction('approve')} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"><CheckCircle className="h-4 w-4" />Approve</button>}
          {item.status === 'NR_APPROVED' && <button onClick={() => handleAction('publish')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"><Eye className="h-4 w-4" />Publish</button>}
          {item.status === 'NR_PUBLISHED' && <button onClick={() => handleAction('archive')} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><Archive className="h-4 w-4" />Archive</button>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {item.summary && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Summary</h3><p className="text-sm">{item.summary}</p></div>}
          {item.content && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Content</h3><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} /></div>}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
            <h3 className="font-medium">Details</h3>
            {item.category && <p>Category: {item.category.name}</p>}
            {item.eventDate && <p>Date: {new Date(item.eventDate).toLocaleDateString()}</p>}
            {item.location && <p>Location: {item.location}</p>}
            {item.speakerName && <p>Speaker: {item.speakerName}</p>}
            {item.sourceName && <p>Source: {item.sourceName}</p>}
            {item.sourceUrl && <a href={item.sourceUrl} target="_blank" className="text-primary hover:underline text-xs block">Source link →</a>}
            {item.videoUrl && <a href={item.videoUrl} target="_blank" className="text-primary hover:underline text-xs block">Video →</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
