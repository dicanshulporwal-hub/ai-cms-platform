'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

function PasteContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [licenseName, setLicenseName] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [attributionText, setAttributionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!html.trim()) { setError('HTML content is required.'); return; }
    setLoading(true);
    setError(null);
    try {
      const job = await apiClient<any>('/api/templates/import-html/paste', {
        method: 'POST',
        body: JSON.stringify({ html, css, sourceUrl, licenseName, licenseUrl, attributionText }),
      });
      // Auto-convert
      await apiClient(`/api/templates/import-html/jobs/${job.id}/convert`, { method: 'POST' });
      router.push(`/templates/import-html/review/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import.');
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
          <h1 className="text-2xl font-semibold">Paste HTML/CSS Code</h1>
          <p className="mt-1 text-sm text-muted-foreground">Paste your HTML template code and optional CSS.</p>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">HTML Code *</CardTitle><CardDescription>Paste the full HTML of the template</CardDescription></CardHeader>
          <CardContent>
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>...</body>\n</html>"
              rows={16}
              className="font-mono text-xs"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">CSS Code (Optional)</CardTitle><CardDescription>Paste associated CSS styles</CardDescription></CardHeader>
          <CardContent>
            <Textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="body { font-family: sans-serif; }\n.header { ... }"
              rows={16}
              className="font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>

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
        <Button onClick={handleSubmit} disabled={loading || !html.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze & Convert
        </Button>
      </div>
    </div>
  );
}

export default function PasteHtmlPage() {
  return (
    <AdminPageShell sectionTitle="Paste HTML/CSS">
      {(user) => <PasteContent user={user} />}
    </AdminPageShell>
  );
}
