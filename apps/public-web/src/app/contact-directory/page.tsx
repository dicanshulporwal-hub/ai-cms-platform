import Link from 'next/link';
import { Users, Search } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Officer { id: string; fullName: string; slug: string; publicEmail?: string; publicPhone?: string; officePhone?: string; profilePhotoUrl?: string; designation: { name: string } | null; department: { name: string; slug: string } | null; }

async function fetchDirectory() {
  try { const res = await fetch(`${API_BASE}/public/contact-directory?limit=24`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; }
}

export default async function PublicContactDirectoryPage() {
  const result = await fetchDirectory();
  const officers: Officer[] = result?.data ?? [];
  const settings = result?.settings;

  if (settings && !settings.isPublicDirectoryEnabled) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center"><p className="text-muted-foreground">Contact directory is not currently available.</p></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>Contact Directory</h1>
        <p className="mt-2 text-muted-foreground">Find officers and department contacts</p>
      </div>
      {officers.length === 0 ? (
        <div className="text-center py-16"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No contacts available.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officers.map((o) => (
            <div key={o.id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                {o.profilePhotoUrl ? <img src={o.profilePhotoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>}
                <div><p className="font-medium text-sm">{o.fullName}</p>{o.designation && <p className="text-xs text-muted-foreground">{o.designation.name}</p>}</div>
              </div>
              {o.department && <p className="text-xs text-muted-foreground mb-2">{o.department.name}</p>}
              <div className="space-y-1 text-xs text-muted-foreground">
                {o.publicEmail && <p>📧 {o.publicEmail}</p>}
                {o.publicPhone && <p>📞 {o.publicPhone}</p>}
                {o.officePhone && <p>☎️ {o.officePhone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
