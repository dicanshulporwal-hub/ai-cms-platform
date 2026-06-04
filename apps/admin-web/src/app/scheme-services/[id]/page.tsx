'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Eye, Send, CheckCircle, Archive } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

export default function SchemeServiceDetailPage() {
  return <AdminPageShell sectionTitle="Scheme/Service Detail">{() => <Content />}</AdminPageShell>;
}

function Content() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await apiClient(`/scheme-services/${id}`); setItem(data); } catch (e: any) { alert(e.message); router.push('/scheme-services'); }
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action: string) => {
    try { await apiClient(`/scheme-services/${id}/${action}`, { method: 'POST' }); load(); } catch (e: any) { alert(e.message); }
  };

  if (loading || !item) return <div className="h-64 rounded-lg border bg-muted/50 animate-pulse" />;

  const STATUS_LABELS: Record<string, string> = { SS_DRAFT: 'Draft', SS_UNDER_REVIEW: 'Under Review', SS_APPROVED: 'Approved', SS_PUBLISHED: 'Published', SS_ARCHIVED: 'Archived', SS_EXPIRED: 'Expired' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/scheme-services')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <p className="text-sm text-muted-foreground">{item.type} · {STATUS_LABELS[item.status] || item.status}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {item.status === 'SS_DRAFT' && <button onClick={() => handleAction('submit-review')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"><Send className="h-4 w-4" />Submit Review</button>}
          {item.status === 'SS_UNDER_REVIEW' && <button onClick={() => handleAction('approve')} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"><CheckCircle className="h-4 w-4" />Approve</button>}
          {item.status === 'SS_APPROVED' && <button onClick={() => handleAction('publish')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"><Eye className="h-4 w-4" />Publish</button>}
          {item.status === 'SS_PUBLISHED' && <button onClick={() => handleAction('archive')} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><Archive className="h-4 w-4" />Archive</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {item.summary && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Summary</h3><p className="text-sm">{item.summary}</p></div>}
          {item.description && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} /></div>}
          {item.eligibilityCriteria && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Eligibility Criteria</h3><div className="text-sm whitespace-pre-wrap">{item.eligibilityCriteria}</div></div>}
          {item.benefits && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Benefits</h3><div className="text-sm whitespace-pre-wrap">{item.benefits}</div></div>}
          {item.applicationProcess && <div className="rounded-lg border bg-card p-4"><h3 className="text-sm font-medium text-muted-foreground mb-1">Application Process</h3><div className="text-sm whitespace-pre-wrap">{item.applicationProcess}</div></div>}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
            <h3 className="font-medium">Details</h3>
            {item.category && <p>Category: {item.category.name}</p>}
            {item.department && <p>Department: {item.department.name}</p>}
            {item.targetAudience && <p>Audience: {item.targetAudience}</p>}
            <p>Application: {item.applicationMode?.replace('_', ' ')}</p>
            {item.applicationUrl && <p><a href={item.applicationUrl} target="_blank" className="text-primary hover:underline">Apply Online →</a></p>}
            {item.timeline && <p>Timeline: {item.timeline}</p>}
          </div>
          {(item.contactName || item.contactEmail || item.contactPhone) && (
            <div className="rounded-lg border bg-card p-4 space-y-1 text-sm">
              <h3 className="font-medium">Contact</h3>
              {item.contactName && <p>{item.contactName}</p>}
              {item.contactEmail && <p className="text-muted-foreground">{item.contactEmail}</p>}
              {item.contactPhone && <p className="text-muted-foreground">{item.contactPhone}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
