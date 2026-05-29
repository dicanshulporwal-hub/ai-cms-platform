export interface PageData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  status: 'PUBLISHED';
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  status: 'PUBLISHED';
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
}

export interface DocumentItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
  category: { id: string; name: string; slug: string } | null;
  publishedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: { id: string; name: string } | null;
  sortOrder: number;
}

export interface FormDefinition {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  submitButtonText: string | null;
  successMessage: string | null;
}

export interface FormField {
  id: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'RADIO' | 'CHECKBOX' | 'FILE_UPLOAD' | 'CONSENT' | 'HIDDEN';
  label: string;
  placeholder: string | null;
  isRequired: boolean;
  validationRules: Record<string, unknown> | null;
  options: { label: string; value: string }[] | null;
  sortOrder: number;
}

export interface SearchResult {
  id: string;
  type: 'PAGE' | 'BLOG' | 'DOCUMENT' | 'FAQ';
  title: string;
  slug: string;
  excerpt: string | null;
}
