'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Globe, Loader2, Play, Search, SkipForward, Upload } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

type PageMode = 'dashboard' | 'word' | 'web' | 'jobs' | 'job-detail' | 'review' | 'rules' | 'logs';

interface ListResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ImportJob {
  id: string;
  originalFileName: string | null;
  sourceType: string;
  sourceUrl: string | null;
  sourceDomain: string | null;
  status: string;
  extractionMode: string;
  importMode: string | null;
  extractedTextPreview: string | null;
  warningsJson: unknown;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number; assets: number; logs: number };
}

interface ImportItem {
  id: string;
  importJobId: string;
  sourceUrl: string | null;
  detectedContentType: string;
  targetModuleKey: string | null;
  title: string;
  slug: string | null;
  summary: string | null;
  confidenceScore: number | null;
  status: string;
  reviewNotes: string | null;
}

interface ImportAsset {
  id: string;
  importItemId: string | null;
  assetType: string;
  sourceUrl: string | null;
  extractedPath: string | null;
  altText: string | null;
  caption: string | null;
  status: string;
}

interface ImportLog {
  id: string;
  importJobId: string;
  importItemId: string | null;
  action: string;
  status: string;
  message: string | null;
  createdAt: string;
}

interface ImportRule {
  id: string;
  name: string;
  isEnabled: boolean;
  priority: number;
  matchType: string;
  matchPattern: string;
  targetModuleKey: string;
  targetEntityType: string;
}

interface Summary {
  totalJobs: number;
  reviewRequired: number;
  completed: number;
  failed: number;
  wordJobs: number;
  webJobs: number;
  recentItems: ImportItem[];
}

const extractionModes = [
  ['BASIC_EXTRACTION', 'Basic Extraction'],
  ['HYBRID', 'Hybrid Recommended'],
  ['AI_ASSISTED', 'AI Assisted'],
  ['RULE_BASED', 'Rule Based'],
];

const targetModules = ['pages', 'blogs', 'faq', 'announcements', 'tender', 'scheme', 'newsroom', 'rti', 'contact_directory', 'documents'];

export function ContentImporterPage({ mode, jobId }: { mode: PageMode; jobId?: string }) {
  return (
    <AdminPageShell sectionTitle="AI Content Importer">
      {() => <ContentImporterContent mode={mode} jobId={jobId} />}
    </AdminPageShell>
  );
}

function ContentImporterContent({ mode, jobId }: { mode: PageMode; jobId?: string }) {
  return (
    <div className="space-y-6">
      <Header />
      {mode === 'dashboard' && <Dashboard />}
      {mode === 'word' && <WordImport />}
      {mode === 'web' && <WebImport />}
      {mode === 'jobs' && <Jobs />}
      {mode === 'job-detail' && jobId && <JobDetail jobId={jobId} />}
      {mode === 'review' && jobId && <Review jobId={jobId} />}
      {mode === 'rules' && <Rules />}
      {mode === 'logs' && <Logs />}
    </div>
  );
}

function Header() {
  const links = [
    ['/ai/content-importer', 'Overview'],
    ['/ai/content-importer/word-import', 'Word Import'],
    ['/ai/content-importer/web-import', 'Web Import'],
    ['/ai/content-importer/jobs', 'Jobs'],
    ['/ai/content-importer/rules', 'Rules'],
    ['/ai/content-importer/logs', 'Logs'],
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">AI Content Importer</h1>
        <p className="text-sm text-muted-foreground">Create reviewable CMS drafts from Word files and authorized public web sources.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    apiClient<Summary>('/api/content-importer/summary').then(setSummary).catch((err) => setError(err.message));
  }, []);
  if (error) return <Notice tone="error" text={error} />;
  if (!summary) return <Loading />;
  const stats = [
    ['Total Jobs', summary.totalJobs],
    ['Needs Review', summary.reviewRequired],
    ['Completed', summary.completed],
    ['Failed', summary.failed],
    ['Word Imports', summary.wordJobs],
    ['Web Imports', summary.webJobs],
  ];
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <Section title="Recent Generated Items">
        <ItemList items={summary.recentItems ?? []} />
      </Section>
    </>
  );
}

