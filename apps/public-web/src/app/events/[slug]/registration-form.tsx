'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface Props {
  eventId: string;
  spotsLeft: number | null;
  deadline: string | null;
}

export function EventRegistrationForm({ eventId, spotsLeft, deadline }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', organization: '', designation: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-green-50 p-5 text-center">
        <p className="text-green-800 font-medium">✓ Registration Successful</p>
        <p className="text-sm text-green-700 mt-1">You have been registered for this event.</p>
      </div>
    );
  }

  const isExpired = deadline && new Date(deadline) < new Date();

  if (isExpired) {
    return (
      <div className="rounded-xl border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">Registration deadline has passed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold mb-1">Register for this Event</h3>
      {spotsLeft !== null && (
        <p className="text-xs text-muted-foreground mb-3">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
      )}
      {deadline && (
        <p className="text-xs text-muted-foreground mb-3">Deadline: {new Date(deadline).toLocaleDateString()}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Full Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
        <input
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          placeholder="Organization"
          value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          placeholder="Designation"
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'var(--template-primary, #1e40af)' }}
        >
          {submitting ? 'Registering...' : 'Register Now'}
        </button>
      </form>
    </div>
  );
}
