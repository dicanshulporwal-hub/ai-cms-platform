'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface RegistryModule { id: string; moduleKey: string; moduleName: string; moduleType: string; category: string; isActive: boolean; isPublicEnabled: boolean; isSystemModule: boolean; }

function ModulesContent({ user }: { user: AuthUser }) {
  const [modules, setModules] = useState<RegistryModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadModules(); }, []);
  async function loadModules() {
    setLoading(true);
    try { const data = await apiClient<RegistryModule[]>('/api/template-modules'); setModules(data); } catch {}
    setLoading(false);
  }

  async function togglePublic(mod: RegistryModule) {
    try { await apiClient(`/api/template-modules/${mod.id}/public-visibility`, { method: 'PATCH', body: JSON.stringify({ isPublicEnabled: !mod.isPublicEnabled }) }); await loadModules(); } catch {}
  }

  async function toggleActive(mod: RegistryModule) {
    try { await apiClient(`/api/template-modules/${mod.id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive: !mod.isActive }) }); await loadModules(); } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const categories = [...new Set(modules.map(m => m.category))];

  return (
    <div className="space-y-6">
      <Link href="/templates"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back to Templates</Button></Link>
      <div><h1 className="text-2xl font-semibold">Template Module Registry</h1><p className="mt-1 text-sm text-muted-foreground">Manage which CMS modules are available for template placement and public portal display.</p></div>

      {categories.map(cat => (
        <Card key={cat}>
          <CardHeader><CardTitle className="text-base">{cat}</CardTitle><CardDescription>Modules in this category.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Key</TableHead><TableHead>Type</TableHead><TableHead>Active</TableHead><TableHead>Public</TableHead><TableHead>System</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {modules.filter(m => m.category === cat).map(mod => (
                  <TableRow key={mod.id}>
                    <TableCell className="font-medium">{mod.moduleName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{mod.moduleKey}</TableCell>
                    <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{mod.moduleType}</span></TableCell>
                    <TableCell>{mod.isActive ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{mod.isPublicEnabled ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{mod.isSystemModule ? <span className="text-xs text-amber-600">System</span> : <span className="text-xs text-muted-foreground">Custom</span>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleActive(mod)}>{mod.isActive ? 'Deactivate' : 'Activate'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => togglePublic(mod)}>{mod.isPublicEnabled ? 'Hide Public' : 'Show Public'}</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TemplateModulesPage() {
  return <AdminPageShell sectionTitle="Template Modules">{(user) => <ModulesContent user={user} />}</AdminPageShell>;
}
