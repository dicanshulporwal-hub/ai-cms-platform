import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import type { Metadata } from 'next';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function fetchDepartment(slug: string) {
  try { const res = await fetch(`${API_BASE}/public/departments-directory/${slug}`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dept = await fetchDepartment(params.slug);
  if (!dept) return { title: 'Department Not Found' };
  return { title: dept.seoTitle || dept.name, description: dept.seoDescription || dept.description || undefined };
}

export default async function DepartmentDetailPage({ params }: { params: { slug: string } }) {
  const dept = await fetchDepartment(params.slug);
  if (!dept) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/departments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Back to Departments</Link>

      <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>{dept.name}</h1>
      {dept.shortName && <p className="text-muted-foreground">({dept.shortName})</p>}
      {dept.description && <p className="mt-3 text-sm">{dept.description}</p>}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Officers</h2>
          {dept.officers?.length > 0 ? (
            <div className="space-y-3">
              {dept.officers.map((o: any) => (
                <div key={o.id} className="rounded-lg border bg-card p-4 flex items-center gap-3">
                  {o.profilePhotoUrl ? <img src={o.profilePhotoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>}
                  <div><p className="font-medium text-sm">{o.fullName}</p>{o.designation && <p className="text-xs text-muted-foreground">{o.designation.name}</p>}{o.publicEmail && <p className="text-xs text-muted-foreground">{o.publicEmail}</p>}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No public officers listed for this department.</p>}
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
            <h3 className="font-medium">Contact</h3>
            {dept.contactEmail && <p>📧 {dept.contactEmail}</p>}
            {dept.contactPhone && <p>📞 {dept.contactPhone}</p>}
            {dept.officeAddress && <p className="text-xs text-muted-foreground">{dept.officeAddress}</p>}
            {dept.websiteUrl && <a href={dept.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mt-1">Website →</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
