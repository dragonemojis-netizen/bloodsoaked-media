export interface CollectionItem {
  title: string;
  year?: number;
  platform?: string;
  notes?: string;
  coverImage?: string;
}

export interface Collection {
  slug: string;
  title: string;
  description: string;
  personalNote?: string;
  coverImage?: string;
  catalogued?: string;
  articleSlugs?: string[];
  mediaLogSlugs?: string[];
  items: CollectionItem[];
}
