'use client';

import {
  Check,
  Copy,
  ImageIcon,
  Loader2,
  Save,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useDeleteMedia,
  useMedia,
  useUpdateMedia,
  useUploadMedia,
} from '@/hooks/use-media';
import type { MediaAsset } from '@/types/media';

const acceptedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const sizeIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex === 0 ? 0 : 1)} ${
    units[sizeIndex]
  }`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function isSupportedImage(file: File) {
  return acceptedMimeTypes.includes(file.type);
}

function MediaCard({
  media,
  onSelect,
  selected,
}: {
  media: MediaAsset;
  onSelect: (media: MediaAsset) => void;
  selected: boolean;
}) {
  return (
    <button
      className={[
        'group overflow-hidden rounded-md border bg-card text-left transition-colors',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border',
      ].join(' ')}
      onClick={() => onSelect(media)}
      type="button"
    >
      <div className="aspect-[4/3] bg-muted">
        <img
          alt={media.altText || media.originalName}
          className="h-full w-full object-cover"
          src={media.fileUrl}
        />
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium">{media.originalName}</p>
        <p className="text-xs text-muted-foreground">
          {media.mimeType} · {formatBytes(media.fileSize)}
        </p>
        {media.folder ? (
          <p className="truncate text-xs text-muted-foreground">
            {media.folder}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function MediaDetailsPanel({
  media,
  onCopy,
  onDelete,
  onSave,
  isDeleting,
  isSaving,
}: {
  media?: MediaAsset;
  onCopy: (media: MediaAsset) => void;
  onDelete: (media: MediaAsset) => void;
  onSave: (input: { altText: string; caption: string; folder: string }) => void;
  isDeleting: boolean;
  isSaving: boolean;
}) {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [folder, setFolder] = useState('');

  useEffect(() => {
    setAltText(media?.altText ?? '');
    setCaption(media?.caption ?? '');
    setFolder(media?.folder ?? '');
  }, [media]);

  if (!media) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media details</CardTitle>
          <CardDescription>Select an image to edit its metadata.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-border bg-muted text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media details</CardTitle>
        <CardDescription>{media.originalName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-md border border-border bg-muted">
          <img
            alt={media.altText || media.originalName}
            className="max-h-72 w-full object-contain"
            src={media.fileUrl}
          />
        </div>

        <div className="grid gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">File name</p>
            <p className="break-all font-medium">{media.fileName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">File URL</p>
            <p className="break-all font-mono text-xs">{media.fileUrl}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">MIME type</p>
              <p>{media.mimeType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p>{formatBytes(media.fileSize)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uploaded</p>
            <p>{formatDate(media.createdAt)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="media-alt">Alt text</Label>
          <Input
            id="media-alt"
            onChange={(event) => setAltText(event.target.value)}
            value={altText}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="media-caption">Caption</Label>
          <Textarea
            id="media-caption"
            onChange={(event) => setCaption(event.target.value)}
            rows={3}
            value={caption}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="media-folder">Folder</Label>
          <Input
            id="media-folder"
            onChange={(event) => setFolder(event.target.value)}
            placeholder="homepage"
            value={folder}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isSaving}
            onClick={() => onSave({ altText, caption, folder })}
            type="button"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
          <Button onClick={() => onCopy(media)} type="button" variant="outline">
            <Copy className="h-4 w-4" />
            Copy URL
          </Button>
          <Button
            disabled={isDeleting}
            onClick={() => onDelete(media)}
            type="button"
            variant="destructive"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaLibrary() {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaQuery = useMedia({ folder, limit: 18, mimeType, page, search });
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const mediaItems = useMemo(() => mediaQuery.data?.data ?? [], [mediaQuery.data]);
  const selectedMedia =
    mediaItems.find((item) => item.id === selectedMediaId) ?? mediaItems[0];
  const updateMutation = useUpdateMedia(selectedMedia?.id ?? '');
  const meta = mediaQuery.data?.meta;

  useEffect(() => {
    if (!selectedMediaId && mediaItems[0]) {
      setSelectedMediaId(mediaItems[0].id);
    }
  }, [mediaItems, selectedMediaId]);

  function resetMessages() {
    setMessage(null);
    setErrorMessage(null);
  }

  async function uploadFile(file: File) {
    resetMessages();

    if (!isSupportedImage(file)) {
      setErrorMessage('Unsupported file type. Upload JPG, PNG, WebP, or SVG.');
      return;
    }

    try {
      const media = await uploadMutation.mutateAsync({
        file,
        folder: uploadFolder,
      });
      setSelectedMediaId(media.id);
      setMessage('Media uploaded.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Media upload failed.',
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void uploadFile(file);
    }

    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      void uploadFile(file);
    }
  }

  async function handleCopy(media: MediaAsset) {
    resetMessages();

    try {
      await navigator.clipboard.writeText(media.fileUrl);
      setMessage('File URL copied.');
    } catch {
      setErrorMessage('Could not copy the file URL.');
    }
  }

  async function handleSave(input: {
    altText: string;
    caption: string;
    folder: string;
  }) {
    if (!selectedMedia) {
      return;
    }

    resetMessages();

    try {
      await updateMutation.mutateAsync(input);
      setMessage('Media details saved.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Media update failed.',
      );
    }
  }

  async function handleDelete(media: MediaAsset) {
    const confirmed = window.confirm(
      `Delete "${media.originalName}" from the media library?`,
    );

    if (!confirmed) {
      return;
    }

    resetMessages();

    try {
      await deleteMutation.mutateAsync(media.id);
      setSelectedMediaId(null);
      setMessage('Media deleted.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Media delete failed.',
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and manage reusable images for CMS content.
        </p>
      </div>

      {message ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload</CardTitle>
              <CardDescription>JPG, PNG, WebP, and safe SVG files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-folder">Folder</Label>
                <Input
                  id="upload-folder"
                  onChange={(event) => setUploadFolder(event.target.value)}
                  placeholder="homepage"
                  value={uploadFolder}
                />
              </div>
              <div
                className={[
                  'flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed px-4 py-8 text-center transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/40',
                ].join(' ')}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDrop={handleDrop}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <p className="mt-3 text-sm font-medium">
                  {uploadMutation.isPending ? 'Uploading' : 'Drop image here'}
                </p>
                <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Browse files
                  <input
                    accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                    className="sr-only"
                    disabled={uploadMutation.isPending}
                    onChange={handleFileChange}
                    type="file"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Search and filter uploaded images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px]">
                <div className="space-y-2">
                  <Label htmlFor="media-search">Search</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      id="media-search"
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search file name"
                      value={search}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="media-type">File type</Label>
                  <Select
                    id="media-type"
                    onChange={(event) => {
                      setMimeType(event.target.value);
                      setPage(1);
                    }}
                    value={mimeType}
                  >
                    <option value="">All images</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/svg+xml">SVG</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="media-folder-filter">Folder</Label>
                  <Input
                    id="media-folder-filter"
                    onChange={(event) => {
                      setFolder(event.target.value);
                      setPage(1);
                    }}
                    placeholder="homepage"
                    value={folder}
                  />
                </div>
              </div>

              {mediaQuery.isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading media
                </div>
              ) : mediaQuery.isError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {mediaQuery.error.message}
                </div>
              ) : mediaItems.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaItems.map((media) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      onSelect={(item) => setSelectedMediaId(item.id)}
                      selected={selectedMedia?.id === media.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  No media found.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  {meta
                    ? `Page ${meta.page} of ${meta.totalPages} (${meta.total} total)`
                    : 'No pagination data'}
                </span>
                <div className="flex gap-2">
                  <Button
                    disabled={!meta || meta.page <= 1 || mediaQuery.isFetching}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                    type="button"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={
                      !meta ||
                      meta.page >= meta.totalPages ||
                      mediaQuery.isFetching
                    }
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    type="button"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <MediaDetailsPanel
          isDeleting={deleteMutation.isPending}
          isSaving={updateMutation.isPending}
          media={selectedMedia}
          onCopy={(media) => void handleCopy(media)}
          onDelete={(media) => void handleDelete(media)}
          onSave={(input) => void handleSave(input)}
        />
      </div>
    </div>
  );
}
