'use client';

import { useState } from 'react';
import { Copy, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRewriteContent } from '@/hooks/use-ai';

interface AIRewriteToolProps {
  applyDisabled?: boolean;
  currentContent: string;
  disabled?: boolean;
  onInsertContent: (html: string) => void;
  onReplaceContent: (html: string) => void;
}

export function AIRewriteTool({
  applyDisabled = false,
  currentContent,
  disabled = false,
  onInsertContent,
  onReplaceContent,
}: AIRewriteToolProps) {
  const [tone, setTone] = useState('clear and polished');
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useRewriteContent();

  async function runRewrite() {
    setMessage(null);

    try {
      const response = await mutation.mutateAsync({
        content: currentContent,
        instruction: instruction.trim() || undefined,
        tone,
      });

      setResult(response.data.result);
      setMessage('Rewrite ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Rewrite failed.');
    }
  }

  function replaceContent() {
    if (!result || !window.confirm('Replace the existing editor content?')) {
      return;
    }

    onReplaceContent(result);
    setMessage('Content replaced.');
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div>
        <h3 className="text-sm font-medium">Rewrite</h3>
        <p className="text-xs text-muted-foreground">
          Rework the current editor content without changing workflow status.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ai-rewrite-tone">Tone</Label>
          <Input
            disabled={disabled || mutation.isPending}
            id="ai-rewrite-tone"
            onChange={(event) => setTone(event.target.value)}
            value={tone}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-rewrite-instruction">Instruction</Label>
          <Input
            disabled={disabled || mutation.isPending}
            id="ai-rewrite-instruction"
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Shorten, make more formal, add examples"
            value={instruction}
          />
        </div>
      </div>
      <Button disabled={disabled || mutation.isPending} onClick={runRewrite} type="button">
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
        Rewrite content
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {result ? (
        <div className="space-y-2">
          <Textarea readOnly rows={5} value={result} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void navigator.clipboard.writeText(result)} type="button" variant="outline">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button disabled={applyDisabled} onClick={() => onInsertContent(result)} type="button" variant="outline">
              Insert below
            </Button>
            <Button disabled={applyDisabled} onClick={replaceContent} type="button" variant="outline">
              <RefreshCcw className="h-4 w-4" />
              Replace editor
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
