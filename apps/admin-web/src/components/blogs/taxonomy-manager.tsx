'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  useCategories,
  useCreateCategory,
  useCreateTag,
  useDeleteCategory,
  useDeleteTag,
  useTags,
  useUpdateCategory,
  useUpdateTag,
} from '@/hooks/use-taxonomy';
import {
  canDeleteTaxonomy,
  canManageTaxonomy,
} from '@/lib/blog-permissions';
import type { AuthUser } from '@/types/auth';
import type { Category, Tag } from '@/types/taxonomy';

type TaxonomyKind = 'categories' | 'tags';
type TaxonomyItem = Category | Tag;

interface TaxonomyManagerProps {
  kind: TaxonomyKind;
  user: AuthUser;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isCategory(item: TaxonomyItem): item is Category {
  return 'description' in item;
}

export function TaxonomyManager({ kind, user }: TaxonomyManagerProps) {
  const categoriesQuery = useCategories();
  const tagsQuery = useTags();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCategories = kind === 'categories';
  const title = isCategories ? 'Categories' : 'Tags';
  const descriptionText = isCategories
    ? 'Create, edit, and archive blog categories.'
    : 'Create, edit, and archive blog tags.';
  const query = isCategories ? categoriesQuery : tagsQuery;
  const items = (query.data ?? []) as TaxonomyItem[];
  const canManage = canManageTaxonomy(user);
  const canDelete = canDeleteTaxonomy(user);
  const isSaving =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    createTagMutation.isPending ||
    updateTagMutation.isPending;
  const isDeleting =
    deleteCategoryMutation.isPending || deleteTagMutation.isPending;

  function resetForm() {
    setEditingItem(null);
    setName('');
    setSlug('');
    setDescription('');
  }

  function startEditing(item: TaxonomyItem) {
    setEditingItem(item);
    setName(item.name);
    setSlug(item.slug);
    setDescription(isCategory(item) ? item.description ?? '' : '');
    setMessage(null);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Name is required.');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('Slug is required.');
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      setErrorMessage('Slug must use lowercase letters, numbers, and hyphens only.');
      return;
    }

    try {
      if (isCategories) {
        const input = { description, name, slug };

        if (editingItem) {
          await updateCategoryMutation.mutateAsync({
            id: editingItem.id,
            input,
          });
          setMessage('Category updated.');
        } else {
          await createCategoryMutation.mutateAsync(input);
          setMessage('Category created.');
        }
      } else {
        const input = { name, slug };

        if (editingItem) {
          await updateTagMutation.mutateAsync({ id: editingItem.id, input });
          setMessage('Tag updated.');
        } else {
          await createTagMutation.mutateAsync(input);
          setMessage('Tag created.');
        }
      }

      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : `${title.slice(0, -1)} could not be saved.`,
      );
    }
  }

  async function handleDelete(item: TaxonomyItem) {
    const confirmed = window.confirm(`Archive "${item.name}"?`);

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      if (isCategories) {
        await deleteCategoryMutation.mutateAsync(item.id);
        setMessage('Category archived.');
      } else {
        await deleteTagMutation.mutateAsync(item.id);
        setMessage('Tag archived.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : `${title.slice(0, -1)} could not be archived.`,
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descriptionText}</p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? `Edit ${title.slice(0, -1).toLowerCase()}` : `Create ${title.slice(0, -1).toLowerCase()}`}
            </CardTitle>
            <CardDescription>
              Slugs are used for filtering and future public URLs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="taxonomy-name">Name</Label>
                <Input
                  disabled={isSaving}
                  id="taxonomy-name"
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!slug) {
                      setSlug(slugify(event.target.value));
                    }
                  }}
                  required
                  value={name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxonomy-slug">Slug</Label>
                <Input
                  disabled={isSaving}
                  id="taxonomy-slug"
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  required
                  value={slug}
                />
              </div>
              {isCategories ? (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="taxonomy-description">Description</Label>
                  <Textarea
                    disabled={isSaving}
                    id="taxonomy-description"
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button disabled={isSaving} type="submit">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingItem ? 'Save changes' : `Create ${title.slice(0, -1)}`}
                </Button>
                {editingItem ? (
                  <Button onClick={resetForm} type="button" variant="outline">
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{title} library</CardTitle>
          <CardDescription>Active {title.toLowerCase()} available to blogs.</CardDescription>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading {title.toLowerCase()}
            </div>
          ) : query.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {query.error.message}
            </div>
          ) : items.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  {isCategories ? <TableHead>Description</TableHead> : null}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.slug}
                    </TableCell>
                    {isCategories ? (
                      <TableCell className="text-muted-foreground">
                        {isCategory(item) ? item.description ?? '-' : '-'}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {canManage ? (
                          <Button
                            className="h-9 px-3"
                            onClick={() => startEditing(item)}
                            type="button"
                            variant="outline"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            className="h-9 px-3"
                            disabled={isDeleting}
                            onClick={() => void handleDelete(item)}
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
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-md border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              No {title.toLowerCase()} found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
