'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Plus, Search, Image, Eye, Archive, Trash2 } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  _count: { images: number };
}

export default function GalleriesPage() {
  return (
    <AdminPageShell sectionTitle="Photo Gallery">
      {() => <GalleriesContent />}
    </AdminPageShell>
  );
}

function GalleriesContent() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<{ total: number; published: number; draft: number; totalImages: number } | null>(null);

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const data = await apiClient(`/galleries?${params.toString()}`);
      setGalleries(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (e) {
      console.error('Failed to fetch galleries', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await apiClient('/galleries/summary');
      setSummary(data);
    } catch {}
  }, []);

  useEffect(() => { fetchGalleries(); }, [fetchGalleries]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handlePublish = async (id: string) => {
    try {
      await apiClient(`/galleries/${id}/publish`, { method: 'POST' });
      fetchGalleries();
      fetchSummary();
    } catch (e: any) {
      alert(e.message || 'Failed to publish');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient(`/galleries/${id}/archive`, { method: 'POST' });
      fetchGalleries();
      fetchSummary();
    } catch (e: any) {
      alert(e.message || 'Failed to archive');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return;
    try {
      await apiClient(`/galleries/${id}`, { method: 'DELETE' });
      fetchGalleries();
      fetchSummary();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      GALLERY_DRAFT: 'bg-yellow-100 text-yellow-800',
      GALLERY_PUBLISHED: 'bg-green-100 text-green-800',
      GALLERY_ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      GALLERY_DRAFT: 'Draft',
      GALLERY_PUBLISHED: 'Published',
      GALLERY_ARCHIVED: 'Archived',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage photo albums and galleries</p>
        </div>
        <button
          onClick={() => router.push('/galleries/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Gallery
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Galleries</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-green-600">{summary.published}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.draft}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Images</p>
            <p className="text-2xl font-bold text-blue-600">{summary.totalImages}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search galleries..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Status</option>
          <option value="GALLERY_DRAFT">Draft</option>
          <option value="GALLERY_PUBLISHED">Published</option>
          <option value="GALLERY_ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Gallery List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No galleries found</p>
          <button
            onClick={() => router.push('/galleries/new')}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Create your first gallery
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              {/* Thumbnail */}
              <div className="h-16 w-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {gallery.coverImageUrl ? (
                  <img
                    src={gallery.coverImageUrl}
                    alt={gallery.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="font-medium truncate cursor-pointer hover:text-primary"
                    onClick={() => router.push(`/galleries/${gallery.id}`)}
                  >
                    {gallery.title}
                  </h3>
                  {statusBadge(gallery.status)}
                  {gallery.isFeatured && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {gallery._count.images} image{gallery._count.images !== 1 ? 's' : ''} · /{gallery.slug}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {gallery.status === 'GALLERY_DRAFT' && (
                  <button
                    onClick={() => handlePublish(gallery.id)}
                    className="p-2 rounded-md hover:bg-green-50 text-green-600 transition-colors"
                    title="Publish"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                {gallery.status === 'GALLERY_PUBLISHED' && (
                  <button
                    onClick={() => handleArchive(gallery.id)}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(gallery.id)}
                  className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
