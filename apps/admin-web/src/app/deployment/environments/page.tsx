'use client';

import { useEffect, useState } from 'react';
import { Loader2, Server } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface Environment { id: string; name: string; key: string; baseUrl: string; status: string; isProduction: boolean; }

function EnvironmentsContent() {
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data: any = await apiClient('/deployment/environments'); setEnvs(data.data || data || []); } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Environments</h1><p className="text-sm text-muted-foreground mt-1">Manage deployment environments</p></div>
      <Card>
        <CardHeader><CardTitle>Configured Environments</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : envs.length === 0 ? (
            <div className="text-center py-8"><Server className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No environments configured.</p></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {envs.map((env) => (
                <div key={env.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{env.name}</p>
                    {env.isProduction && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Production</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{env.baseUrl || env.key}</p>
                  <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${env.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{env.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EnvironmentsPage() {
  return <AdminPageShell sectionTitle="Environments">{() => <EnvironmentsContent />}</AdminPageShell>;
}