function WordImport() {
  const [file, setFile] = useState<File | null>(null);
  const [extractionMode, setExtractionMode] = useState('HYBRID');
  const [job, setJob] = useState<ImportJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function uploadWord() {
    if (!file) return setError('Choose a DOCX file first.');
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const form = new FormData();
      form.set('file', file);
      form.set('extractionMode', extractionMode);
      form.set('importMode', 'CLASSIFY_INTO_MODULES');
      const created = await apiClient<ImportJob>('/api/content-importer/jobs/upload-word', { method: 'POST', body: form });
      setJob(created);
      setMessage('Word file uploaded privately. Extraction can run now.');
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function extract() {
    if (!job) return;
    setBusy(true);
    setError('');
    try {
      const updated = await apiClient<ImportJob>(`/api/content-importer/jobs/${job.id}/extract`, { method: 'POST' });
      setJob(updated);
      setMessage('Extraction completed. Review generated content before importing.');
    } catch (err: any) {
      setError(err.message || 'Extraction failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Word Import">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full rounded-md border bg-background p-2 text-sm" />
          <Select label="Extraction mode" value={extractionMode} onChange={setExtractionMode} options={extractionModes} />
          <div className="flex gap-2">
            <Button onClick={uploadWord} disabled={busy} icon={<Upload className="h-4 w-4" />}>Upload</Button>
            <Button onClick={extract} disabled={busy || !job} icon={<Play className="h-4 w-4" />}>Extract</Button>
          </div>
          {message && <Notice tone="success" text={message} />}
          {error && <Notice tone="error" text={error} />}
        </div>
        <JobCard job={job} />
      </div>
    </Section>
  );
}

function WebImport() {
  const [sourceMode, setSourceMode] = useState<'single' | 'batch' | 'sitemap'>('single');
  const [text, setText] = useState('');
  const [complianceConfirmed, setComplianceConfirmed] = useState(false);
  const [includeImages, setIncludeImages] = useState(false);
  const [respectRobots, setRespectRobots] = useState(true);
  const [sameDomainOnly, setSameDomainOnly] = useState(true);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const lines = useMemo(() => text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean), [text]);

  async function submit() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const body = { complianceConfirmed, includeImages, includeTables: true, includeLinks: true, respectRobots, sameDomainOnly, extractionMode: 'HYBRID', importMode: 'CLASSIFY_INTO_MODULES' };
      const created = sourceMode === 'batch'
        ? await apiClient<ImportJob>('/api/content-importer/jobs/import-url-batch', { method: 'POST', body: { ...body, sourceUrls: lines } })
        : sourceMode === 'sitemap'
          ? await apiClient<ImportJob>('/api/content-importer/jobs/import-sitemap', { method: 'POST', body: { ...body, sourceUrl: lines[0], sourceUrls: lines.slice(1), maxPages: 25 } })
          : await apiClient<ImportJob>('/api/content-importer/jobs/import-url', { method: 'POST', body: { ...body, sourceUrl: lines[0] } });
      setJob(created);
      setMessage('Web import job created.');
    } catch (err: any) {
      setError(err.message || 'Web import failed.');
    } finally {
      setBusy(false);
    }
  }

  async function fetchWeb() {
    if (!job) return;
    setBusy(true);
    setError('');
    try {
      const updated = await apiClient<ImportJob>(`/api/content-importer/jobs/${job.id}/fetch-web`, { method: 'POST' });
      setJob(updated);
      setMessage('Web extraction completed or sitemap URLs collected.');
    } catch (err: any) {
      setError(err.message || 'Fetch failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Web Import">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['single', 'batch', 'sitemap'] as const).map((mode) => (
              <button key={mode} onClick={() => setSourceMode(mode)} className={`rounded-md border px-3 py-1.5 text-sm ${sourceMode === mode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{mode}</button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full rounded-md border bg-background p-3 text-sm" placeholder={sourceMode === 'single' ? 'https://example.gov/page' : 'One URL per line'} />
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={complianceConfirmed} onChange={(e) => setComplianceConfirmed(e.target.checked)} /> I confirm this content is owned, authorized, public-domain, or licensed for reuse.</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeImages} onChange={(e) => setIncludeImages(e.target.checked)} /> Include image references</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={respectRobots} onChange={(e) => setRespectRobots(e.target.checked)} /> Respect robots.txt</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sameDomainOnly} onChange={(e) => setSameDomainOnly(e.target.checked)} /> Same-domain only</label>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={busy || !lines.length} icon={<Globe className="h-4 w-4" />}>Create Job</Button>
            <Button onClick={fetchWeb} disabled={busy || !job} icon={<Play className="h-4 w-4" />}>Fetch</Button>
          </div>
          {message && <Notice tone="success" text={message} />}
          {error && <Notice tone="error" text={error} />}
        </div>
        <JobCard job={job} />
      </div>
    </Section>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setLoading(true);
    try {
      const res = await apiClient<ListResponse<ImportJob>>('/api/content-importer/jobs?limit=20');
      setJobs(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);
  return <Section title="Import Jobs">{loading ? <Loading /> : error ? <Notice tone="error" text={error} /> : <JobTable jobs={jobs} onChanged={load} />}</Section>;
}

function JobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [assets, setAssets] = useState<ImportAsset[]>([]);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  useEffect(() => {
    apiClient<ImportJob>(`/api/content-importer/jobs/${jobId}`).then(setJob);
    apiClient<ListResponse<ImportItem>>(`/api/content-importer/jobs/${jobId}/items`).then((res) => setItems(res.data));
    apiClient<ListResponse<ImportAsset>>(`/api/content-importer/jobs/${jobId}/assets`).then((res) => setAssets(res.data));
    apiClient<ListResponse<ImportLog>>(`/api/content-importer/jobs/${jobId}/logs`).then((res) => setLogs(res.data));
  }, [jobId]);
  return (
    <div className="space-y-4">
      <JobCard job={job} />
      <Section title="Generated Items"><ItemList items={items} /></Section>
      <Section title="Assets"><AssetList assets={assets} /></Section>
      <Section title="Logs"><LogList logs={logs} /></Section>
    </div>
  );
}

function Review({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load() {
    const [jobData, itemData] = await Promise.all([
      apiClient<ImportJob>(`/api/content-importer/jobs/${jobId}`),
      apiClient<ListResponse<ImportItem>>(`/api/content-importer/jobs/${jobId}/items`),
    ]);
    setJob(jobData);
    setItems(itemData.data);
  }
  useEffect(() => { load(); }, [jobId]);
  async function action(itemId: string, actionName: 'approve' | 'skip') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiClient(`/api/content-importer/items/${itemId}/${actionName}`, { method: 'POST' });
      if (actionName === 'approve') {
        const updatedJob = await apiClient<ImportJob>(`/api/content-importer/jobs/${jobId}/import-approved`, { method: 'POST' });
        setJob(updatedJob);
        setMessage('Approved item and started draft import processing.');
      } else {
        setMessage('Skipped item.');
      }
      await load();
    } catch (err: any) {
      setError(err.message || 'Review action failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
      <Section title="Source Outline"><JobCard job={job} /></Section>
      <Section title="Generated Content">
        {message && <Notice tone="success" text={message} />}
        {error && <Notice tone="error" text={error} />}
        <ItemList items={items} onAction={action} disabled={busy} />
      </Section>
      <Section title="Mapping"><p className="text-sm text-muted-foreground">Edit fields in item detail APIs. Rich editor controls will be expanded in the next UI iteration.</p></Section>
    </div>
  );
}

function Rules() {
  const [rules, setRules] = useState<ImportRule[]>([]);
  const [form, setForm] = useState({ name: '', matchPattern: '', targetModuleKey: 'pages', targetEntityType: 'Page', matchType: 'TEXT_CONTAINS' });
  async function load() {
    const res = await apiClient<ListResponse<ImportRule>>('/api/content-importer/rules');
    setRules(res.data);
  }
  useEffect(() => { load(); }, []);
  async function createRule() {
    await apiClient('/api/content-importer/rules', { method: 'POST', body: { ...form, priority: 100, isEnabled: true } });
    setForm({ ...form, name: '', matchPattern: '' });
    load();
  }
  return (
    <Section title="Import Rules">
      <div className="grid gap-3 md:grid-cols-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Rule name" />
        <input value={form.matchPattern} onChange={(e) => setForm({ ...form, matchPattern: e.target.value })} className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Match text" />
        <select value={form.targetModuleKey} onChange={(e) => setForm({ ...form, targetModuleKey: e.target.value })} className="rounded-md border bg-background px-3 py-2 text-sm">{targetModules.map((m) => <option key={m}>{m}</option>)}</select>
        <Button onClick={createRule} disabled={!form.name || !form.matchPattern}>Create Rule</Button>
      </div>
      <div className="mt-4 space-y-2">{rules.map((rule) => <div key={rule.id} className="rounded-md border p-3 text-sm">{rule.priority}. {rule.name} - {rule.matchType} - {rule.targetModuleKey}</div>)}</div>
    </Section>
  );
}

function Logs() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  useEffect(() => {
    apiClient<ListResponse<ImportLog>>('/api/content-importer/logs?limit=50').then((res) => setLogs(res.data));
  }, []);
  return <Section title="Import Logs"><LogList logs={logs} /></Section>;
}

function JobTable({ jobs, onChanged }: { jobs: ImportJob[]; onChanged: () => void }) {
  async function run(job: ImportJob) {
    const path = job.sourceType.startsWith('WEB') ? 'fetch-web' : 'extract';
    await apiClient(`/api/content-importer/jobs/${job.id}/${path}`, { method: 'POST' });
    onChanged();
  }
  if (!jobs.length) return <Empty text="No import jobs yet." />;
  return <div className="space-y-2">{jobs.map((job) => <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"><div><Link className="font-medium hover:underline" href={`/ai/content-importer/jobs/${job.id}`}>{job.originalFileName || job.sourceUrl || job.id}</Link><p className="text-muted-foreground">{job.sourceType} - {job.status}</p></div><div className="flex gap-2"><Button onClick={() => run(job)} icon={<Play className="h-4 w-4" />}>Process</Button><Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href={`/ai/content-importer/review/${job.id}`}>Review</Link></div></div>)}</div>;
}

function ItemList({ disabled, items, onAction }: { disabled?: boolean; items: ImportItem[]; onAction?: (itemId: string, actionName: 'approve' | 'skip') => void }) {
  if (!items.length) return <Empty text="No generated items." />;
  return <div className="space-y-2">{items.map((item) => {
    const canReview = item.status !== 'IMPORTED' && item.status !== 'SKIPPED';
    return <div key={item.id} className="rounded-md border p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.detectedContentType} - {item.targetModuleKey || 'unmapped'} - {item.status}</p>{item.summary && <p className="mt-2 text-sm">{item.summary}</p>}{item.reviewNotes && <Notice tone="warning" text={item.reviewNotes} />}</div>{onAction && canReview && <div className="flex gap-2"><Button onClick={() => onAction(item.id, 'approve')} disabled={disabled} icon={<CheckCircle2 className="h-4 w-4" />}>Approve</Button><Button onClick={() => onAction(item.id, 'skip')} disabled={disabled} icon={<SkipForward className="h-4 w-4" />}>Skip</Button></div>}</div></div>;
  })}</div>;
}

function AssetList({ assets }: { assets: ImportAsset[] }) {
  if (!assets.length) return <Empty text="No extracted assets." />;
  return <div className="space-y-2">{assets.map((asset) => <div key={asset.id} className="rounded-md border p-3 text-sm">{asset.assetType} - {asset.status} - {asset.altText || asset.sourceUrl || asset.extractedPath}</div>)}</div>;
}

function LogList({ logs }: { logs: ImportLog[] }) {
  if (!logs.length) return <Empty text="No logs yet." />;
  return <div className="space-y-2">{logs.map((log) => <div key={log.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{log.action} - {log.status}</p><p className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>{log.message && <p>{log.message}</p>}</div>)}</div>;
}

function JobCard({ job }: { job: ImportJob | null }) {
  if (!job) return <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">No job selected.</div>;
  return <div className="rounded-lg border bg-card p-4 text-sm"><p className="font-medium">{job.originalFileName || job.sourceUrl || job.id}</p><p className="mt-1 text-muted-foreground">{job.sourceType} - {job.status}</p>{job.errorMessage && <Notice tone="error" text={job.errorMessage} />}{job.extractedTextPreview && <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-muted-foreground">{job.extractedTextPreview}</p>}<Link className="mt-3 inline-block text-primary hover:underline" href={`/ai/content-importer/jobs/${job.id}`}>Open job</Link></div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3"><h2 className="text-lg font-semibold">{title}</h2><div className="rounded-lg border bg-card p-4">{children}</div></section>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block text-sm"><span className="mb-1 block font-medium">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
}

function Button({ children, disabled, icon, onClick }: { children: ReactNode; disabled?: boolean; icon?: ReactNode; onClick?: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{icon}{children}</button>;
}

function Loading() {
  return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground"><Search className="h-4 w-4" /> {text}</div>;
}

function Notice({ tone, text }: { tone: 'success' | 'error' | 'warning'; text: string }) {
  const classes = tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-800';
  return <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${classes}`}>{text}</div>;
}
