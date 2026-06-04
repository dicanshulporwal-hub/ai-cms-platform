'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Plus, Search, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';

const STATUS_LABELS: Record<string, string> = {
  RTI_RECEIVED: 'Received',
  RTI_UNDER_PROCESS: 'Under Process',
  RTI_TRANSFERRED: 'Transferred',
  RTI_RESPONSE_SENT: 'Response Sent',
  RTI_FIRST_APPEAL: 'First Appeal',
  RTI_SECOND_APPEAL: 'Second Appeal',
  RTI_CLOSED: 'Closed',
  RTI_REJECTED: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  RTI_RECEIVED: 'bg-blue-100 text-blue-800',
  RTI_UNDER_PROCESS: 'bg-yellow-100 text-yellow-800',
  RTI_TRANSFERRED: 'bg-purple-100 text-purple-800',
  RTI_RESPONSE_SENT: 'bg-green-100 text-green-800',
  RTI_FIRST_APPEAL: 'bg-orange-100 text-orange-800',
  RTI_SECOND_APPEAL: 'bg-red-100 text-red-800',
  RTI_CLOSED: 'bg-gray-100 text-gray-800',
  RTI_REJECTED: 'bg-red-100 text-red-800',
};

interface RtiItem {
  id: string;
  requestNumber: string;
  applicantName: string;
  subject: string;
  department: string | null;
  status: string;
  receivedDate: string;
  dueDate: string | null;
  responseDate: string | null;
  isPublic: boolean;
}

export default function RtiPage() {
  return (
    <AdminPageShell sectionTitle="RTI">
      {() => <RtiContent />}
    </AdminPageShell>
  );
}

function RtiContent() {
  const router = useRouter();
  const [requests, setRequests] = useState<RtiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<any>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data: any = await apiClient(`/rti/requests?${params.toString()}`);
      setRequests(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try { const data = await apiClient('/rti/summary'); setSummary(data); } catch {}
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate) return false;
    if (['RTI_RESPONSE_SENT', 'RTI_CLOSED', 'RTI_REJECTED'].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RTI Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Right to Information request management</p>
        </div>
        <button onClick={() => router.push('/rti/new')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Received</p>
            <p className="text-2xl font-bold text-blue-600">{summary.received}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Under Process</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.underProcess}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Responded</p>
            <p className="text-2xl font-bold text-green-600">{summary.responseSent}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by number, name, or subject..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg border bg-muted/50 animate-pulse" />)}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card">
          <p className="text-muted-foreground">No RTI requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => router.push(`/rti/${req.id}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{req.requestNumber}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[req.status] || 'bg-gray-100'}`}>{STATUS_LABELS[req.status] || req.status}</span>
                  {isOverdue(req.dueDate, req.status) && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Overdue</span>}
                </div>
                <h3 className="font-medium mt-1 truncate">{req.subject}</h3>
                <p className="text-sm text-muted-foreground">{req.applicantName}{req.department && ` · ${req.department}`}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{new Date(req.receivedDate).toLocaleDateString()}</p>
                {req.dueDate && <p className="mt-0.5">Due: {new Date(req.dueDate).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 hover:bg-muted">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50 hover:bg-muted">Next</button>
        </div>
      )}
    </div>
  );
}
