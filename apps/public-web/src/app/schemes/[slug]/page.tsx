import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Clock, Users, FileCheck } from 'lucide-react';
import type { Metadata } from 'next';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function fetchScheme(slug: string) {
  try { const res = await fetch(`${API_BASE}/public/schemes/${slug}`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await fetchScheme(params.slug);
  if (!item) return { title: 'Scheme Not Found' };
  return { title: item.seoTitle || item.title, description: item.seoDescription || item.summary || undefined };
}

export default async function SchemeDetailPage({ params }: { params: { slug: string } }) {
  const item = await fetchScheme(params.slug);
  if (!item) notFound();

  const docs: any[] = item.requiredDocumentsJson || [];
  const fees: any[] = item.feesJson || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/schemes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Back to Schemes</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 mb-2 inline-block">Scheme</span>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>{item.title}</h1>
            {item.summary && <p className="mt-2 text-lg text-muted-foreground">{item.summary}</p>}
          </div>

          {item.description && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />}

          {item.eligibilityCriteria && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Eligibility</h2>
              <div className="text-sm whitespace-pre-wrap">{item.eligibilityCriteria}</div>
            </section>
          )}

          {item.benefits && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />Benefits</h2>
              <div className="text-sm whitespace-pre-wrap">{item.benefits}</div>
            </section>
          )}

          {item.applicationProcess && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-lg mb-2">How to Apply</h2>
              <div className="text-sm whitespace-pre-wrap">{item.applicationProcess}</div>
            </section>
          )}

          {docs.length > 0 && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-lg mb-3">Required Documents</h2>
              <ul className="space-y-2">{docs.map((d: any, i: number) => <li key={i} className="flex items-start gap-2 text-sm"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" /><div><span className="font-medium">{d.name}</span>{d.description && <span className="text-muted-foreground"> — {d.description}</span>}{d.isMandatory && <span className="ml-2 text-xs text-red-600">(Mandatory)</span>}</div></li>)}</ul>
            </section>
          )}

          {fees.length > 0 && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold text-lg mb-3">Fees</h2>
              <div className="space-y-2">{fees.map((f: any, i: number) => <div key={i} className="flex justify-between text-sm border-b last:border-0 pb-2"><span>{f.label}</span><span className="font-medium">{f.currency} {f.amount}{f.note && <span className="text-muted-foreground ml-1">({f.note})</span>}</span></div>)}</div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          {item.applicationUrl && item.applicationMode !== 'NOT_APPLICABLE' && (
            <a href={item.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-3 text-sm font-medium text-white" style={{ backgroundColor: 'var(--template-primary, #1e40af)' }}>
              Apply Now <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
            {item.category && <p><span className="text-muted-foreground">Category:</span> {item.category.name}</p>}
            {item.department && <p><span className="text-muted-foreground">Department:</span> {item.department.name}</p>}
            {item.targetAudience && <p><span className="text-muted-foreground">For:</span> {item.targetAudience}</p>}
            {item.applicationMode && <p><span className="text-muted-foreground">Mode:</span> {item.applicationMode.replace('_', ' ')}</p>}
            {item.timeline && <p className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{item.timeline}</p>}
          </div>
          {(item.contactName || item.contactEmail || item.contactPhone) && (
            <div className="rounded-xl border bg-card p-4 space-y-1 text-sm">
              <h3 className="font-medium">Contact</h3>
              {item.contactName && <p>{item.contactName}</p>}
              {item.contactEmail && <p className="text-muted-foreground">{item.contactEmail}</p>}
              {item.contactPhone && <p className="text-muted-foreground">{item.contactPhone}</p>}
              {item.officeAddress && <p className="text-xs text-muted-foreground mt-1">{item.officeAddress}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
