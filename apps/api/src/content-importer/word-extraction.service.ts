import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';

interface ExtractedHeading {
  id: string;
  level: number;
  text: string;
  content: string[];
  tables: unknown[];
  images: unknown[];
  links: unknown[];
}

interface ExtractedImage {
  assetId: string;
  fileName: string;
  altText: string;
  caption: string;
  sectionId: string | null;
  extractedPath: string;
}

interface ExtractedLink {
  text: string;
  url: string;
  sectionId: string | null;
}

export interface WordExtractionResult {
  title: string;
  headings: ExtractedHeading[];
  paragraphs: string[];
  tables: string[][][];
  images: ExtractedImage[];
  links: ExtractedLink[];
  metadata: {
    wordCount: number;
    pageCount: null;
    detectedLanguage: string;
    hasImages: boolean;
    hasTables: boolean;
    contentHash: string;
  };
  warnings: string[];
}

interface ParagraphNode {
  level: number | null;
  text: string;
}

@Injectable()
export class WordExtractionService {
  async extractDocx(filePath: string, outputDir: string, jobId: string): Promise<WordExtractionResult> {
    const zip = new AdmZip(filePath);
    const documentXml = zip.getEntry('word/document.xml')?.getData().toString('utf8');
    if (!documentXml) {
      throw new Error('DOCX document.xml is missing.');
    }

    await mkdir(outputDir, { recursive: true });

    const warnings: string[] = [];
    const rels = this.parseRelationships(zip);
    const paragraphs = this.extractParagraphs(documentXml);
    const tables = this.extractTables(documentXml);
    const links = this.extractLinks(documentXml, rels);
    const images = await this.extractImages(zip, outputDir, jobId);
    const plainParagraphs = paragraphs.map((paragraph) => paragraph.text).filter(Boolean);
    const title =
      paragraphs.find((paragraph) => paragraph.level === 1)?.text ||
      plainParagraphs.find((paragraph) => paragraph.length > 3) ||
      'Imported Word Content';
    const headings = this.buildHeadings(paragraphs, links);
    const text = plainParagraphs.join('\n\n');

    if (!plainParagraphs.length) warnings.push('No readable paragraph text was found.');
    if (!tables.length) warnings.push('No tables were detected.');
    if (!images.length) warnings.push('No embedded images were detected.');

    return {
      title,
      headings,
      paragraphs: plainParagraphs,
      tables,
      images,
      links,
      metadata: {
        wordCount: this.countWords(text),
        pageCount: null,
        detectedLanguage: 'unknown',
        hasImages: images.length > 0,
        hasTables: tables.length > 0,
        contentHash: createHash('sha256').update(text).digest('hex'),
      },
      warnings,
    };
  }

  private parseRelationships(zip: AdmZip) {
    const relsXml = zip.getEntry('word/_rels/document.xml.rels')?.getData().toString('utf8') ?? '';
    const relationships = new Map<string, { target: string; type: string }>();
    const relPattern = /<Relationship\b([^>]+?)\/>/g;
    let match: RegExpExecArray | null;
    while ((match = relPattern.exec(relsXml))) {
      const attrs = match[1];
      const id = this.attr(attrs, 'Id');
      const target = this.attr(attrs, 'Target');
      const type = this.attr(attrs, 'Type');
      if (id && target && type) relationships.set(id, { target, type });
    }
    return relationships;
  }

