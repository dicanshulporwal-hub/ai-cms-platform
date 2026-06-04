import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Globe, Users, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import { EventRegistrationForm } from './registration-form';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  venueName: string | null;
  venueAddress: string | null;
  venueCity: string | null;
  venueState: string | null;
  isOnline: boolean;
  onlineLink: string | null;
  onlinePlatform: string | null;
  organizerName: string | null;
  organizerEmail: string | null;
  organizerPhone: string | null;
  departmentName: string | null;
  featuredImageUrl: string | null;
  attachmentUrl: string | null;
  maxAttendees: number | null;
  isFeatured: boolean;
  isRegistrationOpen: boolean;
  registrationDeadline: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  _count: { registrations: number };
}

async function fetchEvent(slug: string): Promise<EventData | null> {
  try {
    const res = await fetch(`${API_BASE}/public/events/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await fetchEvent(params.slug);
  if (!event) return { title: 'Event Not Found' };
  return {
    title: event.metaTitle || event.title,
    description: event.metaDescription || event.summary || undefined,
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await fetchEvent(params.slug);
  if (!event) notFound();

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event._count.registrations : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {event.eventType.replace('_', ' ')}
              </span>
              {event.isRegistrationOpen && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Registration Open</span>
              )}
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>
              {event.title}
            </h1>
            {event.summary && <p className="mt-2 text-lg text-muted-foreground">{event.summary}</p>}
          </div>

          {/* Event Info */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{formatDate(event.startDate)}</p>
                {event.endDate && event.endDate !== event.startDate && (
                  <p className="text-muted-foreground">to {formatDate(event.endDate)}</p>
                )}
              </div>
            </div>
            {event.startTime && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-primary" />
                <p>{event.startTime}{event.endTime && ` — ${event.endTime}`} {event.isAllDay && '(All Day)'}</p>
              </div>
            )}
            {event.venueName && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{event.venueName}</p>
                  {event.venueAddress && <p className="text-muted-foreground">{event.venueAddress}</p>}
                  {event.venueCity && <p className="text-muted-foreground">{event.venueCity}{event.venueState && `, ${event.venueState}`}</p>}
                </div>
              </div>
            )}
            {event.isOnline && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Online Event{event.onlinePlatform && ` (${event.onlinePlatform})`}</p>
                  {event.onlineLink && (
                    <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Join Link</a>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-5 w-5 text-primary" />
              <p>{event._count.registrations} registered{event.maxAttendees && ` / ${event.maxAttendees} spots`}</p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
          )}

          {event.attachmentUrl && (
            <a href={event.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              📎 Download Attachment
            </a>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration Form */}
          {event.isRegistrationOpen && (
            <EventRegistrationForm eventId={event.id} spotsLeft={spotsLeft} deadline={event.registrationDeadline} />
          )}

          {/* Organizer */}
          {event.organizerName && (
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <h3 className="font-medium text-sm">Organizer</h3>
              <p className="text-sm">{event.organizerName}</p>
              {event.departmentName && <p className="text-xs text-muted-foreground">{event.departmentName}</p>}
              {event.organizerEmail && <p className="text-xs text-muted-foreground">{event.organizerEmail}</p>}
              {event.organizerPhone && <p className="text-xs text-muted-foreground">{event.organizerPhone}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
