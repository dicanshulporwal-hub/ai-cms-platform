'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Plus, Search, Calendar, Eye, X, CheckCircle, Users } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  venueName: string | null;
  isOnline: boolean;
  isFeatured: boolean;
  isRegistrationOpen: boolean;
  maxAttendees: number | null;
  featuredImageUrl: string | null;
  createdAt: string;
  _count: { registrations: number };
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  CONFERENCE: 'Conference',
  SEMINAR: 'Seminar',
  WORKSHOP: 'Workshop',
  WEBINAR: 'Webinar',
  MEETING: 'Meeting',
  CEREMONY: 'Ceremony',
  SPORTS: 'Sports',
  CULTURAL: 'Cultural',
  TRAINING: 'Training',
  OTHER_EVENT: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  EVENT_DRAFT: 'Draft',
  EVENT_PUBLISHED: 'Published',
  EVENT_CANCELLED: 'Cancelled',
  EVENT_COMPLETED: 'Completed',
  EVENT_ARCHIVED: 'Archived',
};

const STATUS_COLORS: Record<string, string> = {
  EVENT_DRAFT: 'bg-yellow-100 text-yellow-800',
  EVENT_PUBLISHED: 'bg-green-100 text-green-800',
  EVENT_CANCELLED: 'bg-red-100 text-red-800',
  EVENT_COMPLETED: 'bg-blue-100 text-blue-800',
  EVENT_ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<{ total: number; published: number; upcoming: number; registrations: number } | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data = await apiClient(`/events?${params.toString()}`);
      setEvents((data as any).data || []);
      setTotalPages((data as any).meta?.totalPages || 1);
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await apiClient('/events/summary');
      setSummary(data as any);
    } catch {}
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleAction = async (id: string, action: string) => {
    try {
      await apiClient(`/events/${id}/${action}`, { method: 'POST' });
      fetchEvents();
      fetchSummary();
    } catch (e: any) {
      alert(e.message || `Failed to ${action}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await apiClient(`/events/${id}`, { method: 'DELETE' });
      fetchEvents();
      fetchSummary();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage events, seminars, workshops and registrations</p>
        </div>
        <button
          onClick={() => router.push('/events/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-green-600">{summary.published}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{summary.upcoming}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Registrations</p>
            <p className="text-2xl font-bold text-purple-600">{summary.registrations}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="EVENT_DRAFT">Draft</option>
          <option value="EVENT_PUBLISHED">Published</option>
          <option value="EVENT_CANCELLED">Cancelled</option>
          <option value="EVENT_COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg border bg-muted/50 animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-primary">{new Date(event.startDate).toLocaleDateString('en', { month: 'short' })}</span>
                <span className="text-lg font-bold text-primary">{new Date(event.startDate).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate cursor-pointer hover:text-primary" onClick={() => router.push(`/events/${event.id}`)}>
                    {event.title}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[event.status] || ''}`}>
                    {STATUS_LABELS[event.status] || event.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                  {event.venueName && <> · {event.venueName}</>}
                  {event.isOnline && ' · Online'}
                  {event.startTime && <> · {event.startTime}</>}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event._count.registrations}</span>
              </div>
              <div className="flex items-center gap-1">
                {event.status === 'EVENT_DRAFT' && (
                  <button onClick={() => handleAction(event.id, 'publish')} className="p-2 rounded-md hover:bg-green-50 text-green-600" title="Publish">
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                {event.status === 'EVENT_PUBLISHED' && (
                  <>
                    <button onClick={() => handleAction(event.id, 'complete')} className="p-2 rounded-md hover:bg-blue-50 text-blue-600" title="Complete">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleAction(event.id, 'cancel')} className="p-2 rounded-md hover:bg-red-50 text-red-600" title="Cancel">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
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
