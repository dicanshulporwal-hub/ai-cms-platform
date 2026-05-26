'use client';

import { FormEvent, useRef, useState } from 'react';
import { ArrowLeft, FileUp, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUploadTemplate } from '@/hooks/use-templates';
import type { AuthUser } from '@/types/auth';

function UploadContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadTemplate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) { setError('Please select a ZIP file.'); return; }
    if (!file.name.endsWith('.zip')) { setError('Only ZIP files are accepted.'); return; }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadMutation.mutateAsync(formData);
      router.push('/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/templates"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">Upload Template</h1><p className="mt-1 text-sm text-muted-foreground">Upload a ZIP package containing your website template.</p></div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <Card>
        <CardHeader><CardTitle>Template Package</CardTitle><CardDescription>ZIP must contain template.json, HTML, CSS, and assets.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">{file ? file.name : 'Click to select ZIP file'}</p>
            <p className="mt-1 text-xs text-muted-foreground">Max 25MB. Must include template.json.</p>
            <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
        </CardContent>
      </Card>
      <Button disabled={uploadMutation.isPending || !file} type="submit">{uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} Upload Template</Button>
    </form>
  );
}

export default function UploadTemplatePage() {
  return <AdminPageShell sectionTitle="Upload Template">{(user) => <UploadContent user={user} />}</AdminPageShell>;
}
