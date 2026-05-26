'use client';

import { useState } from 'react';
import { Copy, HelpCircle, Loader2 } from 'lucide-react';
import { faqsToHtml, resultToText } from '@/components/ai/ai-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateFaq } from '@/hooks/use-ai';
import type { FaqResult } from '@/types/ai';

interface AIFaqGeneratorProps {
  applyDisabled?: boolean;
  currentContent: string;
  disabled?: boolean;
  onInsertFaq: (html: string) => void;
}

export function AIFaqGenerator({
  applyDisabled = false,
  currentContent,
  disabled = false,
  onInsertFaq,
}: AIFaqGeneratorProps) {
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [result, setResult] = useState<FaqResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useGenerateFaq();

  async function runFaq() {
    setMessage(null);

    try {
      const response = await mutation.mutateAsync({
        content: currentContent,
        numberOfQuestions,
      });

      setResult(response.data.result);
      setMessage('FAQ ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'FAQ generation failed.');
    }
  }

  function insertFaq() {
    if (!result) {
      return;
    }

    const html = faqsToHtml(result);

    if (!html) {
      setMessage('No FAQ items were returned.');
      return;
    }

    onInsertFaq(html);
    setMessage('FAQ inserted.');
  }

  const resultText = result ? resultToText(result) : '';

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div>
        <h3 className="text-sm font-medium">FAQ generator</h3>
        <p className="text-xs text-muted-foreground">
          Build question-answer pairs from the current content.
        </p>
      </div>
      <div className="max-w-48 space-y-2">
        <Label htmlFor="ai-faq-count">Questions</Label>
        <Input
          disabled={disabled || mutation.isPending}
          id="ai-faq-count"
          max={10}
          min={2}
          onChange={(event) => setNumberOfQuestions(Number(event.target.value))}
          type="number"
          value={numberOfQuestions}
        />
      </div>
      <Button disabled={disabled || mutation.isPending} onClick={runFaq} type="button">
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <HelpCircle className="h-4 w-4" />
        )}
        Generate FAQ
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {result ? (
        <div className="space-y-2">
          <Textarea readOnly rows={6} value={resultText} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void navigator.clipboard.writeText(resultText)} type="button" variant="outline">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button disabled={applyDisabled} onClick={insertFaq} type="button" variant="outline">
              Insert FAQ
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
