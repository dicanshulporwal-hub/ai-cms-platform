export type AiContentType = 'PAGE' | 'BLOG';

export interface AiResponse<T = unknown> {
  success: boolean;
  data: {
    metadata: {
      model?: string;
      provider?: string;
      tokenInput?: number;
      tokenOutput?: number;
    };
    result: T;
  };
}

export interface GenerateContentInput {
  contentType: AiContentType;
  topic: string;
  targetAudience: string;
  tone: string;
  keywords?: string;
  language?: string;
}

export interface RewriteContentInput {
  content: string;
  tone: string;
  instruction?: string;
}

export interface SummarizeContentInput {
  content: string;
  maxLength?: number;
}

export interface GenerateFaqInput {
  content: string;
  numberOfQuestions?: number;
}

export interface GenerateSeoInput {
  title: string;
  content: string;
  keywords?: string;
}

export interface ImproveSeoInput {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface GenerateAltTextInput {
  imageUrl: string;
  context?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqResult {
  faqs?: FaqItem[];
}

export interface SeoResult {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  keywordSuggestions?: string[];
  recommendations?: string[];
}

export interface AiUsageUser {
  id: string;
  name: string;
  email: string;
}

export interface AiUsageLog {
  id: string;
  action: string;
  provider: string;
  model?: string | null;
  promptSummary?: string | null;
  tokenInput: number;
  tokenOutput: number;
  user?: AiUsageUser | null;
  createdAt: string;
}

export interface AiUsageResponse {
  data: AiUsageLog[];
}
