import Link from 'next/link';
import { Building2 } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Dept { id: string; name: string; slug: string; shortName: string | null; departmentType: string; contactEmail: string | null; contactPhone: string | null; }

async function fetchDepartments(): Promise<Dept[]> {
  try { const res = await fetch(`${API_BASE}/public/departments-directory`, { cache: 'no-store' }); if (!res.ok) return []; return res.json(); } catch { return []; }
}

export default async function PublicDepartmentsPage() {
  const departments = await fetchDepartments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>Departments</h1>
        <p className="mt-2 text-muted-foreground">Government departments and offices</p>
      </div>
      {departments.length === 0 ? (
        <div className="text-center py-16"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No departments listed.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Link key={d.id} href={`/departments/${d.slug}`} className="group rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <h2 className="font-semibold group-hover:text-primary transition-colors">{d.name}</h2>
              {d.shortName && <p className="text-xs text-muted-foreground">({d.shortName})</p>}
              <p className="mt-1 text-xs text-muted-foreground">{d.departmentType}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {d.contactEmail && <p>📧 {d.contactEmail}</p>}
                {d.contactPhone && <p>📞 {d.contactPhone}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
