'use client';

import { useEffect, useState } from 'react';
import { Loader2, ListOrdered } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface QueueItem { id: string; contentType: string; contentId: string; contentTitle: string; scheduledAt: string; status: string; priority: number; }

function QueueContent() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/content-calendar/queue'); setItems(data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Publishing Queue</h1><p className="text-sm text-muted-foreground mt-1">Content waiting in the publishing queue</p></div>
      <Card>
        <CardHeader><CardTitle>Queue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? (
            <div className="text-center py-8"><ListOrdered className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Publishing queue is empty.</p></div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div><p className="font-medium text-sm">{item.contentTitle}</p><p className="text-xs text-muted-foreground">{item.contentType} · Priority: {item.priority}</p></div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function QueuePage() {
  return <AdminPageShell sectionTitle="Publishing Queue">{() => <QueueContent />}</AdminPageShell>;
}
