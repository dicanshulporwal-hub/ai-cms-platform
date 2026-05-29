'use client';

import { FormEvent, useRef, useState } from 'react';
import { ArrowLeft, FileUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUploadDocument } from '@/hooks/use-documents';
import type { AuthUser } from '@/types/auth';

function UploadContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadDocument();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!file) { setError('Please select a file.'); return; }
    const formData = new FormData(); formData.append('file', file);
    try { const doc = await uploadMutation.mutateAsync(formData); router.push(`/documents/${doc.id}/metadata`); }
    catch (err) { setError(err instanceof Error ? err.message : 'Upload failed.'); }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Link href="/documents"><Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div><h1 className="text-2xl font-semibold">Upload Document</h1><p className="mt-1 text-sm text-muted-foreground">Upload PDF or office documents for AI metadata generation.</p></div>
      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <Card>
        <CardHeader><CardTitle>Document File</CardTitle><CardDescription>Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX. Max 25MB.</CardDescription></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50" onClick={() => fileRef.current?.click()}>
            <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">{file ? file.name : 'Click to select file'}</p>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          {file && <p className="mt-2 text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
        </CardContent>
      </Card>
      <Button disabled={uploadMutation.isPending || !file} type="submit">{uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} Upload</Button>
    </form>
  );
}

export default function UploadDocumentPage() {
  return <AdminPageShell sectionTitle="Upload Document">{(user) => <UploadContent user={user} />}</AdminPageShell>;
}
