'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useChatbotSettings, useUpdateChatbotSettings } from '@/hooks/use-chatbot';
import type { ChatbotSettings } from '@/types/chatbot';

const emptySettings: Partial<ChatbotSettings> = {
  fallbackMessage: '',
  greetingMessage: '',
  isEnabled: true,
  leadCaptureEnabled: true,
  supportEmail: '',
};

function SettingsContent() {
  const settingsQuery = useChatbotSettings();
  const updateMutation = useUpdateChatbotSettings();
  const [form, setForm] = useState<Partial<ChatbotSettings>>(emptySettings);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync(form);
      setMessage('Chatbot settings saved.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Settings could not be saved.',
      );
    }
  }

  function updateField(field: keyof ChatbotSettings, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  if (settingsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading chatbot settings
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={saveSettings}>
      <div>
        <h1 className="text-2xl font-semibold">Chatbot settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control public widget availability, greeting, fallback, and lead capture.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {errorMessage || settingsQuery.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage ?? settingsQuery.error?.message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Public widget</CardTitle>
          <CardDescription>These values are used by the public website chatbot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              checked={Boolean(form.isEnabled)}
              className="h-4 w-4"
              onChange={(event) => updateField('isEnabled', event.target.checked)}
              type="checkbox"
            />
            Enable chatbot
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              checked={Boolean(form.leadCaptureEnabled)}
              className="h-4 w-4"
              onChange={(event) =>
                updateField('leadCaptureEnabled', event.target.checked)
              }
              type="checkbox"
            />
            Enable lead capture
          </label>

          <div className="space-y-2">
            <Label htmlFor="greetingMessage">Greeting message</Label>
            <Textarea
              id="greetingMessage"
              onChange={(event) => updateField('greetingMessage', event.target.value)}
              value={form.greetingMessage ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fallbackMessage">Fallback message</Label>
            <Textarea
              id="fallbackMessage"
              onChange={(event) => updateField('fallbackMessage', event.target.value)}
              value={form.fallbackMessage ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input
              id="supportEmail"
              onChange={(event) => updateField('supportEmail', event.target.value)}
              placeholder="support@example.com"
              type="email"
              value={form.supportEmail ?? ''}
            />
          </div>
        </CardContent>
      </Card>

      <Button disabled={updateMutation.isPending} type="submit">
        {updateMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save settings
      </Button>
    </form>
  );
}

export default function ChatbotSettingsPage() {
  return (
    <AdminPageShell sectionTitle="Chatbot Settings">
      {() => <SettingsContent />}
    </AdminPageShell>
  );
}
