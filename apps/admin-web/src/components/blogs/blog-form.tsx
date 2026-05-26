'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Send, Stamp, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AIContentPanel } from '@/components/ai/ai-content-panel';
import { AISeoPanel } from '@/components/ai/ai-seo-panel';
import { canUseAiTools } from '@/components/ai/ai-utils';
import { TiptapEditor } from '@/components/pages/tiptap-editor';
import { StatusBadge } from '@/components/pages/status-badge';
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
  useApproveBlog,
  useCreateBlog,
  usePublishBlog,
  useSubmitBlog,
  useUpdateBlog,
} from '@/hooks/use-blogs';
import { useCategories, useTags } from '@/hooks/use-taxonomy';
import {
  canApproveBlog,
  canEditBlog,
  canPublishBlog,
  canSubmitBlog,
} from '@/lib/blog-permissions';
import type { AuthUser } from '@/types/auth';
import type { BlogFormInput, CmsBlog } from '@/types/blog';

interface BlogFormProps {
  initialBlog?: CmsBlog;
  user: AuthUser;
}

const emptyForm: BlogFormInput = {
  categoryId: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  metaDescription: '',
  metaTitle: '',
  slug: '',
  tagIds: [],
  title: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function hasReadableContent(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}

function validateForm(form: BlogFormInput) {
  if (!form.title.trim()) {
    return 'Title is required.';
  }

  if (!form.slug.trim()) {
    return 'Slug is required.';
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    return 'Slug must use lowercase letters, numbers, and hyphens only.';
  }

  if (!hasReadableContent(form.content)) {
    return 'Content is required.';
  }

  if (form.featuredImage?.trim()) {
    try {
      const url = new URL(form.featuredImage.trim());

      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Featured image must be an HTTP or HTTPS URL.';
      }
    } catch {
      return 'Featured image must be a valid URL.';
    }
  }

  if ((form.metaTitle?.length ?? 0) > 60) {
    return 'Meta title must be 60 characters or fewer.';
  }

  if ((form.metaDescription?.length ?? 0) > 160) {
    return 'Meta description must be 160 characters or fewer.';
  }

  return null;
}

function toFormInput(blog?: CmsBlog): BlogFormInput {
  if (!blog) {
    return emptyForm;
  }

  return {
    categoryId: blog.categoryId ?? '',
    content: blog.content ?? '',
    excerpt: blog.excerpt ?? '',
    featuredImage: blog.featuredImage ?? '',
    metaDescription: blog.metaDescription ?? '',
    metaTitle: blog.metaTitle ?? '',
    slug: blog.slug,
    tagIds: blog.tags.map((tag) => tag.id),
    title: blog.title,
  };
}

function appendHtml(currentContent: string, html: string) {
  return [currentContent.trim(), html.trim()].filter(Boolean).join('\n');
}

