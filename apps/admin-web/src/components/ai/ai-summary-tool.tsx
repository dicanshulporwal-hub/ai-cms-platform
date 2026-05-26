'use client';

import { useState } from 'react';
import { Copy, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSummarizeContent } from '@/hooks/use-ai';

interface AISummaryToolProps {
  applyDisabled?: boolean;
  currentContent: string;
  disabled?: boolean;
  onApplySummary?: (summary: string) => void;
}

export function AISummaryTool({
  applyDisabled = false,
  currentContent,
  disabled = false,
  onApplySummary,
}: AISummaryToolProps) {
  const [maxLength, setMaxLength] = useState(120);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useSummarizeContent();

  async function runSummary() {
    setMessage(null);

    try {
      const response = await mutation.mutateAsync({
        content: currentContent,
        maxLength,
      });

      setResult(response.data.result);
      setMessage('Summary ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Summary failed.');
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div>
        <h3 className="text-sm font-medium">Summarize</h3>
        <p className="text-xs text-muted-foreground">
          Create a short summary for excerpts, briefs, or review notes.
        </p>
      </div>
      <div className="max-w-44 space-y-2">
        <Label htmlFor="ai-summary-length">Max words</Label>
        <Input
          disabled={disabled || mutation.isPending}
          id="ai-summary-length"
          max={500}
          min={40}
          onChange={(event) => setMaxLength(Number(event.target.value))}
          type="number"
          value={maxLength}
        />
      </div>
      <Button disabled={disabled || mutation.isPending} onClick={runSummary} type="button">
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Summarize
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {result ? (
        <div className="space-y-2">
          <Textarea readOnly rows={4} value={result} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void navigator.clipboard.writeText(result)} type="button" variant="outline">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            {onApplySummary ? (
              <Button disabled={applyDisabled} onClick={() => onApplySummary(result)} type="button" variant="outline">
                <FileText className="h-4 w-4" />
                Use as excerpt
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
