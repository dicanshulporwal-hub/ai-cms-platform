'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Check, ChevronDown, ChevronUp, Edit2, ExternalLink,
  GripVertical, Loader2, Plus, Save, Trash2, X,
} from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MenuDetail {
  id: string;
  name: string;
  slug: string;
  location: string;
  status: string;
  description: string | null;
  isDefault: boolean;
  languageCode: string | null;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  menuId: string;
  label: string;
  linkType: string;
  url: string | null;
  parentId: string | null;
  sortOrder: number;
  openInNewTab: boolean;
  noFollow: boolean;
  isVisible: boolean;
}

interface ItemDraft {
  label: string;
  linkType: string;
  url: string;
  parentId: string;
  openInNewTab: boolean;
  noFollow: boolean;
}

const BLANK_DRAFT: ItemDraft = {
  label: '', linkType: 'CUSTOM_URL', url: '', parentId: '', openInNewTab: false, noFollow: false,
};

const LINK_TYPES = [
  { value: 'CUSTOM_URL', label: 'Custom URL' },
  { value: 'PAGE', label: 'Page' },
  { value: 'BLOG_POST', label: 'Blog Post' },
  { value: 'CATEGORY', label: 'Category' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'EXTERNAL', label: 'External Link' },
];

const LOCATIONS = ['HEADER', 'FOOTER', 'SIDEBAR_MENU', 'MOBILE', 'UTILITY'];
const STATUSES = ['MENU_ACTIVE', 'MENU_DRAFT', 'MENU_INACTIVE'];

