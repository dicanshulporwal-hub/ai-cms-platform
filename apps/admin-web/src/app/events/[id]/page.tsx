'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Eye, Users, Calendar, MapPin, Globe } from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  designation: string | null;
  status: string;
  registeredAt: string;
}

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  venueName: string | null;
  venueAddress: string | null;
  venueCity: string | null;
  isOnline: boolean;
  onlineLink: string | null;
  onlinePlatform: string | null;
  organizerName: string | null;
  organizerEmail: string | null;
  organizerPhone: string | null;
  departmentName: string | null;
  maxAttendees: number | null;
  isFeatured: boolean;
  isRegistrationOpen: boolean;
  registrationDeadline: string | null;
  publishedAt: string | null;
  registrations: Registration[];
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/events/${id}`);
      setEvent(data as any);
    } catch (e: any) {
      alert(e.message || 'Failed to load event');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const handleAction = async (action: string) => {
    try {
      await apiClient(`/events/${id}/${action}`, { method: 'POST' });
      fetchEvent();
    } catch (e: any) {
      alert(e.message || `Failed to ${action}`);
    }
  };

  if (loading || !event) {
    return <div className="space-y-4"><div className="h-8 w-48 rounded bg-muted animate-pulse" /><div className="h-64 rounded-lg border bg-muted/50 animate-pulse" /></div>;
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/events')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm text-muted-foreground">{event.eventType.replace('_', ' ')} · {event.status.replace('EVENT_', '')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {event.status === 'EVENT_DRAFT' && (
            <button onClick={() => handleAction('publish')} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <Eye className="h-4 w-4" /> Publish
            </button>
          )}
          {event.status === 'EVENT_PUBLISHED' && (
            <button onClick={() => handleAction('complete')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="font-semibold">Event Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(event.startDate)}{event.endDate && ` — ${formatDate(event.endDate)}`}</span>
              </div>
              {event.startTime && <div className="text-muted-foreground">Time: {event.startTime}{event.endTime && ` - ${event.endTime}`}</div>}
              {event.venueName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.venueName}{event.venueCity && `, ${event.venueCity}`}</span>
                </div>
              )}
              {event.isOnline && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Online{event.onlinePlatform && ` (${event.onlinePlatform})`}</span>
                </div>
              )}
            </div>
            {event.description && (
              <div className="mt-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
            )}
          </div>

          {/* Registrations Table */}
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Registrations ({event.registrations.length})
              </h2>
            </div>
            {event.registrations.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No registrations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Name</th>
                      <th className="text-left py-2 px-2 font-medium">Email</th>
                      <th className="text-left py-2 px-2 font-medium">Organization</th>
                      <th className="text-left py-2 px-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.registrations.map((reg) => (
                      <tr key={reg.id} className="border-b last:border-0">
                        <td className="py-2 px-2">{reg.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{reg.email}</td>
                        <td className="py-2 px-2 text-muted-foreground">{reg.organization || '-'}</td>
                        <td className="py-2 px-2 text-muted-foreground">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
            <h3 className="font-medium">Registration</h3>
            <p>Status: {event.isRegistrationOpen ? <span className="text-green-600 font-medium">Open</span> : <span className="text-red-600">Closed</span>}</p>
            {event.maxAttendees && <p>Capacity: {event.registrations.length}/{event.maxAttendees}</p>}
            {event.registrationDeadline && <p>Deadline: {formatDate(event.registrationDeadline)}</p>}
          </div>
          {event.organizerName && (
            <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
              <h3 className="font-medium">Organizer</h3>
              <p>{event.organizerName}</p>
              {event.organizerEmail && <p className="text-muted-foreground">{event.organizerEmail}</p>}
              {event.organizerPhone && <p className="text-muted-foreground">{event.organizerPhone}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
