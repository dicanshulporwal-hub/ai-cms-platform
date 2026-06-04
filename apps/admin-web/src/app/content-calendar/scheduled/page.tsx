'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface ScheduledItem { id: string; contentType: string; contentId: string; contentTitle: string; scheduledAt: string; status: string; }

function ScheduledContent() {
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/content-calendar/scheduled'); setItems(data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Scheduled Content</h1><p className="text-sm text-muted-foreground mt-1">Content scheduled for future publishing</p></div>
      <Card>
        <CardHeader><CardTitle>Scheduled Items</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? (
            <div className="text-center py-8"><Clock className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No scheduled content.</p></div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div><p className="font-medium text-sm">{item.contentTitle}</p><p className="text-xs text-muted-foreground">{item.contentType}</p></div>
                  <div className="text-right"><p className="text-sm">{new Date(item.scheduledAt).toLocaleDateString()}</p><p className="text-xs text-muted-foreground">{new Date(item.scheduledAt).toLocaleTimeString()}</p></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ScheduledPage() {
  return <AdminPageShell sectionTitle="Scheduled Content">{() => <ScheduledContent />}</AdminPageShell>;
}
