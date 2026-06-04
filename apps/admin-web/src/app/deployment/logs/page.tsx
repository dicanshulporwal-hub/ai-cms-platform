'use client';

import { useEffect, useState } from 'react';
import { Loader2, ScrollText } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface DeployLog { id: string; action: string; environment: string; status: string; message: string | null; createdAt: string; performedBy: string | null; }

function LogsContent() {
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/deployment/logs'); setLogs(data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Deployment Logs</h1><p className="text-sm text-muted-foreground mt-1">History of deployment actions</p></div>
      <Card>
        <CardHeader><CardTitle>Recent Logs</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : logs.length === 0 ? (
            <div className="text-center py-8"><ScrollText className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No deployment logs yet.</p></div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{log.action}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : log.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{log.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.environment} · {new Date(log.createdAt).toLocaleString()}</p>
                  {log.message && <p className="text-xs text-muted-foreground mt-1">{log.message}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeploymentLogsPage() {
  return <AdminPageShell sectionTitle="Deployment Logs">{() => <LogsContent />}</AdminPageShell>;
}
