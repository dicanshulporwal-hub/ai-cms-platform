'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface CmsModule { id: string; moduleKey: string; moduleName: string; description: string | null; category: string; routePath: string | null; isSystemModule: boolean; isCoreModule: boolean; isEnabledGlobally: boolean; isPublicEnabled: boolean; isAdminVisible: boolean; isTemplateAvailable: boolean; }

function ModulesContent({ user }: { user: AuthUser }) {
  const [modules, setModules] = useState<CmsModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); try { const data = await apiClient<CmsModule[]>('/api/modules'); setModules(data); } catch {} setLoading(false); }

  async function toggleEnable(mod: CmsModule) {
    const action = mod.isEnabledGlobally ? 'disable' : 'enable';
    try { await apiClient(`/api/modules/${mod.moduleKey}/${action}`, { method: 'PATCH' }); await load(); } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  }
  async function togglePublic(mod: CmsModule) {
    try { await apiClient(`/api/modules/${mod.moduleKey}/public-visibility`, { method: 'PATCH', body: JSON.stringify({ isPublicEnabled: !mod.isPublicEnabled }) }); await load(); } catch {}
  }
  async function toggleTemplate(mod: CmsModule) {
    try { await apiClient(`/api/modules/${mod.moduleKey}/template-availability`, { method: 'PATCH', body: JSON.stringify({ isTemplateAvailable: !mod.isTemplateAvailable }) }); await load(); } catch {}
  }

  const categories = [...new Set(modules.map(m => m.category))].sort();
  const filtered = modules.filter(m => {
    if (search && !m.moduleName.toLowerCase().includes(search.toLowerCase()) && !m.moduleKey.includes(search.toLowerCase())) return false;
    if (category && m.category !== category) return false;
    return true;
  });

  if (user.role !== 'Super Admin' && user.role !== 'Admin') return <div className="text-center py-8 text-muted-foreground">Access restricted.</div>;
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Module Management</h1><p className="mt-1 text-sm text-muted-foreground">Enable or disable CMS modules. Disabled modules are hidden from admin, public portal, and templates.</p></div>

      <Card>
        <CardHeader><CardTitle>CMS Modules</CardTitle><CardDescription>{modules.filter(m => m.isEnabledGlobally).length} of {modules.length} modules enabled.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." /></div>
            <Select className="w-[160px]" value={category || 'all'} onChange={(e) => setCategory(e.target.value === 'all' ? '' : e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Category</TableHead><TableHead>Enabled</TableHead><TableHead>Admin</TableHead><TableHead>Public</TableHead><TableHead>Template</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map(mod => (
                  <TableRow key={mod.id} className={!mod.isEnabledGlobally ? 'opacity-50' : ''}>
                    <TableCell><div><p className="font-medium text-sm">{mod.moduleName}</p><p className="text-xs text-muted-foreground">{mod.moduleKey}</p></div></TableCell>
                    <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{mod.category}</span></TableCell>
                    <TableCell>{mod.isEnabledGlobally ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{mod.isAdminVisible ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{mod.isPublicEnabled ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{mod.isTemplateAvailable ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{mod.isCoreModule ? <span className="text-xs text-amber-600 font-medium">Core</span> : mod.isSystemModule ? <span className="text-xs text-blue-600">System</span> : <span className="text-xs text-muted-foreground">Custom</span>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!mod.isCoreModule && <Button size="sm" variant="ghost" onClick={() => toggleEnable(mod)}>{mod.isEnabledGlobally ? 'Disable' : 'Enable'}</Button>}
                        <Button size="sm" variant="ghost" onClick={() => togglePublic(mod)}>{mod.isPublicEnabled ? 'Hide Public' : 'Show Public'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleTemplate(mod)}>{mod.isTemplateAvailable ? 'Remove Template' : 'Add Template'}</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ModulesPage() {
  return <AdminPageShell sectionTitle="Modules">{(user) => <ModulesContent user={user} />}</AdminPageShell>;
}
