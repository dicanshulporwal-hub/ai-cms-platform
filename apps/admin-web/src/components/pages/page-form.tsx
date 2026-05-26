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
import { Textarea } from '@/components/ui/textarea';
import {
  useApprovePage,
  useCreatePage,
  usePublishPage,
  useSubmitPage,
  useUpdatePage,
} from '@/hooks/use-pages';
import {
  canApprovePage,
  canEditPage,
  canPublishPage,
  canSubmitPage,
} from '@/lib/page-permissions';
import type { AuthUser } from '@/types/auth';
import type { CmsPage, PageFormInput } from '@/types/page';

interface PageFormProps {
  initialPage?: CmsPage;
  user: AuthUser;
}

const emptyForm: PageFormInput = {
  content: '',
  excerpt: '',
  featuredImage: '',
  metaDescription: '',
  metaTitle: '',
  slug: '',
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

function validateForm(form: PageFormInput) {
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

function toFormInput(page?: CmsPage): PageFormInput {
  if (!page) {
    return emptyForm;
  }

  return {
    content: page.content ?? '',
    excerpt: page.excerpt ?? '',
    featuredImage: page.featuredImage ?? '',
    metaDescription: page.metaDescription ?? '',
    metaTitle: page.metaTitle ?? '',
    slug: page.slug,
    title: page.title,
  };
}

function appendHtml(currentContent: string, html: string) {
  return [currentContent.trim(), html.trim()].filter(Boolean).join('\n');
}

export function PageForm({ initialPage, user }: PageFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PageFormInput>(() => toFormInput(initialPage));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage(initialPage?.id ?? '');
  const submitMutation = useSubmitPage();
  const approveMutation = useApprovePage();
  const publishMutation = usePublishPage();

  const canEdit = canEditPage(user, initialPage);
  const canSubmit = canSubmitPage(user, initialPage);
  const canUseAi = canUseAiTools(user.role);
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isActionPending =
    submitMutation.isPending ||
    approveMutation.isPending ||
    publishMutation.isPending;

  useEffect(() => {
    setForm(toFormInput(initialPage));
  }, [initialPage?.id]);

  function updateField(field: keyof PageFormInput, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === 'title' && !currentForm.slug
        ? { slug: slugify(value) }
        : {}),
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
      setErrorMessage('You do not have permission to edit this page.');
      return;
    }

    if (!canSubmit && action === 'submit') {
      setErrorMessage('You do not have permission to submit this page.');
      return;
    }

    try {
      const savedPage = initialPage
        ? await updateMutation.mutateAsync(form)
        : await createMutation.mutateAsync(form);

      if (action === 'submit') {
        await submitMutation.mutateAsync(savedPage.id);
        setSuccessMessage('Page submitted for review.');
      } else {
        setSuccessMessage('Draft saved.');
      }

      if (!initialPage) {
        router.replace(`/pages/${savedPage.id}/edit`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Page could not be saved.',
      );
    }
  }

  async function runWorkflowAction(
    action: 'approve' | 'publish',
    pageId: string,
  ) {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync(pageId);
        setSuccessMessage('Page approved.');
      } else {
        await publishMutation.mutateAsync(pageId);
        setSuccessMessage('Page published.');
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
            {initialPage ? 'Edit page' : 'Create page'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save HTML content as a draft, submit it for review, then publish.
          </p>
        </div>
        {initialPage ? <StatusBadge status={initialPage.status} /> : null}
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
          <CardTitle>Page content</CardTitle>
          <CardDescription>
            Content is stored as sanitized-previewable HTML.
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
                placeholder="About us"
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
                placeholder="about-us"
                required
                value={form.slug}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              disabled={!canEdit || isSaving}
              id="excerpt"
              onChange={(event) => updateField('excerpt', event.target.value)}
              placeholder="Short summary for listings and SEO snippets"
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
          contentType="PAGE"
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
            Keep metadata concise for search and social previews.
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
              placeholder="https://example.com/page-image.jpg"
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

        {initialPage && canApprovePage(user, initialPage) ? (
          <Button
            disabled={isActionPending}
            onClick={() => void runWorkflowAction('approve', initialPage.id)}
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

        {initialPage && canPublishPage(user, initialPage) ? (
          <Button
            disabled={isActionPending}
            onClick={() => void runWorkflowAction('publish', initialPage.id)}
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
