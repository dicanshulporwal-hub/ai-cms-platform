'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

interface Provider { id: string; providerKey: string; providerName: string; isEnabled: boolean; isDefault: boolean; defaultTextModel: string | null; defaultVisionModel: string | null; apiKeyEncrypted: string | null; pricingNotes: string | null; models: any[]; }

function ProvidersContent({ user }: { user: AuthUser }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); try { const data = await apiClient<Provider[]>('/api/ai-providers'); setProviders(data); } catch {} setLoading(false); }

  async function toggleStatus(p: Provider) {
    try { await apiClient(`/api/ai-providers/${p.id}/status`, { method: 'PATCH', body: JSON.stringify({ isEnabled: !p.isEnabled }) }); await load(); } catch {}
  }

  if (user.role !== 'Super Admin' && user.role !== 'Admin') return <div className="text-center py-8 text-muted-foreground">Access restricted.</div>;
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">AI Providers</h1><p className="mt-1 text-sm text-muted-foreground">Configure AI providers, models, and routing preferences.</p></div>
        <Link href="/ai/providers/new"><Button><Plus className="h-4 w-4" /> Add Provider</Button></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Configured Providers</CardTitle><CardDescription>Manage OpenAI, Gemini, and future AI providers.</CardDescription></CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No providers configured. Add one to get started, or the system will use environment variables.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Key</TableHead><TableHead>Text Model</TableHead><TableHead>Vision Model</TableHead><TableHead>API Key</TableHead><TableHead>Status</TableHead><TableHead>Default</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {providers.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.providerName}</TableCell>
                    <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.providerKey}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.defaultTextModel ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.defaultVisionModel ?? '-'}</TableCell>
                    <TableCell>{p.apiKeyEncrypted ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.isEnabled ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Enabled</span> : <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Disabled</span>}</TableCell>
                    <TableCell>{p.isDefault ? <Check className="h-4 w-4 text-primary" /> : null}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/ai/providers/${p.id}/edit`}><Button size="sm" variant="ghost">Edit</Button></Link>
                        <Button size="sm" variant="ghost" onClick={() => toggleStatus(p)}>{p.isEnabled ? 'Disable' : 'Enable'}</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Environment-Based Providers (Currently Active)</CardTitle><CardDescription>These providers are configured via .env and work without database config. Add them to the database for full management.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Google Gemini / AI Studio</p>
              <p className="text-xs text-muted-foreground">Provider: GEMINI • Model: configured via GEMINI_MODEL env • Pricing: FREE_TIER</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Active via .env</span>
          </div>
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">OpenAI</p>
              <p className="text-xs text-muted-foreground">Provider: OPENAI • Model: configured via OPENAI_MODEL env • Pricing: PAID</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{providers.length === 0 ? 'Fallback' : 'Available'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">To manage providers with full control (models, pricing, routing), add them using the "Add Provider" button above.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AiProvidersPage() {
  return <AdminPageShell sectionTitle="AI Providers">{(user) => <ProvidersContent user={user} />}</AdminPageShell>;
}
