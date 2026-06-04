import { FileText, Users, Send } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface RtiOfficer {
  id: string;
  name: string;
  designation: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  officerType: string;
}

interface RtiDisclosure {
  id: string;
  requestNumber: string;
  subject: string;
  department: string | null;
  receivedDate: string;
  responseDate: string | null;
  responseText: string | null;
}

async function fetchOfficers(): Promise<RtiOfficer[]> {
  try {
    const res = await fetch(`${API_BASE}/public/rti/officers`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function fetchDisclosures(): Promise<{ data: RtiDisclosure[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/public/rti/disclosures?limit=10`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function PublicRtiPage() {
  const [officers, disclosuresResult] = await Promise.all([fetchOfficers(), fetchDisclosures()]);
  const disclosures = disclosuresResult?.data ?? [];

  const pioOfficers = officers.filter((o) => o.officerType === 'PIO');
  const appellateOfficers = officers.filter((o) => o.officerType === 'APPELLATE');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>
          Right to Information (RTI)
        </h1>
        <p className="mt-2 text-muted-foreground">
          Information under the Right to Information Act, 2005
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Officers Section */}
          {officers.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" /> RTI Officers
              </h2>

              {pioOfficers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Public Information Officers (PIO)</h3>
                  <div className="space-y-3">
                    {pioOfficers.map((officer) => (
                      <div key={officer.id} className="rounded-lg border bg-card p-4">
                        <p className="font-medium">{officer.name}</p>
                        {officer.designation && <p className="text-sm text-muted-foreground">{officer.designation}</p>}
                        {officer.department && <p className="text-sm text-muted-foreground">{officer.department}</p>}
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          {officer.email && <span>📧 {officer.email}</span>}
                          {officer.phone && <span>📞 {officer.phone}</span>}
                        </div>
                        {officer.address && <p className="text-xs text-muted-foreground mt-1">{officer.address}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appellateOfficers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">First Appellate Authority</h3>
                  <div className="space-y-3">
                    {appellateOfficers.map((officer) => (
                      <div key={officer.id} className="rounded-lg border bg-card p-4">
                        <p className="font-medium">{officer.name}</p>
                        {officer.designation && <p className="text-sm text-muted-foreground">{officer.designation}</p>}
                        {officer.department && <p className="text-sm text-muted-foreground">{officer.department}</p>}
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          {officer.email && <span>📧 {officer.email}</span>}
                          {officer.phone && <span>📞 {officer.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Disclosures Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" /> Public Disclosures
            </h2>
            {disclosures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No public disclosures available.</p>
            ) : (
              <div className="space-y-3">
                {disclosures.map((d) => (
                  <div key={d.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{d.requestNumber}</span>
                      {d.department && <span className="text-xs text-muted-foreground">· {d.department}</span>}
                    </div>
                    <h3 className="font-medium">{d.subject}</h3>
                    {d.responseText && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{d.responseText}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Received: {new Date(d.receivedDate).toLocaleDateString()}
                      {d.responseDate && ` · Responded: ${new Date(d.responseDate).toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Send className="h-4 w-4" /> File an RTI Request
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              You can submit an RTI request online. The statutory response time is 30 days.
            </p>
            <Link
              href="/rti/submit"
              className="block w-full text-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--template-primary, #1e40af)' }}
            >
              Submit RTI Request
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-2">Important Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RTI Online Portal (Government)</a></li>
              <li><a href="https://cic.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Central Information Commission</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
