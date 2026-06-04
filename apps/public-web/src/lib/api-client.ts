import type { RenderData } from '@/types/template';
import type {
  PageData,
  BlogPost,
  DocumentItem,
  FaqItem,
  FormDefinition,
  SearchResult,
} from '@/types/content';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const REVALIDATE_SECONDS = parseInt(process.env.TEMPLATE_REVALIDATE_SECONDS ?? '0', 10);

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      cache: REVALIDATE_SECONDS === 0 ? 'no-store' : undefined,
      next: REVALIDATE_SECONDS > 0 ? { revalidate: REVALIDATE_SECONDS } : undefined,
    });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export function fetchRenderData(): Promise<RenderData | null> {
  return apiFetch<RenderData>('/public/template/render-data');
}

export function fetchPageBySlug(slug: string): Promise<PageData | null> {
  return apiFetch<PageData>(`/public/pages/${slug}`);
}

export function fetchBlogPosts(page?: number, limit?: number): Promise<{ data: BlogPost[]; total: number } | null> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  return apiFetch(`/public/blogs?${params.toString()}`);
}

export function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  return apiFetch<BlogPost>(`/public/blogs/${slug}`);
}

export function fetchDocuments(category?: string): Promise<DocumentItem[] | null> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<DocumentItem[]>(`/public/documents${params}`);
}

export function fetchFaqs(): Promise<FaqItem[] | null> {
  return apiFetch<FaqItem[]>('/public/faqs');
}

export function fetchFormBySlug(slug: string): Promise<FormDefinition | null> {
  return apiFetch<FormDefinition>(`/public/forms/${slug}`);
}

export function searchContent(query: string): Promise<{ results: SearchResult[] } | null> {
  return apiFetch(`/public/search?q=${encodeURIComponent(query)}`);
}

export function fetchGlobalSchema(): Promise<object[] | null> {
  return apiFetch<object[]>('/public/structured-data/global');
}

export function fetchContentSchema(sourceType: string, sourceId: string): Promise<object[] | null> {
  return apiFetch<object[]>(`/public/structured-data/${sourceType}/${sourceId}`);
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: string;
  children?: MenuItem[];
}

export interface MenuData {
  id: string;
  name: string;
  location: string;
  items: MenuItem[];
}

export function fetchMenuByLocation(location: string): Promise<MenuData | null> {
  return apiFetch<MenuData>(`/public/menus/location/${location}`);
}
