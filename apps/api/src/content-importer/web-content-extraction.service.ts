import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { lookup } from 'dns/promises';
import { isIP } from 'net';

export interface WebExtractionSettings {
  includeImages?: boolean;
  includeTables?: boolean;
  includeLinks?: boolean;
  respectRobots?: boolean;
  maxResponseBytes?: number;
  timeoutMs?: number;
  maxRedirects?: number;
}

interface WebHeading {
  id: string;
  level: number;
  text: string;
  content: string[];
  tables: unknown[];
  images: unknown[];
  links: unknown[];
}

export interface WebExtractionResult {
  sourceUrl: string;
  canonicalUrl: string;
  domain: string;
  title: string;
  metaDescription: string;
  publishedAt: string | null;
  author: string;
  headings: WebHeading[];
  paragraphs: string[];
  tables: string[][][];
  images: {
    sourceUrl: string;
    altText: string;
    caption: string;
    sectionId: string | null;
    isDownloadAllowed: boolean | null;
  }[];
  links: { text: string; url: string; sectionId: string | null }[];
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: string;
  };
  metadata: {
    wordCount: number;
    detectedLanguage: string;
    contentHash: string;
    fetchedAt: string;
    robotsChecked: boolean;
    robotsAllowed: boolean;
  };
  warnings: string[];
}

@Injectable()
export class WebContentExtractionService {
  async extractUrl(url: string, settings: WebExtractionSettings = {}): Promise<WebExtractionResult> {
    const normalized = this.normalizeHttpUrl(url);
    await this.assertPublicNetworkTarget(normalized);

    const warnings: string[] = [];
    let robotsAllowed = true;
    let robotsChecked = false;
    if (settings.respectRobots ?? true) {
      const robots = await this.checkRobots(normalized);
      robotsAllowed = robots.allowed;
      robotsChecked = true;
      warnings.push(...robots.warnings);
      if (!robots.allowed) throw new BadRequestException('robots.txt disallows importing this URL.');
    }

    const fetched = await this.fetchText(normalized, settings);
    const contentType = fetched.contentType.toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new BadRequestException('Only public HTML pages can be imported by web extraction.');
    }

    const finalUrl = this.normalizeHttpUrl(fetched.finalUrl);
    const domain = finalUrl.hostname.replace(/^www\./, '');
    const html = this.stripUnsafeHtml(fetched.body);
    const title = this.firstText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || 'Imported Web Content';
    const metaDescription = this.meta(html, 'description');
    const canonicalUrl = this.absoluteUrl(this.linkRel(html, 'canonical'), finalUrl) || finalUrl.toString();
    const paragraphs = this.extractParagraphs(html);
    const headings = this.extractHeadings(html, paragraphs);
    const tables = settings.includeTables === false ? [] : this.extractTables(html);
    const links = settings.includeLinks === false ? [] : this.extractLinks(html, finalUrl);
    const images = settings.includeImages ? this.extractImages(html, finalUrl) : [];
    const openGraph = {
      title: this.meta(html, 'og:title', true),
      description: this.meta(html, 'og:description', true),
      image: this.absoluteUrl(this.meta(html, 'og:image', true), finalUrl) || '',
      type: this.meta(html, 'og:type', true),
    };
    const text = [title, metaDescription, ...paragraphs].filter(Boolean).join('\n\n');

    if (!paragraphs.length) warnings.push('No readable paragraph content was detected.');
    if (!images.length && settings.includeImages) warnings.push('No images were detected.');
    if (!tables.length && settings.includeTables !== false) warnings.push('No tables were detected.');

