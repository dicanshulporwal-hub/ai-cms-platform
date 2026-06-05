'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save, Monitor, Tablet, Smartphone,
  GripVertical, Settings, Layers, Layout, Loader2, RefreshCw, ExternalLink,
} from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

// Types
interface Region { id: string; regionKey: string; regionName: string; regionType: string; sortOrder: number; isActive: boolean; isRequired: boolean; modules: RegionModule[]; }
interface RegionModule { id: string; moduleType: string; moduleKey: string; displayTitle: string; sortOrder: number; isVisible: boolean; configJson: any; }
interface PaletteModule { id: string; moduleKey: string; moduleName: string; moduleType: string; category: string; description: string | null; isActive: boolean; isPublicEnabled: boolean; }

// Module palette categories
const CATEGORY_ICONS: Record<string, string> = {
  Content: '📄', Government: '🏛️', Navigation: '🧭', Utility: '⚙️', Custom: '🔧', Layout: '📐',
};

export default function TemplateBuilderPage() {
  return <AdminPageShell sectionTitle="Template Builder">{() => <BuilderContent />}</AdminPageShell>;
}

function BuilderContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [paletteModules, setPaletteModules] = useState<PaletteModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<RegionModule | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [paletteSearch, setPaletteSearch] = useState('');

  // Load active template + regions + palette
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const active: any = await apiClient('/templates/active/current');
      if (!active) { setLoading(false); return; }
      setTemplateId(active.id);
      setTemplateName(active.name);

      const regs: any = await apiClient(`/templates/${active.id}/regions`);
      setRegions(regs || []);

      const palette: any = await apiClient('/template-modules');
      setPaletteModules((palette || []).filter((m: PaletteModule) => m.isActive && m.isPublicEnabled));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Add module to region
  const handleAddModule = async (regionId: string, mod: PaletteModule) => {
    if (!templateId) return;
    try {
      await apiClient(`/templates/${templateId}/regions/${regionId}/modules`, {
        method: 'POST',
        body: JSON.stringify({ moduleType: mod.moduleType, moduleKey: mod.moduleKey + '-' + Date.now().toString(36), displayTitle: mod.moduleName }),
      });
      loadData();
    } catch (e: any) { alert(e.message || 'Failed to add module'); }
  };

  // Remove module
  const handleRemoveModule = async (regionId: string, moduleId: string) => {
    if (!templateId || !confirm('Remove this module?')) return;
    try {
      await apiClient(`/templates/${templateId}/regions/${regionId}/modules/${moduleId}`, { method: 'DELETE' });
      setSelectedModule(null);
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  // Toggle module visibility
  const handleToggleVisibility = async (regionId: string, mod: RegionModule) => {
    if (!templateId) return;
    try {
      await apiClient(`/templates/${templateId}/regions/${regionId}/modules/${mod.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isVisible: !mod.isVisible }),
      });
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  // Move module up/down
  const handleMoveModule = async (regionId: string, mod: RegionModule, direction: 'up' | 'down') => {
    if (!templateId) return;
    const region = regions.find(r => r.id === regionId);
    if (!region) return;
    const newOrder = direction === 'up' ? mod.sortOrder - 1 : mod.sortOrder + 1;
    try {
      await apiClient(`/templates/${templateId}/regions/${regionId}/modules/${mod.id}`, {
        method: 'PUT',
        body: JSON.stringify({ sortOrder: newOrder }),
      });
      loadData();
    } catch {}
  };

  // Update module config
  const handleUpdateConfig = async (regionId: string, moduleId: string, configJson: any) => {
    if (!templateId) return;
    setSaving(true);
    try {
      await apiClient(`/templates/${templateId}/regions/${regionId}/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify({ configJson }),
      });
      loadData();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  // Group palette modules by category
  const paletteGroups = paletteModules.reduce((acc, mod) => {
    if (paletteSearch && !mod.moduleName.toLowerCase().includes(paletteSearch.toLowerCase())) return acc;
    const cat = mod.category || 'Custom';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {} as Record<string, PaletteModule[]>);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /><span className="ml-2 text-muted-foreground">Loading builder...</span></div>;
  }

  if (!templateId) {
    return (
      <div className="text-center py-20 space-y-4">
        <Layout className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Active Template</h2>
        <p className="text-muted-foreground">Please select and activate a template first.</p>
        <button onClick={() => router.push('/templates/onboarding')} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Select Template</button>
      </div>
    );
  }

  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="space-y-4">
      {/* Builder Toolbar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          <Layout className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-semibold">{templateName}</h1>
            <p className="text-xs text-muted-foreground">Public Template Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Preview Toggle */}
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
            <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : ''}`} title="Desktop"><Monitor className="h-4 w-4" /></button>
            <button onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded ${previewDevice === 'tablet' ? 'bg-white shadow-sm' : ''}`} title="Tablet"><Tablet className="h-4 w-4" /></button>
            <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : ''}`} title="Mobile"><Smartphone className="h-4 w-4" /></button>
          </div>
          <button onClick={loadData} className="p-2 rounded-md hover:bg-muted" title="Refresh"><RefreshCw className="h-4 w-4" /></button>
          <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" />Live Preview</a>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-[240px_1fr_280px] gap-4 min-h-[calc(100vh-220px)]">

        {/* LEFT: Module Palette */}
        <div className="rounded-lg border bg-card overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Module Palette</h3>
            <input
              type="text"
              placeholder="Search modules..."
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {Object.entries(paletteGroups).map(([cat, mods]) => (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
                  {CATEGORY_ICONS[cat] || '📦'} {cat}
                </p>
                <div className="space-y-1">
                  {mods.map((mod) => (
                    <div key={mod.id} className="flex items-center gap-2 rounded-md border bg-white px-2 py-1.5 text-xs hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-50" />
                      <span className="flex-1 truncate font-medium">{mod.moduleName}</span>
                      <button
                        onClick={() => {
                          const firstRegion = regions.find(r => r.regionType === 'CONTENT') || regions[0];
                          if (firstRegion) handleAddModule(firstRegion.id, mod);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-primary/10 text-primary transition-opacity"
                        title="Add to content region"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(paletteGroups).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No modules available</p>
            )}
          </div>
        </div>

        {/* CENTER: Layout Canvas */}
        <div className="rounded-lg border bg-muted/30 overflow-hidden flex flex-col">
          <div className="p-2 border-b bg-card flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Layout Canvas — {previewDevice}</span>
            <span className="text-[10px] text-muted-foreground">{regions.length} regions · {regions.reduce((n, r) => n + r.modules.length, 0)} modules</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex justify-center">
            <div style={{ width: deviceWidths[previewDevice], maxWidth: '100%', transition: 'width 0.3s' }} className="space-y-3">
              {regions.sort((a, b) => a.sortOrder - b.sortOrder).map((region) => (
                <div
                  key={region.id}
                  className={`rounded-lg border-2 border-dashed p-3 transition-colors ${!region.isActive ? 'opacity-40 border-gray-300' : 'border-blue-200 bg-white/80'}`}
                >
                  {/* Region Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-700">{region.regionName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{region.regionType}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRegionId(region.id);
                        setSelectedModule(null);
                      }}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Add Module ↓
                    </button>
                  </div>

                  {/* Modules in Region */}
                  {region.modules.length === 0 ? (
                    <div className="text-center py-4 border border-dashed rounded-md">
                      <p className="text-xs text-muted-foreground">Empty region — drag a module here</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {region.modules.sort((a, b) => a.sortOrder - b.sortOrder).map((mod, idx) => (
                        <div
                          key={mod.id}
                          onClick={() => { setSelectedModule(mod); setSelectedRegionId(region.id); }}
                          className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs cursor-pointer transition-all ${
                            selectedModule?.id === mod.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'bg-white hover:border-gray-300'
                          } ${!mod.isVisible ? 'opacity-50' : ''}`}
                        >
                          <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 font-medium truncate">{mod.displayTitle}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{mod.moduleType}</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); handleMoveModule(region.id, mod, 'up'); }} disabled={idx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleMoveModule(region.id, mod, 'down'); }} disabled={idx === region.modules.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(region.id, mod); }} className="p-0.5 rounded hover:bg-muted">{mod.isVisible ? <Eye className="h-3 w-3 text-green-600" /> : <EyeOff className="h-3 w-3 text-gray-400" />}</button>
                            <button onClick={(e) => { e.stopPropagation(); handleRemoveModule(region.id, mod.id); }} className="p-0.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Module Dropdown */}
                  {selectedRegionId === region.id && !selectedModule && (
                    <div className="mt-2 rounded-md border bg-white p-2 shadow-sm">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Add module to {region.regionName}:</p>
                      <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                        {paletteModules.map((pm) => (
                          <button
                            key={pm.id}
                            onClick={() => { handleAddModule(region.id, pm); setSelectedRegionId(null); }}
                            className="text-left text-[11px] px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors truncate"
                          >
                            {pm.moduleName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Settings Panel */}
        <div className="rounded-lg border bg-card overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Settings
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {selectedModule && selectedRegionId ? (
              <ModuleSettingsPanel
                module={selectedModule}
                regionId={selectedRegionId}
                templateId={templateId}
                onSave={handleUpdateConfig}
                saving={saving}
              />
            ) : (
              <div className="text-center py-8">
                <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Select a module on the canvas to configure it</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Module Settings Panel
function ModuleSettingsPanel({ module, regionId, templateId, onSave, saving }: { module: RegionModule; regionId: string; templateId: string; onSave: (regionId: string, moduleId: string, config: any) => void; saving: boolean }) {
  const [config, setConfig] = useState<Record<string, any>>(module.configJson || {});

  useEffect(() => { setConfig(module.configJson || {}); }, [module.id, module.configJson]);

  const updateField = (key: string, value: any) => setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">{module.displayTitle}</p>
        <p className="text-[10px] text-muted-foreground">{module.moduleType}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1">Display Title</label>
          <input
            type="text"
            value={config.displayTitle || module.displayTitle}
            onChange={(e) => updateField('displayTitle', e.target.value)}
            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Items Limit</label>
          <input
            type="number"
            value={config.limit || 5}
            onChange={(e) => updateField('limit', parseInt(e.target.value) || 5)}
            min={1}
            max={50}
            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Display Mode</label>
          <select
            value={config.displayMode || 'list'}
            onChange={(e) => updateField('displayMode', e.target.value)}
            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs"
          >
            <option value="list">List</option>
            <option value="card">Cards</option>
            <option value="grid">Grid</option>
            <option value="table">Table</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="showTitle" checked={config.showTitle !== false} onChange={(e) => updateField('showTitle', e.target.checked)} className="rounded" />
          <label htmlFor="showTitle" className="text-xs">Show Section Title</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="showImage" checked={config.showImage !== false} onChange={(e) => updateField('showImage', e.target.checked)} className="rounded" />
          <label htmlFor="showImage" className="text-xs">Show Images</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="showDate" checked={config.showDate !== false} onChange={(e) => updateField('showDate', e.target.checked)} className="rounded" />
          <label htmlFor="showDate" className="text-xs">Show Dates</label>
        </div>
      </div>

      <button
        onClick={() => onSave(regionId, module.id, config)}
        disabled={saving}
        className="w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <Save className="h-3.5 w-3.5" />
        {saving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
}
