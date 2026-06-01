'use client';

import { Code, FileUp, Upload } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuthUser } from '@/types/auth';

function ImportContent({ user }: { user: AuthUser }) {
  if (user.role !== 'Super Admin' && user.role !== 'Admin') {
    return <div className="text-center py-8 text-muted-foreground">Access restricted.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Import HTML Template</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert a free HTML template into a CMS-compatible template with automatic region detection.
        </p>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Important:</strong> Only import templates that you have permission to use. Verify the license before using in production.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/templates/import-html/upload" className="block">
          <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Upload ZIP Template</CardTitle>
                  <CardDescription>Upload a ZIP file containing HTML, CSS, and assets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ZIP with index.html, CSS, images, fonts</li>
                <li>• Automatic region detection from HTML structure</li>
                <li>• Assets preserved safely</li>
                <li>• Max 25MB file size</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/templates/import-html/paste" className="block">
          <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Paste HTML/CSS Code</CardTitle>
                  <CardDescription>Paste raw HTML and CSS code directly</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Paste HTML from any source</li>
                <li>• Optional CSS input</li>
                <li>• Instant analysis and conversion</li>
                <li>• No file upload needed</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function ImportHtmlPage() {
  return (
    <AdminPageShell sectionTitle="Import HTML Template">
      {(user) => <ImportContent user={user} />}
    </AdminPageShell>
  );
}
