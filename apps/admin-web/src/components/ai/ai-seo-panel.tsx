'use client';

import { useState } from 'react';
import { Copy, Loader2, Search, Sparkles } from 'lucide-react';
import { readSeoResult, resultToText } from '@/components/ai/ai-utils';
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
import { useGenerateSeo, useImproveSeo } from '@/hooks/use-ai';
import type { SeoResult } from '@/types/ai';

interface AISeoPanelProps {
  applyDisabled?: boolean;
  content: string;
  disabled?: boolean;
  keywords?: string;
  metaDescription?: string;
  metaTitle?: string;
  onApplyMetaDescription: (value: string) => void;
  onApplyMetaTitle: (value: string) => void;
  title: string;
}

export function AISeoPanel({
  applyDisabled = false,
  content,
  disabled = false,
  keywords = '',
  metaDescription = '',
  metaTitle = '',
  onApplyMetaDescription,
  onApplyMetaTitle,
  title,
}: AISeoPanelProps) {
  const [targetKeywords, setTargetKeywords] = useState(keywords);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const generateMutation = useGenerateSeo();
  const improveMutation = useImproveSeo();
  const isPending = generateMutation.isPending || improveMutation.isPending;
  const seo = readSeoResult(result ?? undefined);

  async function runGenerate() {
    setMessage(null);

    try {
      const response = await generateMutation.mutateAsync({
        content,
        keywords: targetKeywords.trim() || undefined,
        title,
      });

      setResult(response.data.result);
      setMessage('SEO metadata ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'SEO generation failed.');
    }
  }

  async function runImprove() {
    setMessage(null);

    try {
      const response = await improveMutation.mutateAsync({
        content,
        keywords: targetKeywords.trim() || undefined,
        metaDescription: metaDescription || undefined,
        metaTitle: metaTitle || undefined,
        title,
      });

      setResult(response.data.result);
      setMessage('SEO recommendations ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'SEO improvement failed.');
    }
  }

  const resultText = result ? resultToText(result) : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          AI SEO assistant
        </CardTitle>
        <CardDescription>
          Generate search metadata and recommendations without changing publish status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Current meta title</p>
            <p className="mt-1 text-sm font-medium">{metaTitle || 'Not set'}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {metaTitle.length}/60 characters
            </p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Current meta description</p>
            <p className="mt-1 text-sm font-medium">
              {metaDescription || 'Not set'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {metaDescription.length}/160 characters
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-seo-keywords">Target keywords</Label>
          <Input
            disabled={disabled || isPending}
            id="ai-seo-keywords"
            onChange={(event) => setTargetKeywords(event.target.value)}
            placeholder="AI CMS, content operations"
            value={targetKeywords}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled || isPending || !title.trim()} onClick={runGenerate} type="button">
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate SEO
          </Button>
          <Button disabled={disabled || isPending || !title.trim()} onClick={runImprove} type="button" variant="outline">
            {improveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Improve SEO
          </Button>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        {result ? (
          <div className="space-y-4 rounded-md border border-border p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Suggested meta title</p>
                <p className="mt-1 text-sm font-medium">{seo.metaTitle || 'None'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {seo.metaTitle.length}/60
                </p>
                {seo.metaTitle ? (
                  <Button disabled={applyDisabled} onClick={() => onApplyMetaTitle(seo.metaTitle)} type="button" variant="outline">
                    Use title
                  </Button>
                ) : null}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Suggested meta description
                </p>
                <p className="mt-1 text-sm font-medium">
                  {seo.metaDescription || 'None'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {seo.metaDescription.length}/160
                </p>
                {seo.metaDescription ? (
                  <Button disabled={applyDisabled} onClick={() => onApplyMetaDescription(seo.metaDescription)} type="button" variant="outline">
                    Use description
                  </Button>
                ) : null}
              </div>
            </div>

            {seo.keywordSuggestions.length ? (
              <div>
                <p className="text-xs text-muted-foreground">Keyword suggestions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {seo.keywordSuggestions.map((keyword) => (
                    <span
                      className="rounded-md border border-border bg-muted px-2 py-1 text-xs"
                      key={keyword}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {seo.recommendations.length ? (
              <div>
                <p className="text-xs text-muted-foreground">Recommendations</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {seo.recommendations.map((recommendation) => (
                    <li key={recommendation}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Textarea readOnly rows={5} value={resultText} />
            <Button onClick={() => void navigator.clipboard.writeText(resultText)} type="button" variant="outline">
              <Copy className="h-4 w-4" />
              Copy result
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
