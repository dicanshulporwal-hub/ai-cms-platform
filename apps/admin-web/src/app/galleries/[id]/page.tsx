'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Plus, Trash2, Eye, GripVertical, Save } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isVisible: boolean;
}

interface GalleryDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  images: GalleryImage[];
}

export default function GalleryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [gallery, setGallery] = useState<GalleryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/galleries/${id}`);
      setGallery(data);
    } catch (e: any) {
      alert(e.message || 'Failed to load gallery');
      router.push('/galleries');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleSave = async () => {
    if (!gallery) return;
    setSaving(true);
    try {
      await apiClient(`/galleries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: gallery.title,
          slug: gallery.slug,
          description: gallery.description,
          coverImageUrl: gallery.coverImageUrl,
          isFeatured: gallery.isFeatured,
          metaTitle: gallery.metaTitle,
          metaDescription: gallery.metaDescription,
        }),
      });
      alert('Gallery saved successfully');
    } catch (e: any) {
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await apiClient(`/galleries/${id}/publish`, { method: 'POST' });
      fetchGallery();
    } catch (e: any) {
      alert(e.message || 'Failed to publish');
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl) { alert('Image URL is required'); return; }
    try {
      await apiClient(`/galleries/${id}/images`, {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: newImageUrl,
          altText: newImageAlt || undefined,
          title: newImageTitle || undefined,
        }),
      });
      setNewImageUrl('');
      setNewImageAlt('');
      setNewImageTitle('');
      setShowAddImage(false);
      fetchGallery();
    } catch (e: any) {
      alert(e.message || 'Failed to add image');
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!confirm('Remove this image?')) return;
    try {
      await apiClient(`/galleries/images/${imageId}`, { method: 'DELETE' });
      fetchGallery();
    } catch (e: any) {
      alert(e.message || 'Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded-lg border bg-muted/50 animate-pulse" />
      </div>
    );
  }

  if (!gallery) return null;

  const statusLabel: Record<string, string> = {
    GALLERY_DRAFT: 'Draft',
    GALLERY_PUBLISHED: 'Published',
    GALLERY_ARCHIVED: 'Archived',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/galleries')}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{gallery.title}</h1>
            <p className="text-sm text-muted-foreground">
              {statusLabel[gallery.status] || gallery.status} · {gallery.images.length} images
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {gallery.status === 'GALLERY_DRAFT' && (
            <button
              onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Publish
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={gallery.title}
                onChange={(e) => setGallery({ ...gallery, title: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={gallery.slug}
                onChange={(e) => setGallery({ ...gallery, slug: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={gallery.description || ''}
                onChange={(e) => setGallery({ ...gallery, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Images ({gallery.images.length})</h2>
              <button
                onClick={() => setShowAddImage(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Image
              </button>
            </div>

            {/* Add Image Form */}
            {showAddImage && (
              <div className="mb-4 p-4 rounded-lg border bg-muted/50 space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Image URL *</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={newImageTitle}
                      onChange={(e) => setNewImageTitle(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={newImageAlt}
                      onChange={(e) => setNewImageAlt(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddImage}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddImage(false)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Image Grid */}
            {gallery.images.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No images yet. Click "Add Image" to get started.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {gallery.images.map((img) => (
                  <div key={img.id} className="group relative rounded-lg overflow-hidden border bg-muted aspect-square">
                    <img
                      src={img.imageUrl}
                      alt={img.altText || img.title || 'Gallery image'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {img.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-xs text-white truncate">{img.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-medium">Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL</label>
              <input
                type="url"
                value={gallery.coverImageUrl || ''}
                onChange={(e) => setGallery({ ...gallery, coverImageUrl: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={gallery.isFeatured}
                onChange={(e) => setGallery({ ...gallery, isFeatured: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="featured" className="text-sm">Featured Gallery</label>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-medium">SEO</h3>
            <div>
              <label className="block text-xs font-medium mb-1">Meta Title</label>
              <input
                type="text"
                value={gallery.metaTitle || ''}
                onChange={(e) => setGallery({ ...gallery, metaTitle: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Meta Description</label>
              <textarea
                value={gallery.metaDescription || ''}
                onChange={(e) => setGallery({ ...gallery, metaDescription: e.target.value })}
                rows={2}
                className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                maxLength={160}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
