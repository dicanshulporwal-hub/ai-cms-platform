'use client';

import { Check, ImageIcon, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMedia } from '@/hooks/use-media';
import type { MediaAsset } from '@/types/media';

interface MediaPickerProps {
  onSelect: (media: MediaAsset) => void;
  selectedUrl?: string;
}

export function MediaPicker({ onSelect, selectedUrl }: MediaPickerProps) {
  const [search, setSearch] = useState('');
  const mediaQuery = useMedia({ limit: 12, page: 1, search });
  const mediaItems = mediaQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="media-picker-search">Search media</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            id="media-picker-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search file name"
            value={search}
          />
        </div>
      </div>

      {mediaQuery.isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading media
        </div>
      ) : mediaQuery.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mediaQuery.error.message}
        </div>
      ) : mediaItems.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((media) => {
            const selected = media.fileUrl === selectedUrl;

            return (
              <button
                className={[
                  'relative overflow-hidden rounded-md border bg-card text-left transition-colors',
                  selected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/60',
                ].join(' ')}
                key={media.id}
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
                <div className="p-2">
                  <p className="truncate text-xs font-medium">
                    {media.originalName}
                  </p>
                </div>
                {selected ? (
                  <span className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-8 text-sm text-muted-foreground">
          <ImageIcon className="mb-2 h-6 w-6" />
          No media found.
        </div>
      )}

      <Button
        onClick={() => mediaQuery.refetch()}
        type="button"
        variant="outline"
      >
        Refresh
      </Button>
    </div>
  );
}