    return {
      sourceUrl: normalized.toString(),
      canonicalUrl,
      domain,
      title: this.clean(title).slice(0, 500),
      metaDescription: this.clean(metaDescription),
      publishedAt: this.publishedAt(html),
      author: this.meta(html, 'author'),
      headings,
      paragraphs,
      tables,
      images,
      links,
      openGraph,
      metadata: {
        wordCount: this.countWords(text),
        detectedLanguage: this.htmlLang(html),
        contentHash: createHash('sha256').update(text).digest('hex'),
        fetchedAt: new Date().toISOString(),
        robotsChecked,
        robotsAllowed,
      },
      warnings,
    };
  }

  async extractSitemapUrls(url: string, maxUrls: number, sameDomainOnly = true) {
    const normalized = this.normalizeHttpUrl(url);
    await this.assertPublicNetworkTarget(normalized);
    const fetched = await this.fetchText(normalized, { maxResponseBytes: 2 * 1024 * 1024, timeoutMs: 8000 });
    const urls = [...fetched.body.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
      .map((match) => this.decode(match[1]).trim())
      .filter(Boolean)
      .map((loc) => this.absoluteUrl(loc, normalized))
      .filter((loc): loc is string => Boolean(loc));
    const unique = [...new Set(urls)].slice(0, maxUrls);
    const baseDomain = normalized.hostname.replace(/^www\./, '');
    return unique.filter((loc) => {
      const parsed = this.normalizeHttpUrl(loc);
      return !sameDomainOnly || parsed.hostname.replace(/^www\./, '') === baseDomain;
    });
  }

  async checkRobots(url: URL) {
    const robotsUrl = new URL('/robots.txt', url.origin);
    try {
      const fetched = await this.fetchText(robotsUrl, { maxResponseBytes: 256 * 1024, timeoutMs: 5000, maxRedirects: 2 });
      if (!fetched.statusOk) {
        return { allowed: true, warnings: ['robots.txt was not available; import may require manual confirmation.'] };
      }
      return {
        allowed: this.robotsAllows(fetched.body, url.pathname || '/'),
        warnings: [] as string[],
      };
    } catch {
      return { allowed: true, warnings: ['robots.txt check failed; import may require manual confirmation.'] };
    }
  }

  private async fetchText(url: URL, settings: WebExtractionSettings) {
    let current = url;
    const maxRedirects = settings.maxRedirects ?? 3;
    for (let redirect = 0; redirect <= maxRedirects; redirect++) {
      await this.assertPublicNetworkTarget(current);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), settings.timeoutMs ?? 10000);
      try {
        const response = await fetch(current, {
          headers: {
            accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.1',
            'user-agent': 'AI-CMS-Content-Importer/1.0',
          },
          redirect: 'manual',
          signal: controller.signal,
        });
        const location = response.headers.get('location');
        if ([301, 302, 303, 307, 308].includes(response.status) && location) {
          current = this.normalizeHttpUrl(this.absoluteUrl(location, current) || location);
          continue;
        }
        const maxBytes = settings.maxResponseBytes ?? 1024 * 1024;
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > maxBytes) throw new BadRequestException('Response is too large to import safely.');
        return {
          body: buffer.toString('utf8'),
          contentType: response.headers.get('content-type') ?? '',
          finalUrl: current.toString(),
          statusOk: response.ok,
        };
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException('Failed to fetch public URL within timeout.');
      } finally {
        clearTimeout(timeout);
      }
    }
    throw new BadRequestException('Too many redirects while fetching URL.');
  }

  private async assertPublicNetworkTarget(url: URL) {
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (this.isBlockedHostname(hostname)) throw new BadRequestException('Private or internal URLs cannot be imported.');
    try {
      const addresses = await lookup(hostname, { all: true });
      if (addresses.some((entry) => this.isBlockedHostname(entry.address))) {
        throw new BadRequestException('URL resolves to a private or internal address.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Could not resolve URL hostname safely.');
    }
  }

  private normalizeHttpUrl(rawUrl: string | URL) {
    const parsed = rawUrl instanceof URL ? rawUrl : new URL(rawUrl.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new BadRequestException('Only HTTP and HTTPS URLs are allowed.');
    if (parsed.username || parsed.password) throw new BadRequestException('Credentialed URLs are not allowed.');
    parsed.hash = '';
    return parsed;
  }

  private isBlockedHostname(hostname: string): boolean {
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      !hostname.includes('.')
    ) {
      return true;
    }
    const version = isIP(hostname);
    if (version === 4) {
      const [a, b, c] = hostname.split('.').map(Number);
      return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 0) ||
        (a === 192 && b === 168) ||
        (a === 169 && b === 254) ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 192 && b === 0 && c === 2) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113) ||
        a >= 224
      );
    }
    if (version === 6) {
      const ipv4Mapped = hostname.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
      if (ipv4Mapped) return this.isBlockedHostname(ipv4Mapped[1]);
      return (
        hostname === '::' ||
        hostname === '::1' ||
        hostname.startsWith('2001:db8') ||
        /^fe[89ab]/.test(hostname) ||
        hostname.startsWith('fc') ||
        hostname.startsWith('fd') ||
        hostname.startsWith('ff')
      );
    }
    return false;
  }

  private robotsAllows(robots: string, path: string) {
    const lines = robots.split(/\r?\n/).map((line) => line.replace(/#.*/, '').trim()).filter(Boolean);
    let applies = false;
    for (const line of lines) {
      const [rawKey, ...rest] = line.split(':');
      const key = rawKey?.trim().toLowerCase();
      const value = rest.join(':').trim();
      if (key === 'user-agent') applies = value === '*';
      if (applies && key === 'disallow' && value && path.startsWith(value)) return false;
    }
    return true;
  }

  private stripUnsafeHtml(html: string) {
    return html
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
      .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '');
  }

  private extractHeadings(html: string, paragraphs: string[]): WebHeading[] {
    const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match, index) => ({
      id: `section-${index + 1}`,
      level: Number(match[1]),
      text: this.clean(this.text(match[2])),
      content: [] as string[],
      tables: [] as unknown[],
      images: [] as unknown[],
      links: [] as unknown[],
    })).filter((heading) => heading.text);
    if (!headings.length && paragraphs.length) {
      headings.push({ id: 'section-1', level: 1, text: 'Web Content', content: paragraphs.slice(0, 20), tables: [], images: [], links: [] });
    }
    return headings;
  }

  private extractParagraphs(html: string) {
    return [...html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((match) => this.clean(this.text(match[2])))
      .filter((text) => text.length > 20)
      .slice(0, 200);
  }

  private extractTables(html: string): string[][][] {
    return [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].slice(0, 20).map((tableMatch) =>
      [...tableMatch[0].matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((rowMatch) =>
        [...rowMatch[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cellMatch) => this.clean(this.text(cellMatch[1]))),
      ).filter((row) => row.some(Boolean)),
    ).filter((table) => table.length);
  }

  private extractLinks(html: string, baseUrl: URL) {
    return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((match) => ({ text: this.clean(this.text(match[2])), url: this.absoluteUrl(match[1], baseUrl), sectionId: null }))
      .filter((link): link is { text: string; url: string; sectionId: null } => Boolean(link.text && link.url && !link.url.startsWith('javascript:')))
      .slice(0, 200);
  }

  private extractImages(html: string, baseUrl: URL) {
    return [...html.matchAll(/<img\b([^>]+?)>/gi)]
      .map((match) => ({
        sourceUrl: this.absoluteUrl(this.attr(match[1], 'src') ?? '', baseUrl) || '',
        altText: this.clean(this.attr(match[1], 'alt') ?? ''),
        caption: '',
        sectionId: null,
        isDownloadAllowed: null,
      }))
      .filter((image) => image.sourceUrl && !image.sourceUrl.startsWith('data:'))
      .slice(0, 100);
  }

  private meta(html: string, name: string, property = false) {
    const attr = property ? 'property' : 'name';
    const pattern = new RegExp(`<meta\\b[^>]*${attr}=["']${this.escapeRegex(name)}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
    return this.clean(this.decode(html.match(pattern)?.[1] ?? ''));
  }

  private linkRel(html: string, rel: string) {
    const pattern = new RegExp(`<link\\b[^>]*rel=["']${this.escapeRegex(rel)}["'][^>]*href=["']([^"']+)["'][^>]*>`, 'i');
    return this.decode(html.match(pattern)?.[1] ?? '');
  }

  private publishedAt(html: string) {
    return (
      this.meta(html, 'article:published_time', true) ||
      this.meta(html, 'publish_date') ||
      this.meta(html, 'date') ||
      null
    );
  }

  private htmlLang(html: string) {
    return this.attr(html.match(/<html\b([^>]*)>/i)?.[1] ?? '', 'lang') || 'unknown';
  }

  private absoluteUrl(value: string | null, baseUrl: URL) {
    if (!value) return null;
    try {
      const parsed = new URL(this.decode(value), baseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return null;
    }
  }

  private firstText(value?: string) {
    return this.clean(this.text(value ?? ''));
  }

  private text(html: string) {
    return this.decode(html.replace(/<[^>]+>/g, ' '));
  }

  private clean(value: string) {
    return value.replace(/\s+/g, ' ').trim();
  }

  private decode(value: string) {
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }

  private attr(html: string, name: string) {
    return html.match(new RegExp(`${this.escapeRegex(name)}=["']([^"']+)["']`, 'i'))?.[1] ?? null;
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private countWords(text: string) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }
}
