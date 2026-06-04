'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const API_BASE = '';

export default function RtiSubmitPage() {
  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantAddress: '',
    subject: '',
    description: '',
    department: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ requestNumber: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicantName || !form.subject || !form.description) {
      setError('Name, subject, and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/rti/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      setSuccess({ requestNumber: data.requestNumber });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">RTI Request Submitted</h1>
        <p className="text-muted-foreground mb-4">Your request has been received successfully.</p>
        <div className="rounded-lg border bg-card p-4 inline-block">
          <p className="text-sm text-muted-foreground">Request Number</p>
          <p className="text-xl font-mono font-bold">{success.requestNumber}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Please save this number for future reference. Statutory response time is 30 days.</p>
        <Link href="/rti" className="mt-6 inline-block text-primary hover:underline text-sm">← Back to RTI page</Link>
      </div>
    );
  }

  const inputClass = "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/rti" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to RTI
      </Link>

      <h1 className="text-2xl font-bold mb-2">Submit RTI Request</h1>
      <p className="text-sm text-muted-foreground mb-6">Fill in the details below. All fields marked * are mandatory.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm">Applicant Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Full Name *</label>
              <input type="text" value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input type="email" value={form.applicantEmail} onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input type="tel" value={form.applicantPhone} onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Department</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} placeholder="(optional)" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Address</label>
            <textarea value={form.applicantAddress} onChange={(e) => setForm({ ...form, applicantAddress: e.target.value })} rows={2} className={inputClass + ' resize-none'} />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm">Request Details</h2>
          <div>
            <label className="block text-xs font-medium mb-1">Subject *</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Information Sought *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className={inputClass + ' resize-none'} required placeholder="Describe the information you are seeking under RTI Act, 2005..." />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-colors" style={{ backgroundColor: 'var(--template-primary, #1e40af)' }}>
          {submitting ? 'Submitting...' : 'Submit RTI Request'}
        </button>
      </form>
    </div>
  );
}
