import { Injectable } from '@nestjs/common';
import { Prisma, TemplateStatus, TemplateType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const GOVERNMENT_MODERN_SUPPORTED_MODULES = [
  'NAVIGATION_MENU',
  'PAGE_CONTENT',
  'BLOG_LIST',
  'DOCUMENT_LIST',
  'FAQ_LIST',
  'FORM_EMBED',
  'SEARCH',
  'CHATBOT',
  'FOOTER_LINKS',
  'MEDIA_GALLERY',
  'ANNOUNCEMENT_LIST',
  'TENDER_LIST',
  'SCHEME_LIST',
  'SERVICE_LIST',
  'GRIEVANCE_SUBMIT',
  'GRIEVANCE_TRACK',
  'RTI_DISCLOSURE',
  'DEPARTMENT_LIST',
  'CONTACT_DIRECTORY',
  'ORGANIZATION_CHART',
  'NEWSROOM_LIST',
  'PRESS_RELEASE_LIST',
  'ACCESSIBILITY_CONTROLS',
  'LANGUAGE_SWITCHER',
  'STATISTICS_COUNTERS',
  'QUICK_LINKS',
  'SOCIAL_LINKS',
  'NEWSLETTER_SUBSCRIBE',
  'CUSTOM_HTML',
];

const GOVERNMENT_MODERN_SECTIONS = [
  'topbar',
  'header',
  'navigation',
  'hero',
  'quick_access',
  'latest_updates',
  'services',
  'tenders',
  'newsroom',
  'departments',
  'documents',
  'statistics',
  'gallery',
  'footer',
  'chatbot',
];

const GOVERNMENT_MODERN_CONFIG = {
  entry: 'builder',
  type: 'GOVERNMENT',
  templateCompatibilityVersion: '1.0.0',
  supportedRegions: GOVERNMENT_MODERN_SECTIONS,
  supportedModules: GOVERNMENT_MODERN_SUPPORTED_MODULES,
  defaultLayout: {
    regions: GOVERNMENT_MODERN_SECTIONS,
    sectionModel: 'TemplateRegion',
    moduleModel: 'TemplateRegionModule',
  },
  themePresets: [
    { name: 'Official Blue', primaryColor: '#123c69', secondaryColor: '#0b2447', accentColor: '#f5b301' },
    { name: 'Civic Green', primaryColor: '#14532d', secondaryColor: '#064e3b', accentColor: '#facc15' },
    { name: 'High Contrast', primaryColor: '#111827', secondaryColor: '#000000', accentColor: '#f59e0b' },
  ],
  themeSettings: {
    primaryColor: '#123c69',
    secondaryColor: '#0b2447',
    accentColor: '#f5b301',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#111827',
    mutedColor: '#64748b',
    borderColor: '#dbe3ef',
    fontFamily: 'Inter',
    logoMediaId: '',
    emblemMediaId: '',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'multi-column',
    cardStyle: 'bordered',
    layoutWidth: '1200',
    borderRadius: '8',
    showAccessibilityBar: true,
    showLanguageSwitcher: false,
    showSearch: true,
    showChatbot: true,
    highContrastEnabled: false,
  },
  theme: {
    primaryColor: '#123c69',
    secondaryColor: '#0b2447',
    accentColor: '#f5b301',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontFamily: 'Inter',
    baseFontSize: '16',
    borderRadius: '8',
    contentWidth: '1200',
    sectionSpacing: '48',
  },
  previewPageTypes: [
    'homepage',
    'page_detail',
    'blog_listing',
    'blog_detail',
    'document_listing',
    'faq_listing',
    'form_page',
    'search_page',
    'tender_listing',
    'tender_detail',
    'scheme_listing',
    'scheme_detail',
    'service_listing',
    'service_detail',
    'announcement_listing',
    'announcement_detail',
    'newsroom_listing',
    'newsroom_detail',
    'department_contact_directory',
    'grievance_submit',
    'grievance_track',
    'rti_disclosure',
  ],
};

const GOVERNMENT_MODERN_TEMPLATE = {
  name: 'Government Modern',
  slug: 'government-modern',
  description: 'A configurable government portal template built for the Public Template Builder with official sections, module placement, theme settings, preview, and activation support.',
  version: '1.0.0',
  templateType: TemplateType.GOVERNMENT,
  thumbnailUrl: '/templates/previews/government-modern.png',
  configJson: GOVERNMENT_MODERN_CONFIG,
  previewHtml: `<div style="font-family:Inter,system-ui,sans-serif;background:#f8fafc;color:#111827">
    <div style="background:#0b2447;color:#fff;padding:8px 32px;font-size:12px;display:flex;justify-content:space-between"><span>Official Government Portal</span><span>Search | Accessibility | Language</span></div>
    <header style="background:#123c69;color:#fff;padding:18px 32px;display:flex;align-items:center;gap:16px">
      <div style="width:54px;height:54px;background:#fff;border-radius:6px"></div>
      <div><h1 style="margin:0;font-size:22px">Government Modern</h1><p style="margin:2px 0 0;font-size:13px;opacity:.85">Configurable public service portal</p></div>
    </header>
    <nav style="background:#0b2447;color:#fff;padding:10px 32px;display:flex;gap:24px;font-size:14px"><span>Home</span><span>Services</span><span>Departments</span><span>Documents</span><span>Contact</span></nav>
    <main style="max-width:1200px;margin:0 auto;padding:32px">
      <section style="background:#fff;border:1px solid #dbe3ef;border-radius:8px;padding:40px;margin-bottom:24px"><h2 style="margin:0 0 10px;color:#123c69;font-size:30px">Citizen services, updates, and public information</h2><p style="margin:0;color:#475569">Designed to be edited, previewed, published, and activated from the Public Template Builder.</p></section>
      <section style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px"><div style="background:#fff;border:1px solid #dbe3ef;border-radius:8px;padding:20px"><strong>Quick Access</strong><p style="color:#64748b">Important links and services.</p></div><div style="background:#fff;border:1px solid #dbe3ef;border-radius:8px;padding:20px"><strong>Latest Updates</strong><p style="color:#64748b">News, announcements, and notices.</p></div><div style="background:#fff;border:1px solid #dbe3ef;border-radius:8px;padding:20px"><strong>Documents</strong><p style="color:#64748b">Published public documents.</p></div></section>
    </main>
    <footer style="background:#0b2447;color:#fff;padding:24px 32px;text-align:center;font-size:12px">Government Modern footer links and public policies</footer>
  </div>`,
};

const DUMMY_TEMPLATES = [
  GOVERNMENT_MODERN_TEMPLATE,
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
        if (tpl.slug === 'government-modern') {
          await this.prisma.websiteTemplate.update({
            where: { id: existing.id },
            data: {
              name: tpl.name,
              description: tpl.description,
              version: tpl.version,
              templateType: tpl.templateType,
              thumbnailUrl: tpl.thumbnailUrl,
              configJson: { previewHtml: tpl.previewHtml, ...((tpl as any).configJson ?? {}) } as unknown as Prisma.InputJsonValue,
            },
          });
          await this.ensureGovernmentModernRegions(existing.id);
        }
        // Ensure regions exist for previously seeded templates
        const regionCount = await this.prisma.templateRegion.count({
          where: { templateId: existing.id },
        });
        if (regionCount === 0) {
          if (tpl.slug === 'government-modern') {
            await this.ensureGovernmentModernRegions(existing.id);
          } else {
            await this.createDefaultRegions(existing.id);
          }
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
          configJson: { previewHtml: tpl.previewHtml, ...((tpl as any).configJson ?? {}) } as unknown as Prisma.InputJsonValue,
          storageProvider: 'local',
        },
      });

      // Create default regions with modules for each template
      if (tpl.slug === 'government-modern') {
        await this.ensureGovernmentModernRegions(template.id);
      } else {
        await this.createDefaultRegions(template.id);
      }

      created.push(template);
    }

    return { message: `Seeded ${created.length} templates.`, templates: created };
  }

  private async ensureGovernmentModernRegions(templateId: string) {
    const sections = [
      {
        regionKey: 'topbar',
        regionName: 'Topbar',
        description: 'Utility strip for search, accessibility, language, and official links.',
        regionType: 'TOPBAR',
        sortOrder: 0,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'SEARCH', moduleKey: 'topbar-search', displayTitle: 'Portal Search', sortOrder: 0, configJson: { showTitle: false, placeholder: 'Search the portal' } },
        ],
      },
      {
        regionKey: 'header',
        regionName: 'Header',
        description: 'Official logo, emblem, department name, and header actions.',
        regionType: 'HEADER',
        sortOrder: 1,
        isRequired: true,
        isActive: true,
        modules: [
          { moduleType: 'SITE_HEADER', moduleKey: 'government-modern-header', displayTitle: 'Official Header', sortOrder: 0, configJson: { showSearch: true, headerStyle: 'official' } },
        ],
      },
      {
        regionKey: 'navigation',
        regionName: 'Navigation',
        description: 'Primary public navigation menu.',
        regionType: 'NAVIGATION',
        sortOrder: 2,
        isRequired: true,
        isActive: true,
        modules: [
          { moduleType: 'NAVIGATION_MENU', moduleKey: 'government-modern-navigation', displayTitle: 'Main Navigation', sortOrder: 0, configJson: { location: 'primary', sticky: true, displayMode: 'horizontal' } },
        ],
      },
      {
        regionKey: 'hero',
        regionName: 'Hero',
        description: 'Homepage hero and key public calls to action.',
        regionType: 'HERO',
        sortOrder: 3,
        isRequired: false,
        isActive: true,
        modules: [
          {
            moduleType: 'CUSTOM_HTML',
            moduleKey: 'government-modern-hero',
            displayTitle: 'Hero',
            sortOrder: 0,
            configJson: {
              title: 'Citizen services, updates, and public information',
              subtitle: 'A configurable public portal powered by the CMS template builder.',
              primaryCTA: { label: 'Explore Services', url: '/services' },
              secondaryCTA: { label: 'View Documents', url: '/documents' },
              html: '<section class="public-hero"><h1>Citizen services, updates, and public information</h1><p>A configurable public portal powered by the CMS template builder.</p></section>',
            },
          },
        ],
      },
      {
        regionKey: 'quick_access',
        regionName: 'Quick Access',
        description: 'High-priority links for citizens.',
        regionType: 'CONTENT',
        sortOrder: 4,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'QUICK_LINKS', moduleKey: 'government-modern-quick-links', displayTitle: 'Quick Access', sortOrder: 0, configJson: { displayMode: 'grid', limit: 8, showTitle: true } },
        ],
      },
      {
        regionKey: 'latest_updates',
        regionName: 'Latest Updates',
        description: 'Latest public posts and updates.',
        regionType: 'CONTENT',
        sortOrder: 5,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'BLOG_LIST', moduleKey: 'government-modern-latest-updates', displayTitle: 'Latest Updates', sortOrder: 0, configJson: { limit: 4, displayMode: 'cards', showDate: true, showImage: true } },
        ],
      },
      {
        regionKey: 'services',
        regionName: 'Services',
        description: 'Configurable service or scheme module placement.',
        regionType: 'CONTENT',
        sortOrder: 6,
        isRequired: false,
        isActive: false,
        modules: [],
      },
      {
        regionKey: 'tenders',
        regionName: 'Tenders',
        description: 'Tender and procurement module placement.',
        regionType: 'CONTENT',
        sortOrder: 7,
        isRequired: false,
        isActive: false,
        modules: [],
      },
      {
        regionKey: 'newsroom',
        regionName: 'Newsroom',
        description: 'Newsroom, press releases, and featured updates.',
        regionType: 'CONTENT',
        sortOrder: 8,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'NEWSROOM_LIST', moduleKey: 'government-modern-newsroom', displayTitle: 'Newsroom', sortOrder: 0, configJson: { itemType: 'all', limit: 4, showFeaturedOnly: false, showGallery: true } },
        ],
      },
      {
        regionKey: 'departments',
        regionName: 'Departments',
        description: 'Department list, contact directory, and organization chart placement.',
        regionType: 'CONTENT',
        sortOrder: 9,
        isRequired: false,
        isActive: false,
        modules: [],
      },
      {
        regionKey: 'documents',
        regionName: 'Documents',
        description: 'Published documents and public downloads.',
        regionType: 'CONTENT',
        sortOrder: 10,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'DOCUMENT_LIST', moduleKey: 'government-modern-documents', displayTitle: 'Documents', sortOrder: 0, configJson: { limit: 6, showFilters: true, displayMode: 'list' } },
        ],
      },
      {
        regionKey: 'statistics',
        regionName: 'Statistics',
        description: 'Manual or automatic counters for public services.',
        regionType: 'CONTENT',
        sortOrder: 11,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'STATISTICS_COUNTERS', moduleKey: 'government-modern-statistics', displayTitle: 'Key Statistics', sortOrder: 0, configJson: { statSource: 'manual', manualCounters: [] } },
        ],
      },
      {
        regionKey: 'gallery',
        regionName: 'Gallery',
        description: 'Published media gallery placement.',
        regionType: 'CONTENT',
        sortOrder: 12,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'MEDIA_GALLERY', moduleKey: 'government-modern-gallery', displayTitle: 'Gallery', sortOrder: 0, configJson: { limit: 8, displayMode: 'grid', showImage: true } },
        ],
      },
      {
        regionKey: 'footer',
        regionName: 'Footer',
        description: 'Footer links, policies, contact information, and social links.',
        regionType: 'FOOTER',
        sortOrder: 13,
        isRequired: true,
        isActive: true,
        modules: [
          { moduleType: 'FOOTER_LINKS', moduleKey: 'government-modern-footer', displayTitle: 'Footer Links', sortOrder: 0, configJson: { displayMode: 'columns' } },
        ],
      },
      {
        regionKey: 'chatbot',
        regionName: 'Chatbot',
        description: 'Public chatbot placement.',
        regionType: 'CHATBOT',
        sortOrder: 14,
        isRequired: false,
        isActive: true,
        modules: [
          { moduleType: 'CHATBOT', moduleKey: 'government-modern-chatbot', displayTitle: 'Chatbot', sortOrder: 0, configJson: { showTitle: false } },
        ],
      },
    ];

    for (const section of sections) {
      const region = await this.prisma.templateRegion.upsert({
        where: { templateId_regionKey: { templateId, regionKey: section.regionKey } },
        update: {
          regionName: section.regionName,
          description: section.description,
          regionType: section.regionType,
          sortOrder: section.sortOrder,
          isRequired: section.isRequired,
        },
        create: {
          templateId,
          regionKey: section.regionKey,
          regionName: section.regionName,
          description: section.description,
          regionType: section.regionType,
          sortOrder: section.sortOrder,
          isRequired: section.isRequired,
          isActive: section.isActive,
        },
      });

      for (const moduleDef of section.modules) {
        const existingModule = await this.prisma.templateRegionModule.findFirst({
          where: { templateId, regionId: region.id, moduleKey: moduleDef.moduleKey },
        });
        if (existingModule) continue;

        await this.prisma.templateRegionModule.create({
          data: {
            templateId,
            regionId: region.id,
            moduleType: moduleDef.moduleType,
            moduleKey: moduleDef.moduleKey,
            displayTitle: moduleDef.displayTitle,
            configJson: moduleDef.configJson as unknown as Prisma.InputJsonValue,
            sortOrder: moduleDef.sortOrder,
            isVisible: true,
          },
        });
      }
    }
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
