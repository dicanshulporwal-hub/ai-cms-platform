'use client';

import { ArrowLeft, ArrowRight, FileText, FolderOpen, HelpCircle, Loader2, Newspaper, Plus } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { TemplateGate } from '@/components/templates/template-gate';
import { TemplateStepper } from '@/components/templates/template-stepper';
import type { AuthUser } from '@/types/auth';

function ContentSetupContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const { data: summary, isLoading } = useDashboardSummary();

  const contentSections = [
    {
      icon: FileText,
      title: 'Pages',
      description: 'Create and manage static pages like Home, About Us, Contact, Services',
      href: '/pages',
      createHref: '/pages/new',
      total: summary?.totalPages ?? 0,
      published: summary?.publishedPages ?? 0,
      draft: summary?.draftPages ?? 0,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Newspaper,
      title: 'Blog Posts',
      description: 'Write articles, news updates, press releases, and announcements',
      href: '/blogs',
      createHref: '/blogs/new',
      total: summary?.totalBlogs ?? 0,
      published: summary?.publishedBlogs ?? 0,
      draft: summary?.draftBlogs ?? 0,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: FolderOpen,
      title: 'Documents',
      description: 'Upload PDFs, forms, circulars, and downloadable resources',
      href: '/documents',
      createHref: '/documents/upload',
      total: 0,
      published: 0,
      draft: 0,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: HelpCircle,
      title: 'FAQs',
      description: 'Add frequently asked questions and answers for visitors',
      href: '/faqs',
      createHref: '/faqs/new',
      total: 0,
      published: 0,
      draft: 0,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <TemplateStepper templateId={templateId} currentStep={4} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Content Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add pages, blog posts, documents, and FAQs to populate your website.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/templates/${templateId}/customize`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Customize
            </Button>
          </Link>
          <Link href={`/templates/${templateId}/settings`}>
            <Button>
              Next: Settings <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Content Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{summary?.totalPages ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Pages</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{summary?.totalBlogs ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Blog Posts</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{summary?.totalMedia ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Media Files</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{(summary?.publishedPages ?? 0) + (summary?.publishedBlogs ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Published</p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription className="text-xs">{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats row */}
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-semibold">{section.total}</span>
                          <span className="text-muted-foreground ml-1">total</span>
                        </div>
                        <div>
                          <span className="font-semibold text-emerald-600">{section.published}</span>
                          <span className="text-muted-foreground ml-1">published</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-600">{section.draft}</span>
                          <span className="text-muted-foreground ml-1">drafts</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={section.createHref} className="flex-1">
                          <Button variant="default" className="w-full">
                            <Plus className="h-4 w-4" /> Create New
                          </Button>
                        </Link>
                        <Link href={section.href}>
                          <Button variant="outline">
                            View All
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Helpful tips */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-900">Getting Started Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Create a <strong>Homepage</strong> first — this will be the landing page for your website visitors.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Add an <strong>About Us</strong> and <strong>Contact</strong> page for essential information.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Blog posts and FAQs help with SEO and visitor engagement.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Upload documents that visitors can download (PDFs, forms, circulars).
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function ContentPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Content Setup">
      {(user) => (
        <TemplateGate>
          <ContentSetupContent user={user} templateId={params.id} />
        </TemplateGate>
      )}
    </AdminPageShell>
  );
}
