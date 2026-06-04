import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

const API_BASE = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function fetchItem(slug: string) { try { const res = await fetch(`${API_BASE}/public/newsroom/${slug}`, { cache: 'no-store' }); if (!res.ok) return null; return res.json(); } catch { return null; } }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await fetchItem(params.slug);
  if (!item) return { title: 'Not Found' };
  return { title: item.seoTitle || item.title, description: item.seoDescription || item.summary || undefined };
}

export default async function NewsroomDetailPage({ params }: { params: { slug: string } }) {
  const item = await fetchItem(params.slug);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/newsroom" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Back to Newsroom</Link>
      <article>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">{item.itemType.replace(/_/g, ' ')}</span>
            {item.category && <span className="text-xs text-muted-foreground">{item.category.name}</span>}
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--template-text, #111827)' }}>{item.title}</h1>
          {item.summary && <p className="mt-2 text-lg text-muted-foreground">{item.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {item.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(item.publishedAt).toLocaleDateString()}</span>}
            {item.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.location}</span>}
            {item.speakerName && <span>Speaker: {item.speakerName}</span>}
          </div>
        </div>

        {item.featuredImageUrl && <img src={item.featuredImageUrl} alt={item.title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />}

        {item.content && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />}

        {item.videoUrl && <div className="mt-6"><a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">Watch Video <ExternalLink className="h-4 w-4" /></a></div>}

        {item.sourceName && <div className="mt-6 rounded-lg border bg-card p-4 text-sm"><p className="text-muted-foreground">Source: {item.sourceName}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">View source →</a>}</div>}
      </article>
    </div>
  );
}
