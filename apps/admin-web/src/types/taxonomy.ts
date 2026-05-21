export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormInput {
  description?: string;
  name: string;
  slug: string;
}

export interface TagFormInput {
  name: string;
  slug: string;
}