export function BlogForm({ initialBlog, user }: BlogFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormInput>(() => toFormInput(initialBlog));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const categoriesQuery = useCategories();
  const tagsQuery = useTags();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog(initialBlog?.id ?? '');
  const submitMutation = useSubmitBlog();
  const approveMutation = useApproveBlog();
  const publishMutation = usePublishBlog();

  const canEdit = canEditBlog(user, initialBlog);
  const canSubmit = canSubmitBlog(user, initialBlog);
  const canUseAi = canUseAiTools(user.role);
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isActionPending =
    submitMutation.isPending ||
    approveMutation.isPending ||
    publishMutation.isPending;

  useEffect(() => {
    setForm(toFormInput(initialBlog));
  }, [initialBlog?.id]);

  function updateField(field: keyof BlogFormInput, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === 'title' && !currentForm.slug
        ? { slug: slugify(value) }
        : {}),
    }));
  }

  function toggleTag(tagId: string) {
    setForm((currentForm) => ({
      ...currentForm,
      tagIds: currentForm.tagIds.includes(tagId)
        ? currentForm.tagIds.filter((id) => id !== tagId)
        : [...currentForm.tagIds, tagId],
    }));
  }

  async function saveDraft(action: 'save' | 'submit') {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateForm(form);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!canEdit && action === 'save') {
      setErrorMessage('You do not have permission to edit this blog.');
      return;
    }

    if (!canSubmit && action === 'submit') {
      setErrorMessage('You do not have permission to submit this blog.');
      return;
    }

    try {
      const savedBlog = initialBlog
        ? await updateMutation.mutateAsync(form)
        : await createMutation.mutateAsync(form);

      if (action === 'submit') {
        await submitMutation.mutateAsync(savedBlog.id);
        setSuccessMessage('Blog submitted for review.');
      } else {
        setSuccessMessage('Draft saved.');
      }

      if (!initialBlog) {
        router.replace(`/blogs/${savedBlog.id}/edit`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Blog could not be saved.',
      );
    }
  }

  async function runWorkflowAction(
    action: 'approve' | 'publish',
    blogId: string,
  ) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync(blogId);
        setSuccessMessage('Blog approved.');
      } else {
        await publishMutation.mutateAsync(blogId);
        setSuccessMessage('Blog published.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Workflow action failed.',
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveDraft('save');
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {initialBlog ? 'Edit blog' : 'Create blog'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft, review, approve, and publish blog content.
          </p>
        </div>
        {initialBlog ? <StatusBadge status={initialBlog.status} /> : null}
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Blog content</CardTitle>
          <CardDescription>
            Content is saved as HTML and sanitized before preview rendering.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                disabled={!canEdit || isSaving}
                id="title"
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="How AI improves CMS workflows"
                required
                value={form.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                disabled={!canEdit || isSaving}
                id="slug"
                onChange={(event) =>
                  updateField('slug', slugify(event.target.value))
                }
                placeholder="how-ai-improves-cms-workflows"
                required
                value={form.slug}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                disabled={!canEdit || isSaving || categoriesQuery.isLoading}
                id="category"
                onChange={(event) => updateField('categoryId', event.target.value)}
                value={form.categoryId}
              >
                <option value="">No category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-card p-3">
                {tagsQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading tags</p>
                ) : tagsQuery.data?.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tagsQuery.data.map((tag) => (
                      <label
                        className="flex items-center gap-2 text-sm"
                        key={tag.id}
                      >
                        <input
                          checked={form.tagIds.includes(tag.id)}
                          className="h-4 w-4"
                          disabled={!canEdit || isSaving}
                          onChange={() => toggleTag(tag.id)}
                          type="checkbox"
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tags created yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              disabled={!canEdit || isSaving}
              id="excerpt"
              onChange={(event) => updateField('excerpt', event.target.value)}
              placeholder="Short summary for listings and search snippets"
              value={form.excerpt}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <TiptapEditor
              disabled={!canEdit || isSaving}
              onChange={(value) => updateField('content', value)}
              value={form.content}
            />
          </div>
        </CardContent>
      </Card>

      {canUseAi ? (
        <AIContentPanel
          applyDisabled={!canEdit || isSaving}
          contentType="BLOG"
          currentContent={form.content}
          disabled={isSaving}
          onApplySummary={(summary) => updateField('excerpt', summary)}
          onInsertContent={(html) =>
            updateField('content', appendHtml(form.content, html))
          }
          onReplaceContent={(html) => updateField('content', html)}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>SEO and media</CardTitle>
          <CardDescription>
            Keep metadata concise and use an external image URL for now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured image URL</Label>
            <Input
              disabled={!canEdit || isSaving}
              id="featuredImage"
              onChange={(event) =>
                updateField('featuredImage', event.target.value)
              }
              placeholder="https://example.com/blog-image.jpg"
              type="url"
              value={form.featuredImage}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input
                disabled={!canEdit || isSaving}
                id="metaTitle"
                maxLength={60}
                onChange={(event) =>
                  updateField('metaTitle', event.target.value)
                }
                value={form.metaTitle}
              />
              <p className="text-xs text-muted-foreground">
                {form.metaTitle?.length ?? 0}/60
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta description</Label>
              <Textarea
                disabled={!canEdit || isSaving}
                id="metaDescription"
                maxLength={160}
                onChange={(event) =>
                  updateField('metaDescription', event.target.value)
                }
                value={form.metaDescription}
              />
              <p className="text-xs text-muted-foreground">
                {form.metaDescription?.length ?? 0}/160
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {canUseAi ? (
        <AISeoPanel
          applyDisabled={!canEdit || isSaving}
          content={form.content}
          disabled={isSaving}
          metaDescription={form.metaDescription ?? ''}
          metaTitle={form.metaTitle ?? ''}
          onApplyMetaDescription={(value) =>
            updateField('metaDescription', value)
          }
          onApplyMetaTitle={(value) => updateField('metaTitle', value)}
          title={form.title}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {canEdit ? (
          <Button disabled={isSaving || isActionPending} type="submit">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save draft
          </Button>
        ) : null}

        {canSubmit ? (
          <Button
            disabled={isSaving || isActionPending}
            onClick={() => void saveDraft('submit')}
            type="button"
            variant="outline"
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit for review
          </Button>
        ) : null}

        {initialBlog && canApproveBlog(user, initialBlog) ? (
          <Button
            disabled={isActionPending}
            onClick={() => void runWorkflowAction('approve', initialBlog.id)}
            type="button"
            variant="outline"
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Stamp className="h-4 w-4" />
            )}
            Approve
          </Button>
        ) : null}

        {initialBlog && canPublishBlog(user, initialBlog) ? (
          <Button
            disabled={isActionPending}
            onClick={() => void runWorkflowAction('publish', initialBlog.id)}
            type="button"
            variant="outline"
          >
            {publishMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Publish
          </Button>
        ) : null}
      </div>
    </form>
  );
}
