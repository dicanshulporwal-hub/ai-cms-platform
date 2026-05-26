'use client';

import { useState } from 'react';
import { Copy, Loader2, RefreshCcw, Sparkles } from 'lucide-react';
import { AIFaqGenerator } from '@/components/ai/ai-faq-generator';
import { AIRewriteTool } from '@/components/ai/ai-rewrite-tool';
import { AISummaryTool } from '@/components/ai/ai-summary-tool';
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
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateContent } from '@/hooks/use-ai';
import type { AiContentType } from '@/types/ai';

interface AIContentPanelProps {
  applyDisabled?: boolean;
  contentType: AiContentType;
  currentContent: string;
  disabled?: boolean;
  onApplySummary?: (summary: string) => void;
  onInsertContent: (html: string) => void;
  onReplaceContent: (html: string) => void;
}

export function AIContentPanel({
  applyDisabled = false,
  contentType,
  currentContent,
  disabled = false,
  onApplySummary,
  onInsertContent,
  onReplaceContent,
}: AIContentPanelProps) {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('clear and practical');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useGenerateContent();

  async function runGenerate() {
    setMessage(null);

    try {
      const response = await mutation.mutateAsync({
        contentType,
        keywords: keywords.trim() || undefined,
        language: language.trim() || undefined,
        targetAudience,
        tone,
        topic,
      });

      setResult(response.data.result);
      setMessage('Content draft ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Content generation failed.');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI content assistant
        </CardTitle>
        <CardDescription>
          Generate, rewrite, summarize, and create FAQs. AI output stays editable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ai-topic">Topic</Label>
            <Input
              disabled={disabled || mutation.isPending}
              id="ai-topic"
              onChange={(event) => setTopic(event.target.value)}
              placeholder="How AI improves editorial workflows"
              value={topic}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-audience">Target audience</Label>
            <Input
              disabled={disabled || mutation.isPending}
              id="ai-audience"
              onChange={(event) => setTargetAudience(event.target.value)}
              placeholder="Marketing teams"
              value={targetAudience}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-tone">Tone</Label>
            <Select
              disabled={disabled || mutation.isPending}
              id="ai-tone"
              onChange={(event) => setTone(event.target.value)}
              value={tone}
            >
              <option value="clear and practical">Clear and practical</option>
              <option value="friendly and conversational">Friendly</option>
              <option value="authoritative and concise">Authoritative</option>
              <option value="premium and confident">Premium</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-language">Language</Label>
            <Input
              disabled={disabled || mutation.isPending}
              id="ai-language"
              onChange={(event) => setLanguage(event.target.value)}
              value={language}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ai-keywords">Keywords</Label>
            <Input
              disabled={disabled || mutation.isPending}
              id="ai-keywords"
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="AI CMS, workflow automation"
              value={keywords}
            />
          </div>
        </div>

        <Button disabled={disabled || mutation.isPending || !topic.trim() || !targetAudience.trim()} onClick={runGenerate} type="button">
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate content
        </Button>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        {result ? (
          <div className="space-y-2">
            <Textarea readOnly rows={8} value={result} />
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

        <div className="grid gap-4 xl:grid-cols-3">
          <AIRewriteTool
            applyDisabled={applyDisabled}
            currentContent={currentContent}
            disabled={disabled}
            onInsertContent={onInsertContent}
            onReplaceContent={onReplaceContent}
          />
          <AISummaryTool
            applyDisabled={applyDisabled}
            currentContent={currentContent}
            disabled={disabled}
            onApplySummary={onApplySummary}
          />
          <AIFaqGenerator
            applyDisabled={applyDisabled}
            currentContent={currentContent}
            disabled={disabled}
            onInsertFaq={onInsertContent}
          />
        </div>
      </CardContent>
    </Card>
  );
}
