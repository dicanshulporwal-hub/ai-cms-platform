'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface ChecklistItem { id: string; title: string; description: string | null; category: string; isRequired: boolean; isCompleted: boolean; }

function ChecklistContent() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/deployment/checklist'); setItems(data.items || data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const completed = items.filter(i => i.isCompleted).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deployment Checklist</h1>
        <p className="text-sm text-muted-foreground mt-1">{completed}/{items.length} items completed</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Pre-Deployment Checks</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No checklist items configured.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {item.isCompleted ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className={`text-sm font-medium ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{item.category}</span>
                      {item.isRequired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">Required</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChecklistPage() {
  return <AdminPageShell sectionTitle="Deployment Checklist">{() => <ChecklistContent />}</AdminPageShell>;
}