  private extractParagraphs(documentXml: string): ParagraphNode[] {
    const paragraphs: ParagraphNode[] = [];
    const paragraphPattern = /<w:p\b[\s\S]*?<\/w:p>/g;
    let match: RegExpExecArray | null;
    while ((match = paragraphPattern.exec(documentXml))) {
      const xml = match[0];
      const text = this.extractText(xml);
      if (!text) continue;
      const style = xml.match(/<w:pStyle[^>]+w:val="([^"]+)"/)?.[1] ?? null;
      const headingMatch = style?.match(/Heading(\d+)/i);
      paragraphs.push({
        level: headingMatch ? Math.min(6, Math.max(1, Number(headingMatch[1]))) : null,
        text,
      });
    }
    return paragraphs;
  }

  private extractTables(documentXml: string): string[][][] {
    const tables: string[][][] = [];
    const tablePattern = /<w:tbl\b[\s\S]*?<\/w:tbl>/g;
    let tableMatch: RegExpExecArray | null;
    while ((tableMatch = tablePattern.exec(documentXml))) {
      const rows: string[][] = [];
      const rowPattern = /<w:tr\b[\s\S]*?<\/w:tr>/g;
      let rowMatch: RegExpExecArray | null;
      while ((rowMatch = rowPattern.exec(tableMatch[0]))) {
        const cells: string[] = [];
        const cellPattern = /<w:tc\b[\s\S]*?<\/w:tc>/g;
        let cellMatch: RegExpExecArray | null;
        while ((cellMatch = cellPattern.exec(rowMatch[0]))) {
          cells.push(this.extractText(cellMatch[0]));
        }
        if (cells.some(Boolean)) rows.push(cells);
      }
      if (rows.length) tables.push(rows);
    }
    return tables;
  }

  private extractLinks(documentXml: string, rels: Map<string, { target: string; type: string }>): ExtractedLink[] {
    const links: ExtractedLink[] = [];
    const hyperlinkPattern = /<w:hyperlink\b([^>]*)>([\s\S]*?)<\/w:hyperlink>/g;
    let match: RegExpExecArray | null;
    while ((match = hyperlinkPattern.exec(documentXml))) {
      const id = this.attr(match[1], 'r:id');
      const rel = id ? rels.get(id) : null;
      const text = this.extractText(match[2]);
      if (rel?.target && text) links.push({ text, url: rel.target, sectionId: null });
    }
    return links;
  }

  private async extractImages(zip: AdmZip, outputDir: string, jobId: string): Promise<ExtractedImage[]> {
    const images: ExtractedImage[] = [];
    const entries = zip.getEntries().filter((entry) => entry.entryName.startsWith('word/media/') && !entry.isDirectory);
    for (const [index, entry] of entries.entries()) {
      const originalName = basename(entry.entryName);
      const extension = extname(originalName).toLowerCase() || '.bin';
      const fileName = `${jobId}-${index + 1}${extension}`;
      const extractedPath = join(outputDir, fileName);
      await writeFile(extractedPath, entry.getData(), { flag: 'w' });
      images.push({
        assetId: `image-${index + 1}`,
        fileName,
        altText: '',
        caption: '',
        sectionId: null,
        extractedPath,
      });
    }
    return images;
  }

  private buildHeadings(paragraphs: ParagraphNode[], links: ExtractedLink[]): ExtractedHeading[] {
    const headings: ExtractedHeading[] = [];
    let current: ExtractedHeading | null = null;
    let fallbackIndex = 1;

    for (const paragraph of paragraphs) {
      if (paragraph.level) {
        current = {
          id: `section-${headings.length + 1}`,
          level: paragraph.level,
          text: paragraph.text,
          content: [],
          tables: [],
          images: [],
          links: [],
        };
        headings.push(current);
      } else if (current) {
        current.content.push(paragraph.text);
      } else {
        current = {
          id: `section-${fallbackIndex++}`,
          level: 1,
          text: 'Document Content',
          content: [paragraph.text],
          tables: [],
          images: [],
          links: [],
        };
        headings.push(current);
      }
    }

    if (headings.length) headings[0].links = links;
    return headings;
  }

  private extractText(xml: string) {
    const parts: string[] = [];
    const textPattern = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
    let match: RegExpExecArray | null;
    while ((match = textPattern.exec(xml))) parts.push(this.decode(match[1]));
    return parts.join('').replace(/\s+/g, ' ').trim();
  }

  private attr(xml: string, name: string) {
    return xml.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? null;
  }

  private decode(value: string) {
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  private countWords(text: string) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }
}
