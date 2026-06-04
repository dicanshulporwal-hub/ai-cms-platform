'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'CEREMONY', label: 'Ceremony' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'OTHER_EVENT', label: 'Other' },
];

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    eventType: 'OTHER_EVENT',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    venueName: '',
    venueAddress: '',
    venueCity: '',
    isOnline: false,
    onlineLink: '',
    onlinePlatform: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    departmentName: '',
    featuredImageUrl: '',
    maxAttendees: '',
    isFeatured: false,
    isRegistrationOpen: false,
    registrationDeadline: '',
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: prev.slug || generateSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.startDate) {
      alert('Title, slug, and start date are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (payload.maxAttendees) payload.maxAttendees = parseInt(payload.maxAttendees, 10);
      else delete payload.maxAttendees;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.registrationDeadline) delete payload.registrationDeadline;

      const event = await apiClient('/events', { method: 'POST', body: JSON.stringify(payload) });
      router.push(`/events/${(event as any).id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/events')} className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className={inputClass}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Summary</label>
              <input type="text" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={inputClass + ' resize-none'} />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAllDay" checked={form.isAllDay} onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })} />
              <label htmlFor="isAllDay" className="text-sm">All Day Event</label>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Venue</h2>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} />
              Online Event
            </label>
          </div>
          {form.isOnline ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <input type="text" value={form.onlinePlatform} onChange={(e) => setForm({ ...form, onlinePlatform: e.target.value })} className={inputClass} placeholder="Zoom, Google Meet, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Link</label>
                <input type="url" value={form.onlineLink} onChange={(e) => setForm({ ...form, onlineLink: e.target.value })} className={inputClass} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Venue Name</label>
                <input type="text" value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" value={form.venueCity} onChange={(e) => setForm({ ...form, venueCity: e.target.value })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input type="text" value={form.venueAddress} onChange={(e) => setForm({ ...form, venueAddress: e.target.value })} className={inputClass} />
              </div>
            </div>
          )}
        </div>

        {/* Registration */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="regOpen" checked={form.isRegistrationOpen} onChange={(e) => setForm({ ...form, isRegistrationOpen: e.target.checked })} />
              <label htmlFor="regOpen" className="text-sm">Open for Registration</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFeat" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              <label htmlFor="isFeat" className="text-sm">Featured Event</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Attendees</label>
              <input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} className={inputClass} min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration Deadline</label>
              <input type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Organizer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.organizerEmail} onChange={(e) => setForm({ ...form, organizerEmail: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={form.organizerPhone} onChange={(e) => setForm({ ...form, organizerPhone: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Event'}
          </button>
          <button type="button" onClick={() => router.push('/events')} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
        </div>
      </form>
    </div>
  );
}
