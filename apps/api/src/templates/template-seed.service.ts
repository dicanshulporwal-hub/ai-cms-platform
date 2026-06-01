import { Injectable } from '@nestjs/common';
import { Prisma, TemplateStatus, TemplateType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DUMMY_TEMPLATES = [
  {
    name: 'Government Portal',
    slug: 'government-portal',
    description: 'A GIGW-compliant government website template with official branding, accessibility features, and structured navigation for departments and services.',
    version: '1.0.0',
    templateType: TemplateType.GOVERNMENT,
    thumbnailUrl: '/templates/previews/government-portal.png',
    previewHtml: `<div style="font-family:system-ui,sans-serif">
      <header style="background:#1a365d;color:#fff;padding:16px 32px;display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center">🏛️</div>
        <div><h1 style="margin:0;font-size:20px">Government Department Portal</h1><p style="margin:0;font-size:12px;opacity:0.8">Ministry of Digital Services</p></div>
      </header>
      <nav style="background:#2d4a7a;padding:8px 32px;display:flex;gap:24px"><a style="color:#fff;text-decoration:none;font-size:14px">Home</a><a style="color:#fff;text-decoration:none;font-size:14px">Services</a><a style="color:#fff;text-decoration:none;font-size:14px">Documents</a><a style="color:#fff;text-decoration:none;font-size:14px">Contact</a></nav>
      <main style="padding:32px;max-width:1200px;margin:0 auto">
        <section style="background:linear-gradient(135deg,#ebf4ff,#dbeafe);padding:48px;border-radius:12px;margin-bottom:32px"><h2 style="margin:0 0 12px;color:#1a365d">Welcome to the Official Portal</h2><p style="color:#4a5568;margin:0">Access government services, documents, and information.</p></section>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div style="border:1px solid #e2e8f0;padding:24px;border-radius:8px"><h3 style="color:#1a365d;margin:0 0 8px">📋 Services</h3><p style="color:#718096;font-size:14px;margin:0">Apply for certificates, licenses, and permits online.</p></div><div style="border:1px solid #e2e8f0;padding:24px;border-radius:8px"><h3 style="color:#1a365d;margin:0 0 8px">📄 Documents</h3><p style="color:#718096;font-size:14px;margin:0">Download official forms, circulars, and notifications.</p></div><div style="border:1px solid #e2e8f0;padding:24px;border-radius:8px"><h3 style="color:#1a365d;margin:0 0 8px">📞 Contact</h3><p style="color:#718096;font-size:14px;margin:0">Reach out to departments and officials.</p></div></div>
      </main>
      <footer style="background:#1a365d;color:#fff;padding:24px 32px;text-align:center;font-size:12px">© 2025 Government Department. All rights reserved.</footer>
    </div>`,
  },
  {
    name: 'Corporate Business',
    slug: 'corporate-business',
    description: 'A modern corporate website template with clean design, service showcases, team sections, and professional branding suitable for businesses.',
    version: '1.0.0',
    templateType: TemplateType.CORPORATE,
    thumbnailUrl: '/templates/previews/corporate-business.png',
    previewHtml: `<div style="font-family:system-ui,sans-serif">
      <header style="background:#fff;padding:16px 32px;display:flex;align-items:center;justify-content:between;border-bottom:1px solid #e5e7eb">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827">Acme<span style="color:#3b82f6">Corp</span></h1>
        <nav style="margin-left:auto;display:flex;gap:24px"><a style="color:#6b7280;text-decoration:none;font-size:14px">About</a><a style="color:#6b7280;text-decoration:none;font-size:14px">Services</a><a style="color:#6b7280;text-decoration:none;font-size:14px">Team</a><a style="color:#6b7280;text-decoration:none;font-size:14px">Contact</a></nav>
      </header>
      <main style="padding:0">
        <section style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:80px 32px;text-align:center;color:#fff"><h2 style="margin:0 0 16px;font-size:36px">Innovate. Transform. Grow.</h2><p style="margin:0 0 24px;opacity:0.9;font-size:18px">We help businesses achieve their digital transformation goals.</p><button style="background:#fff;color:#1e40af;border:none;padding:12px 32px;border-radius:6px;font-weight:600;cursor:pointer">Get Started</button></section>
        <section style="padding:48px 32px;max-width:1200px;margin:0 auto"><h3 style="text-align:center;margin:0 0 32px;color:#111827">Our Services</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div style="padding:24px;border-radius:8px;background:#f9fafb;text-align:center"><div style="font-size:32px;margin-bottom:12px">🚀</div><h4 style="margin:0 0 8px;color:#111827">Strategy</h4><p style="color:#6b7280;font-size:14px;margin:0">Data-driven business strategies.</p></div><div style="padding:24px;border-radius:8px;background:#f9fafb;text-align:center"><div style="font-size:32px;margin-bottom:12px">💡</div><h4 style="margin:0 0 8px;color:#111827">Innovation</h4><p style="color:#6b7280;font-size:14px;margin:0">Cutting-edge technology solutions.</p></div><div style="padding:24px;border-radius:8px;background:#f9fafb;text-align:center"><div style="font-size:32px;margin-bottom:12px">📈</div><h4 style="margin:0 0 8px;color:#111827">Growth</h4><p style="color:#6b7280;font-size:14px;margin:0">Scalable growth frameworks.</p></div></div></section>
      </main>
      <footer style="background:#111827;color:#9ca3af;padding:24px 32px;text-align:center;font-size:12px">© 2025 AcmeCorp. All rights reserved.</footer>
    </div>`,
  },
  {
    name: 'Blog & Magazine',
    slug: 'blog-magazine',
    description: 'A content-focused blog and magazine template with featured articles, category navigation, and reading-optimized typography.',
    version: '1.0.0',
    templateType: TemplateType.BLOG,
    thumbnailUrl: '/templates/previews/blog-magazine.png',
    previewHtml: `<div style="font-family:Georgia,serif">
      <header style="padding:24px 32px;border-bottom:2px solid #111;display:flex;align-items:center;justify-content:between">
        <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:-1px">The Daily Digest</h1>
        <nav style="margin-left:auto;display:flex;gap:20px"><a style="color:#111;text-decoration:none;font-size:14px;font-family:system-ui">Technology</a><a style="color:#111;text-decoration:none;font-size:14px;font-family:system-ui">Culture</a><a style="color:#111;text-decoration:none;font-size:14px;font-family:system-ui">Science</a><a style="color:#111;text-decoration:none;font-size:14px;font-family:system-ui">Opinion</a></nav>
      </header>
      <main style="padding:32px;max-width:1000px;margin:0 auto">
        <article style="margin-bottom:32px;padding-bottom:32px;border-bottom:1px solid #e5e7eb"><span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#dc2626;font-family:system-ui;font-weight:600">Featured</span><h2 style="margin:8px 0;font-size:28px;line-height:1.3">The Future of AI in Content Creation</h2><p style="color:#4b5563;line-height:1.7;margin:0 0 12px">Exploring how artificial intelligence is reshaping the way we create, curate, and consume digital content in the modern era...</p><span style="font-size:12px;color:#9ca3af;font-family:system-ui">May 28, 2025 · 8 min read</span></article>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px"><article style="border:1px solid #e5e7eb;padding:20px;border-radius:8px"><span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#2563eb;font-family:system-ui;font-weight:600">Technology</span><h3 style="margin:8px 0;font-size:18px">Web Development Trends 2025</h3><p style="color:#6b7280;font-size:14px;line-height:1.5;margin:0">The latest frameworks and tools shaping the web...</p></article><article style="border:1px solid #e5e7eb;padding:20px;border-radius:8px"><span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#059669;font-family:system-ui;font-weight:600">Science</span><h3 style="margin:8px 0;font-size:18px">Quantum Computing Breakthroughs</h3><p style="color:#6b7280;font-size:14px;line-height:1.5;margin:0">New discoveries pushing the boundaries of computation...</p></article></div>
      </main>
      <footer style="border-top:2px solid #111;padding:24px 32px;text-align:center;font-size:12px;color:#6b7280;font-family:system-ui">© 2025 The Daily Digest. All rights reserved.</footer>
    </div>`,
  },
  {
    name: 'Landing Page Pro',
    slug: 'landing-page-pro',
    description: 'A high-conversion landing page template with hero sections, testimonials, pricing tables, and call-to-action blocks.',
    version: '1.0.0',
    templateType: TemplateType.LANDING_PAGE,
    thumbnailUrl: '/templates/previews/landing-page-pro.png',
    previewHtml: `<div style="font-family:system-ui,sans-serif">
      <header style="padding:16px 32px;display:flex;align-items:center;background:#fff">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#7c3aed">LaunchPad</h1>
        <nav style="margin-left:auto;display:flex;gap:20px;align-items:center"><a style="color:#6b7280;text-decoration:none;font-size:14px">Features</a><a style="color:#6b7280;text-decoration:none;font-size:14px">Pricing</a><a style="color:#6b7280;text-decoration:none;font-size:14px">Testimonials</a><button style="background:#7c3aed;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:14px;cursor:pointer">Sign Up</button></nav>
      </header>
      <main>
        <section style="padding:80px 32px;text-align:center;background:linear-gradient(180deg,#f5f3ff,#fff)"><h2 style="margin:0 0 16px;font-size:42px;font-weight:800;color:#111827">Build Something<br><span style="color:#7c3aed">Amazing</span></h2><p style="margin:0 0 32px;color:#6b7280;font-size:18px;max-width:600px;margin-left:auto;margin-right:auto">The all-in-one platform to launch your next big idea. Fast, beautiful, and conversion-optimized.</p><div style="display:flex;gap:12px;justify-content:center"><button style="background:#7c3aed;color:#fff;border:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;cursor:pointer">Start Free Trial</button><button style="background:#fff;color:#374151;border:1px solid #d1d5db;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;cursor:pointer">Watch Demo</button></div></section>
        <section style="padding:48px 32px;max-width:1000px;margin:0 auto"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center"><div style="padding:24px"><div style="font-size:36px;margin-bottom:12px">⚡</div><h4 style="margin:0 0 8px">Lightning Fast</h4><p style="color:#6b7280;font-size:14px;margin:0">Optimized for speed and performance.</p></div><div style="padding:24px"><div style="font-size:36px;margin-bottom:12px">🎨</div><h4 style="margin:0 0 8px">Beautiful Design</h4><p style="color:#6b7280;font-size:14px;margin:0">Pixel-perfect responsive layouts.</p></div><div style="padding:24px"><div style="font-size:36px;margin-bottom:12px">📊</div><h4 style="margin:0 0 8px">Analytics Built-in</h4><p style="color:#6b7280;font-size:14px;margin:0">Track conversions and engagement.</p></div></div></section>
      </main>
      <footer style="background:#111827;color:#9ca3af;padding:24px 32px;text-align:center;font-size:12px">© 2025 LaunchPad. All rights reserved.</footer>
    </div>`,
  },
  {
    name: 'Education Portal',
    slug: 'education-portal',
    description: 'An education-focused template for schools, universities, and e-learning platforms with course listings, announcements, and resource sections.',
    version: '1.0.0',
    templateType: TemplateType.CUSTOM,
    thumbnailUrl: '/templates/previews/education-portal.png',
    previewHtml: `<div style="font-family:system-ui,sans-serif">
      <header style="background:#065f46;color:#fff;padding:16px 32px;display:flex;align-items:center;gap:12px">
        <div style="font-size:28px">🎓</div>
        <div><h1 style="margin:0;font-size:20px">EduLearn Academy</h1><p style="margin:0;font-size:11px;opacity:0.8">Excellence in Education</p></div>
        <nav style="margin-left:auto;display:flex;gap:20px"><a style="color:#fff;text-decoration:none;font-size:14px">Courses</a><a style="color:#fff;text-decoration:none;font-size:14px">Faculty</a><a style="color:#fff;text-decoration:none;font-size:14px">Admissions</a><a style="color:#fff;text-decoration:none;font-size:14px">Library</a></nav>
      </header>
      <main style="padding:32px;max-width:1200px;margin:0 auto">
        <section style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:48px;border-radius:12px;margin-bottom:32px"><h2 style="margin:0 0 12px;color:#065f46;font-size:28px">Empowering Minds, Shaping Futures</h2><p style="color:#374151;margin:0 0 20px">Discover world-class courses and programs designed for the leaders of tomorrow.</p><button style="background:#065f46;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-weight:600;cursor:pointer">Explore Courses</button></section>
        <h3 style="margin:0 0 20px;color:#111827">Popular Courses</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden"><div style="background:#dbeafe;padding:32px;text-align:center;font-size:32px">💻</div><div style="padding:16px"><h4 style="margin:0 0 4px;font-size:15px">Computer Science</h4><p style="color:#6b7280;font-size:13px;margin:0">B.Tech · 4 Years</p></div></div><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden"><div style="background:#fef3c7;padding:32px;text-align:center;font-size:32px">📐</div><div style="padding:16px"><h4 style="margin:0 0 4px;font-size:15px">Mathematics</h4><p style="color:#6b7280;font-size:13px;margin:0">M.Sc · 2 Years</p></div></div><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden"><div style="background:#fce7f3;padding:32px;text-align:center;font-size:32px">🧬</div><div style="padding:16px"><h4 style="margin:0 0 4px;font-size:15px">Biotechnology</h4><p style="color:#6b7280;font-size:13px;margin:0">B.Sc · 3 Years</p></div></div></div>
      </main>
      <footer style="background:#065f46;color:#d1fae5;padding:24px 32px;text-align:center;font-size:12px">© 2025 EduLearn Academy. All rights reserved.</footer>
    </div>`,
  },
];

@Injectable()
export class TemplateSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDummyTemplates() {
    const created: any[] = [];

    for (const tpl of DUMMY_TEMPLATES) {
      // Skip if already exists
      const existing = await this.prisma.websiteTemplate.findUnique({
        where: { slug: tpl.slug },
      });
      if (existing && !existing.deletedAt) {
        // Ensure regions exist for previously seeded templates
        const regionCount = await this.prisma.templateRegion.count({
          where: { templateId: existing.id },
        });
        if (regionCount === 0) {
          await this.createDefaultRegions(existing.id);
        }
        created.push(existing);
        continue;
      }

      const template = await this.prisma.websiteTemplate.create({
        data: {
          name: tpl.name,
          slug: tpl.slug,
          description: tpl.description,
          version: tpl.version,
          templateType: tpl.templateType,
          status: TemplateStatus.DRAFT,
          isActive: false,
          thumbnailUrl: tpl.thumbnailUrl,
          configJson: { previewHtml: tpl.previewHtml } as unknown as Prisma.InputJsonValue,
          storageProvider: 'local',
        },
      });

      // Create default regions with modules for each template
      await this.createDefaultRegions(template.id);

      created.push(template);
    }

    return { message: `Seeded ${created.length} templates.`, templates: created };
  }

  private async createDefaultRegions(templateId: string) {
    const regions = [
      {
        regionKey: 'header',
        regionName: 'Header',
        regionType: 'HEADER',
        sortOrder: 0,
        isRequired: true,
        modules: [
          { moduleType: 'SITE_HEADER', moduleKey: 'site-header', displayTitle: 'Site Header', sortOrder: 0 },
        ],
      },
      {
        regionKey: 'navigation',
        regionName: 'Navigation',
        regionType: 'NAVIGATION',
        sortOrder: 1,
        isRequired: true,
        modules: [
          { moduleType: 'NAVIGATION', moduleKey: 'main-navigation', displayTitle: 'Main Navigation', sortOrder: 0 },
        ],
      },
      {
        regionKey: 'content',
        regionName: 'Main Content',
        regionType: 'CONTENT',
        sortOrder: 2,
        isRequired: true,
        modules: [
          { moduleType: 'PAGE_CONTENT', moduleKey: 'page-content', displayTitle: 'Page Content', sortOrder: 0 },
          { moduleType: 'BLOG_LIST', moduleKey: 'blog-list', displayTitle: 'Blog Listing', sortOrder: 1 },
          { moduleType: 'FAQ_LIST', moduleKey: 'faq-list', displayTitle: 'FAQs', sortOrder: 2 },
          { moduleType: 'DOCUMENT_LIST', moduleKey: 'document-list', displayTitle: 'Documents', sortOrder: 3 },
        ],
      },
      {
        regionKey: 'sidebar',
        regionName: 'Sidebar',
        regionType: 'SIDEBAR',
        sortOrder: 3,
        isRequired: false,
        modules: [
          { moduleType: 'SEARCH', moduleKey: 'search-widget', displayTitle: 'Search', sortOrder: 0 },
          { moduleType: 'FORM_EMBED', moduleKey: 'contact-form', displayTitle: 'Contact Form', sortOrder: 1 },
        ],
      },
      {
        regionKey: 'footer',
        regionName: 'Footer',
        regionType: 'FOOTER',
        sortOrder: 4,
        isRequired: true,
        modules: [
          { moduleType: 'FOOTER', moduleKey: 'site-footer', displayTitle: 'Site Footer', sortOrder: 0 },
        ],
      },
    ];

    for (const regionDef of regions) {
      const region = await this.prisma.templateRegion.create({
        data: {
          templateId,
          regionKey: regionDef.regionKey,
          regionName: regionDef.regionName,
          regionType: regionDef.regionType,
          sortOrder: regionDef.sortOrder,
          isRequired: regionDef.isRequired,
          isActive: true,
        },
      });

      for (const moduleDef of regionDef.modules) {
        await this.prisma.templateRegionModule.create({
          data: {
            templateId,
            regionId: region.id,
            moduleType: moduleDef.moduleType,
            moduleKey: moduleDef.moduleKey,
            displayTitle: moduleDef.displayTitle,
            configJson: {} as unknown as Prisma.InputJsonValue,
            sortOrder: moduleDef.sortOrder,
            isVisible: true,
          },
        });
      }
    }
  }

  async getTemplatePreviewHtml(id: string) {
    const template = await this.prisma.websiteTemplate.findUnique({ where: { id } });
    if (!template || template.deletedAt) return null;
    const config = template.configJson as Record<string, unknown> | null;
    return config?.previewHtml as string | null;
  }
}
