'use client';

import { useEffect, useState } from 'react';
import { Loader2, ScrollText } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface ApiLog { id: string; clientName: string; endpoint: string; method: string; statusCode: number; responseTimeMs: number; createdAt: string; }

function ApiLogsContent() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/api-access/logs'); setLogs(data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">API Logs</h1><p className="text-sm text-muted-foreground mt-1">Recent API access activity</p></div>
      <Card>
        <CardHeader><CardTitle>Request Logs</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : logs.length === 0 ? (
            <div className="text-center py-8"><ScrollText className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No API logs yet.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Client</th><th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Endpoint</th><th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Status</th><th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Time</th><th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Date</th></tr></thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 px-2">{log.clientName}</td>
                      <td className="py-2 px-2 font-mono text-xs">{log.method} {log.endpoint}</td>
                      <td className="py-2 px-2"><span className={`text-xs px-1.5 py-0.5 rounded ${log.statusCode < 400 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{log.statusCode}</span></td>
                      <td className="py-2 px-2 text-muted-foreground">{log.responseTimeMs}ms</td>
                      <td className="py-2 px-2 text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApiLogsPage() {
  return <AdminPageShell sectionTitle="API Logs">{() => <ApiLogsContent />}</AdminPageShell>;
}
