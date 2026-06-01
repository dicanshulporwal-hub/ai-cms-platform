import { Injectable } from '@nestjs/common';

export interface ExtractedLink {
  linkUrl: string;
  linkText: string;
  linkType: 'INTERNAL' | 'EXTERNAL' | 'IMAGE' | 'DOCUMENT_LINK' | 'ANCHOR' | 'MEDIA';
}

export interface ContentLinks {
  sourceType: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  links: ExtractedLink[];
}

@Injectable()
export class LinkExtractionService {
  extractFromHtml(html: string, sourceType: string, sourceId: string, sourceTitle: string, sourceUrl: string): ContentLinks {
    const links: ExtractedLink[] = [];

    // Extract <a href="..."> links
    const hrefMatches = html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
    for (const match of hrefMatches) {
      const url = match[1].trim();
      const text = match[2].replace(/<[^>]*>/g, '').trim().substring(0, 200);
      if (!url || url === '#') continue;
      links.push({ linkUrl: url, linkText: text, linkType: this.classifyLink(url) });
    }

    // Extract <img src="..."> links
    const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["']/gi);
    for (const match of imgMatches) {
      const url = match[1].trim();
      if (!url) continue;
      links.push({ linkUrl: url, linkText: '', linkType: 'IMAGE' });
    }

    // Extract document links (PDF, DOC, etc.)
    const docMatches = html.matchAll(/href=["']([^"']*\.(pdf|doc|docx|xls|xlsx|ppt|pptx))["']/gi);
    for (const match of docMatches) {
      links.push({ linkUrl: match[1].trim(), linkText: '', linkType: 'DOCUMENT_LINK' });
    }

    return { sourceType, sourceId, sourceTitle, sourceUrl, links };
  }

  private classifyLink(url: string): ExtractedLink['linkType'] {
    if (url.startsWith('#')) return 'ANCHOR';
    if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) return 'DOCUMENT_LINK';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) return 'IMAGE';
    if (url.match(/\.(mp4|mp3|webm|ogg|wav)$/i)) return 'MEDIA';
    if (url.startsWith('http://') || url.startsWith('https://')) return 'EXTERNAL';
    return 'INTERNAL';
  }
}
