'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, MapPin, Award } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { apiClient } from '@/lib/api-client';

export default function ContactDirectoryPage() {
  return <AdminPageShell sectionTitle="Departments & Contacts">{() => <Content />}</AdminPageShell>;
}

function Content() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => { apiClient('/api/contact-directory/summary').then((d: any) => setSummary(d)).catch(() => {}); }, []);

  const cards = [
    { label: 'Departments', value: summary?.departments ?? '-', icon: Building2, href: '/contact-directory/departments', color: 'text-blue-600' },
    { label: 'Officers', value: summary?.officers ?? '-', icon: Users, href: '/contact-directory/officers', color: 'text-purple-600' },
    { label: 'Public Officers', value: summary?.publicOfficers ?? '-', icon: Users, href: '/contact-directory/officers', color: 'text-green-600' },
    { label: 'Designations', value: summary?.designations ?? '-', icon: Award, href: '/contact-directory/designations', color: 'text-amber-600' },
    { label: 'Office Locations', value: summary?.offices ?? '-', icon: MapPin, href: '/contact-directory/officers', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Departments & Contact Directory</h1><p className="text-sm text-muted-foreground mt-1">Manage departments, officers, designations, and contact information</p></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => { const Icon = c.icon; return (
          <div key={c.label} className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => router.push(c.href)}>
            <Icon className={`h-5 w-5 ${c.color} mb-2`} />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ); })}
      </div>
    </div>
  );
}
