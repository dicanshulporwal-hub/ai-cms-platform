import Link from 'next/link';
import { Calendar, MapPin, Globe, Users } from 'lucide-react';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  venueName: string | null;
  venueCity: string | null;
  isOnline: boolean;
  isFeatured: boolean;
  isRegistrationOpen: boolean;
  featuredImageUrl: string | null;
  maxAttendees: number | null;
  _count: { registrations: number };
}

async function fetchEvents(): Promise<{ data: EventItem[]; meta: any } | null> {
  try {
    const res = await fetch(`${API_BASE}/public/events?limit=20`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PublicEventsPage() {
  const result = await fetchEvents();
  const events = result?.data ?? [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>Events</h1>
        <p className="mt-2 text-muted-foreground">Upcoming events, workshops, and conferences</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No upcoming events at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group flex items-start gap-4 rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
            >
              {/* Date badge */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--template-primary, #1e40af) 10%, transparent)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--template-primary, #1e40af)' }}>
                  {new Date(event.startDate).toLocaleDateString('en', { month: 'short' })}
                </span>
                <span className="text-xl font-bold" style={{ color: 'var(--template-primary, #1e40af)' }}>
                  {new Date(event.startDate).getDate()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {event.title}
                  </h2>
                  {event.isFeatured && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Featured</span>
                  )}
                  {event.isRegistrationOpen && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Open</span>
                  )}
                </div>
                {event.summary && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.summary}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.startDate)}
                    {event.startTime && ` at ${event.startTime}`}
                  </span>
                  {event.venueName && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.venueName}{event.venueCity && `, ${event.venueCity}`}
                    </span>
                  )}
                  {event.isOnline && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> Online
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event._count.registrations} registered
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