// ─── ItemRow ─────────────────────────────────────────────────────────────────
function ItemRow({
  item, index, total, topLevelItems,
  onMove, onDelete, onToggleVisible, onEdit,
}: {
  item: MenuItem; index: number; total: number; topLevelItems: MenuItem[];
  onMove: (id: string, dir: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string, v: boolean) => void;
  onEdit: (item: MenuItem) => void;
}) {
  const isChild = Boolean(item.parentId);
  const parent = topLevelItems.find(t => t.id === item.parentId);

  return (
    <div
      className={[
        'group flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted/40',
        !item.isVisible ? 'opacity-50' : '',
        isChild ? 'ml-8 border-l-4 border-l-primary/20' : '',
      ].join(' ')}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <span className="font-medium truncate">{item.label}</span>
        <span className="ml-2 text-xs text-muted-foreground truncate">
          {isChild && parent ? `↳ ${parent.label} › ` : ''}
          {item.url || item.linkType}
        </span>
        {item.openInNewTab && (
          <ExternalLink className="inline ml-1 h-3 w-3 text-muted-foreground" />
        )}
      </div>

      <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
        {item.linkType}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(item.id, 'up')} disabled={index === 0}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
          title="Move up"
        ><ChevronUp className="h-3.5 w-3.5" /></button>
        <button
          onClick={() => onMove(item.id, 'down')} disabled={index === total - 1}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
          title="Move down"
        ><ChevronDown className="h-3.5 w-3.5" /></button>
        <button
          onClick={() => onToggleVisible(item.id, !item.isVisible)}
          className="p-1 rounded hover:bg-muted"
          title={item.isVisible ? 'Hide' : 'Show'}
        >
          {item.isVisible
            ? <Check className="h-3.5 w-3.5 text-emerald-600" />
            : <X className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1 rounded hover:bg-muted text-primary"
          title="Edit"
        ><Edit2 className="h-3.5 w-3.5" /></button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 rounded hover:bg-red-50 text-destructive"
          title="Delete"
        ><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

// ─── AddItemForm ─────────────────────────────────────────────────────────────
function AddItemForm({
  draft, setDraft, saving, topLevelItems, onSave, onCancel, editingId,
}: {
  draft: ItemDraft; setDraft: (d: ItemDraft) => void; saving: boolean;
  topLevelItems: MenuItem[];
  onSave: () => void; onCancel: () => void; editingId: string | null;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-semibold">{editingId ? 'Edit Item' : 'Add Item'}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Label *</Label>
          <Input
            value={draft.label}
            onChange={e => setDraft({ ...draft, label: e.target.value })}
            placeholder="e.g. Home"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Link Type</Label>
          <select
            value={draft.linkType}
            onChange={e => setDraft({ ...draft, linkType: e.target.value })}
            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
          >
            {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL / Path</Label>
          <Input
            value={draft.url}
            onChange={e => setDraft({ ...draft, url: e.target.value })}
            placeholder="e.g. /about or https://example.com"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Parent item (optional)</Label>
          <select
            value={draft.parentId}
            onChange={e => setDraft({ ...draft, parentId: e.target.value })}
            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
          >
            <option value="">— Top level —</option>
            {topLevelItems.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.openInNewTab}
            onChange={e => setDraft({ ...draft, openInNewTab: e.target.checked })}
            className="rounded"
          />
          Open in new tab
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.noFollow}
            onChange={e => setDraft({ ...draft, noFollow: e.target.checked })}
            className="rounded"
          />
          No follow
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={onSave} disabled={saving || !draft.label.trim()}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {editingId ? 'Update' : 'Add Item'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── MenuEditorContent ───────────────────────────────────────────────────────
function MenuEditorContent({ menuId }: { menuId: string }) {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Menu meta edit state
  const [editMeta, setEditMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState({ name: '', location: '', status: '', description: '' });
  const [savingMeta, setSavingMeta] = useState(false);

  // Item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState<ItemDraft>(BLANK_DRAFT);
  const [savingItem, setSavingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<MenuDetail>(`/api/menus/${menuId}`);
      setMenu(data);
      setMetaDraft({
        name: data.name,
        location: data.location,
        status: data.status,
        description: data.description ?? '',
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load menu.');
    }
    setLoading(false);
  }, [menuId]);

  useEffect(() => { load(); }, [load]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  // ── Meta save ─────────────────────────────────────────────────────────────
  async function saveMeta() {
    if (!menu) return;
    setSavingMeta(true);
    try {
      await apiClient(`/api/menus/${menu.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: metaDraft.name,
          location: metaDraft.location,
          status: metaDraft.status,
          description: metaDraft.description || null,
        }),
      });
      flash('Menu settings saved.');
      setEditMeta(false);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Save failed.');
    }
    setSavingMeta(false);
  }

  // ── Activate ──────────────────────────────────────────────────────────────
  async function activate() {
    if (!menu) return;
    try {
      await apiClient(`/api/menus/${menu.id}/activate`, { method: 'POST' });
      flash('Menu activated.');
      await load();
    } catch (e: any) { setError(e?.message ?? 'Activate failed.'); }
  }

  // ── Delete menu ───────────────────────────────────────────────────────────
  async function deleteMenu() {
    if (!menu || !confirm(`Delete menu "${menu.name}"? This cannot be undone.`)) return;
    try {
      await apiClient(`/api/menus/${menu.id}`, { method: 'DELETE' });
      router.push('/menus');
    } catch (e: any) { setError(e?.message ?? 'Delete failed.'); }
  }

  // ── Add / update item ─────────────────────────────────────────────────────
  function startEdit(item: MenuItem) {
    setEditingItemId(item.id);
    setDraft({
      label: item.label,
      linkType: item.linkType,
      url: item.url ?? '',
      parentId: item.parentId ?? '',
      openInNewTab: item.openInNewTab,
      noFollow: item.noFollow,
    });
    setShowAddForm(true);
  }

  function cancelForm() {
    setShowAddForm(false);
    setEditingItemId(null);
    setDraft(BLANK_DRAFT);
  }

  async function saveItem() {
    if (!menu || !draft.label.trim()) return;
    setSavingItem(true);
    setError(null);
    try {
      const body = {
        label: draft.label.trim(),
        linkType: draft.linkType,
        url: draft.url.trim() || null,
        parentId: draft.parentId || null,
        openInNewTab: draft.openInNewTab,
        noFollow: draft.noFollow,
      };
      if (editingItemId) {
        await apiClient(`/api/menus/${menu.id}/items/${editingItemId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        flash('Item updated.');
      } else {
        await apiClient(`/api/menus/${menu.id}/items`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        flash('Item added.');
      }
      cancelForm();
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save item.');
    }
    setSavingItem(false);
  }

  // ── Delete item ───────────────────────────────────────────────────────────
  async function deleteItem(itemId: string) {
    if (!menu || !confirm('Remove this menu item?')) return;
    try {
      await apiClient(`/api/menus/${menu.id}/items/${itemId}`, { method: 'DELETE' });
      flash('Item removed.');
      await load();
    } catch (e: any) { setError(e?.message ?? 'Delete failed.'); }
  }

  // ── Toggle visibility ─────────────────────────────────────────────────────
  async function toggleVisible(itemId: string, isVisible: boolean) {
    if (!menu) return;
    try {
      await apiClient(`/api/menus/${menu.id}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ isVisible }),
      });
      await load();
    } catch {}
  }

  // ── Move item (sort order) ────────────────────────────────────────────────
  async function moveItem(itemId: string, dir: 'up' | 'down') {
    if (!menu) return;
    const sorted = [...menu.items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const updates = [
      { id: sorted[idx].id, sortOrder: sorted[swapIdx].sortOrder },
      { id: sorted[swapIdx].id, sortOrder: sorted[idx].sortOrder },
    ];
    try {
      await apiClient(`/api/menus/${menu.id}/items/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ items: updates }),
      });
      await load();
    } catch {}
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading menu…</span>
      </div>
    );
  }

  if (error && !menu) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push('/menus')}>
          <ArrowLeft className="h-4 w-4" /> Back to Menus
        </Button>
      </div>
    );
  }

  if (!menu) return null;

  const sortedItems = [...menu.items].sort((a, b) => a.sortOrder - b.sortOrder);
  const topLevelItems = sortedItems.filter(i => !i.parentId);

  const statusBadge: Record<string, string> = {
    MENU_ACTIVE: 'bg-emerald-100 text-emerald-700',
    MENU_DRAFT: 'bg-blue-100 text-blue-700',
    MENU_INACTIVE: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/menus">
          <Button variant="ghost" size="sm" className="shrink-0">
            <ArrowLeft className="h-4 w-4" /> Menus
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate">{menu.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[menu.status] ?? 'bg-gray-100'}`}>
              {menu.status.replace('MENU_', '')}
            </span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {menu.location}
            </span>
            {menu.isDefault && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {menu.slug} · {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {menu.status !== 'MENU_ACTIVE' && (
            <Button size="sm" onClick={activate}>
              <Check className="h-3.5 w-3.5" /> Activate
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => { setEditMeta(!editMeta); }}>
            <Edit2 className="h-3.5 w-3.5" /> Settings
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={deleteMenu}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Meta settings panel */}
      {editMeta && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Menu Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={metaDraft.name} onChange={e => setMetaDraft(m => ({ ...m, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location</Label>
                <select
                  value={metaDraft.location}
                  onChange={e => setMetaDraft(m => ({ ...m, location: e.target.value }))}
                  className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select
                  value={metaDraft.status}
                  onChange={e => setMetaDraft(m => ({ ...m, status: e.target.value }))}
                  className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('MENU_', '')}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input value={metaDraft.description} onChange={e => setMetaDraft(m => ({ ...m, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveMeta} disabled={savingMeta}>
                {savingMeta ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Settings
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditMeta(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items list */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Menu Items ({sortedItems.length})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => { cancelForm(); setShowAddForm(true); }}
              disabled={showAddForm && !editingItemId}
            >
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Add / edit form */}
          {showAddForm && (
            <AddItemForm
              draft={draft}
              setDraft={setDraft}
              saving={savingItem}
              topLevelItems={topLevelItems}
              onSave={saveItem}
              onCancel={cancelForm}
              editingId={editingItemId}
            />
          )}

          {/* Empty state */}
          {sortedItems.length === 0 && !showAddForm && (
            <div className="rounded-md border border-dashed py-10 text-center">
              <p className="text-sm text-muted-foreground">No items yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click <strong>Add Item</strong> to build your navigation.
              </p>
            </div>
          )}

          {/* Top-level items */}
          {topLevelItems.map((item, idx) => (
            <div key={item.id}>
              <ItemRow
                item={item}
                index={idx}
                total={topLevelItems.length}
                topLevelItems={topLevelItems}
                onMove={moveItem}
                onDelete={deleteItem}
                onToggleVisible={toggleVisible}
                onEdit={startEdit}
              />
              {/* Children */}
              {sortedItems
                .filter(c => c.parentId === item.id)
                .map((child, cidx, arr) => (
                  <ItemRow
                    key={child.id}
                    item={child}
                    index={cidx}
                    total={arr.length}
                    topLevelItems={topLevelItems}
                    onMove={moveItem}
                    onDelete={deleteItem}
                    onToggleVisible={toggleVisible}
                    onEdit={startEdit}
                  />
                ))}
            </div>
          ))}

          {/* Orphan children (parent deleted but child still exists) */}
          {sortedItems
            .filter(i => i.parentId && !topLevelItems.find(t => t.id === i.parentId))
            .map((item, idx, arr) => (
              <ItemRow
                key={item.id}
                item={item}
                index={idx}
                total={arr.length}
                topLevelItems={topLevelItems}
                onMove={moveItem}
                onDelete={deleteItem}
                onToggleVisible={toggleVisible}
                onEdit={startEdit}
              />
            ))}
        </CardContent>
      </Card>

      {/* Preview hint */}
      {menu.status === 'MENU_ACTIVE' && (
        <p className="text-xs text-muted-foreground text-center">
          This menu is active. Changes are reflected on the public website after the next page load.
        </p>
      )}
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function MenuEditorPage() {
  const params = useParams();
  const menuId = params?.id as string;

  return (
    <AdminPageShell sectionTitle="Menu Editor">
      {() => <MenuEditorContent menuId={menuId} />}
    </AdminPageShell>
  );
}
