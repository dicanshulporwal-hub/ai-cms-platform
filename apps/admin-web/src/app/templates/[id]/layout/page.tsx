'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Plus, Save, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { useTemplate } from '@/hooks/use-templates';
import { TemplateGate } from '@/components/templates/template-gate';
import { TemplateStepper } from '@/components/templates/template-stepper';
import type { AuthUser } from '@/types/auth';

interface Region { id: string; regionKey: string; regionName: string; regionType: string; sortOrder: number; isActive: boolean; modules: Module[]; }
interface Module { id: string; moduleType: string; moduleKey: string; displayTitle: string; configJson: any; sortOrder: number; isVisible: boolean; }
interface RegistryModule { id: string; moduleKey: string; moduleName: string; moduleType: string; category: string; isActive: boolean; isPublicEnabled: boolean; }

function LayoutContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const { data: template } = useTemplate(templateId);
  const [regions, setRegions] = useState<Region[]>([]);
  const [registryModules, setRegistryModules] = useState<RegistryModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newModuleType, setNewModuleType] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');

  useEffect(() => { loadData(); }, [templateId]);

  async function loadData() {
    setLoading(true);
    try {
      const [regionsData, modulesData] = await Promise.all([
        apiClient<Region[]>(`/api/templates/${templateId}/regions`),
        apiClient<RegistryModule[]>('/api/template-modules'),
      ]);
      setRegions(regionsData);
      setRegistryModules(modulesData);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load.'); }
    setLoading(false);
  }

  async function handleAddModule(regionId: string) {
    if (!newModuleType || !newModuleTitle) return;
    setError(null); setSuccess(null);
    try {
      await apiClient(`/api/templates/${templateId}/regions/${regionId}/modules`, {
        method: 'POST', body: JSON.stringify({ moduleType: newModuleType, moduleKey: `${newModuleType.toLowerCase()}-${Date.now()}`, displayTitle: newModuleTitle, configJson: {} }),
      });
      setAddingTo(null); setNewModuleType(''); setNewModuleTitle('');
      await loadData(); setSuccess('Module added.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to add module.'); }
  }

  async function handleRemoveModule(regionId: string, moduleId: string) {
    if (!confirm('Remove this module?')) return;
    try {
      await apiClient(`/api/templates/${templateId}/regions/${regionId}/modules/${moduleId}`, { method: 'DELETE' });
      await loadData(); setSuccess('Module removed.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed.'); }
  }

  async function handleToggleVisibility(regionId: string, mod: Module) {
    try {
      await apiClient(`/api/templates/${templateId}/regions/${regionId}/modules/${mod.id}`, {
        method: 'PUT', body: JSON.stringify({ isVisible: !mod.isVisible }),
      });
      await loadData();
    } catch {}
  }

  async function handleMoveModule(regionId: string, mod: Module, direction: 'up' | 'down') {
    const newOrder = direction === 'up' ? mod.sortOrder - 1 : mod.sortOrder + 1;
    try {
      await apiClient(`/api/templates/${templateId}/regions/${regionId}/modules/${mod.id}`, {
        method: 'PUT', body: JSON.stringify({ sortOrder: newOrder }),
      });
      await loadData();
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const activeModules = registryModules.filter(m => m.isActive);

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <TemplateStepper templateId={templateId} currentStep={2} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Layout Builder: {template?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Assign CMS modules to template regions. Modules marked visible will appear on the public portal.</p>
        </div>
        <Link href={`/templates/${templateId}/customize`}>
          <Button>
            Next: Customization <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      {regions.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">No regions defined. Regions are created automatically when a template is uploaded with a template.json.</div>
      ) : (
        <div className="space-y-4">
          {regions.map((region) => (
            <Card key={region.id} className={!region.isActive ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{region.regionName}</CardTitle>
                    <CardDescription>{region.regionType} • Key: {region.regionKey}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setAddingTo(addingTo === region.id ? null : region.id); setNewModuleType(''); setNewModuleTitle(''); }}>
                    <Plus className="h-4 w-4" /> Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {addingTo === region.id && (
                  <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Module Type</Label>
                        <Select value={newModuleType} onChange={(e) => setNewModuleType(e.target.value)}>
                          <option value="">Select module...</option>
                          {activeModules.map(m => <option key={m.id} value={m.moduleType}>{m.moduleName} ({m.category})</option>)}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Display Title</Label>
                        <Input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="e.g. Main Navigation" />
                      </div>
                      <div className="flex items-end"><Button size="sm" onClick={() => handleAddModule(region.id)} disabled={!newModuleType || !newModuleTitle}>Add</Button></div>
                    </div>
                  </div>
                )}
                {region.modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No modules assigned to this region.</p>
                ) : (
                  region.modules.map((mod, idx) => (
                    <div key={mod.id} className={['flex items-center gap-3 rounded-md border p-3', !mod.isVisible ? 'opacity-50 bg-muted/30' : ''].join(' ')}>
                      <div className="flex flex-col gap-0.5">
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => handleMoveModule(region.id, mod, 'up')} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => handleMoveModule(region.id, mod, 'down')} disabled={idx === region.modules.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mod.displayTitle}</p>
                        <p className="text-xs text-muted-foreground">{mod.moduleType}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleVisibility(region.id, mod)}>{mod.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveModule(region.id, mod.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LayoutBuilderPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Layout Builder">
      {(user) => (
        <TemplateGate>
          <LayoutContent user={user} templateId={params.id} />
        </TemplateGate>
      )}
    </AdminPageShell>
  );
}
