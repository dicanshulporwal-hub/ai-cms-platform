'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function UploadContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [licenseName, setLicenseName] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [attributionText, setAttributionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file) { setError('Please select a ZIP file.'); return; }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sourceUrl) formData.append('sourceUrl', sourceUrl);
      if (licenseName) formData.append('licenseName', licenseName);
      if (licenseUrl) formData.append('licenseUrl', licenseUrl);
      if (attributionText) formData.append('attributionText', attributionText);

      const job = await apiClient<any>('/api/templates/import-html/upload', {
        method: 'POST',
        body: formData,
      });
      // Auto-convert
      await apiClient(`/api/templates/import-html/jobs/${job.id}/convert`, { method: 'POST' });
      router.push(`/templates/import-html/review/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload.');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/templates/import-html">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Upload ZIP Template</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload a ZIP containing HTML, CSS, and assets.</p>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Template ZIP File *</CardTitle><CardDescription>ZIP must contain at least one .html file</CardDescription></CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {file ? file.name : 'Drag & drop or click to select a ZIP file'}
            </p>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-3"
            />
            <p className="mt-2 text-xs text-muted-foreground">Max 25MB. Allowed: HTML, CSS, images, fonts.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">License & Attribution</CardTitle><CardDescription>Required: Provide source and license information</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source URL *</Label>
              <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/template" />
            </div>
            <div className="space-y-2">
              <Label>License Name *</Label>
              <Input value={licenseName} onChange={(e) => setLicenseName(e.target.value)} placeholder="MIT, CC BY 4.0, GPL, etc." />
            </div>
            <div className="space-y-2">
              <Label>License URL</Label>
              <Input value={licenseUrl} onChange={(e) => setLicenseUrl(e.target.value)} placeholder="https://opensource.org/licenses/MIT" />
            </div>
            <div className="space-y-2">
              <Label>Attribution Text</Label>
              <Input value={attributionText} onChange={(e) => setAttributionText(e.target.value)} placeholder="Template by Author Name" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading || !file}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload & Analyze
        </Button>
      </div>
    </div>
  );
}

export default function UploadHtmlPage() {
  return (
    <AdminPageShell sectionTitle="Upload ZIP Template">
      {(user) => <UploadContent user={user} />}
    </AdminPageShell>
  );
}
