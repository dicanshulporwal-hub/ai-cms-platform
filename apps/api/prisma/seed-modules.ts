import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SYSTEM_MODULES = [
  { moduleKey: 'PAGE_CONTENT', moduleName: 'Page Content', moduleType: 'PAGE_CONTENT', category: 'Content', description: 'Renders current page content dynamically.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'BLOG_LIST', moduleName: 'Blog List', moduleType: 'BLOG_LIST', category: 'Content', description: 'Displays recent published blog posts.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'DOCUMENT_LIST', moduleName: 'Document List', moduleType: 'DOCUMENT_LIST', category: 'Content', description: 'Lists published documents.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'MEDIA_GALLERY', moduleName: 'Media Gallery', moduleType: 'MEDIA_GALLERY', category: 'Content', description: 'Displays media images in grid or carousel.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'CHATBOT', moduleName: 'Chatbot Widget', moduleType: 'CHATBOT', category: 'Engagement', description: 'Floating chatbot widget for visitor interaction.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'SEARCH', moduleName: 'Search Box', moduleType: 'SEARCH', category: 'Utility', description: 'Site-wide search functionality.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'NAVIGATION_MENU', moduleName: 'Navigation Menu', moduleType: 'NAVIGATION_MENU', category: 'Utility', description: 'Main site navigation with logo.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'FOOTER_LINKS', moduleName: 'Footer Links', moduleType: 'FOOTER_LINKS', category: 'Utility', description: 'Footer with policy links, contact, sitemap.', isPublicEnabled: true, isSystemModule: true, isActive: true },
  { moduleKey: 'CUSTOM_HTML', moduleName: 'Custom HTML', moduleType: 'CUSTOM_HTML', category: 'Custom', description: 'Render custom sanitized HTML content.', isPublicEnabled: true, isSystemModule: false, isActive: true },
];

const FUTURE_MODULES = [
  { moduleKey: 'FAQ_LIST', moduleName: 'FAQ List', moduleType: 'FAQ_LIST', category: 'Content', description: 'Frequently asked questions list.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'ANNOUNCEMENT_LIST', moduleName: 'Announcements', moduleType: 'ANNOUNCEMENT_LIST', category: 'Content', description: 'Public announcements and notices.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'TENDER_LIST', moduleName: 'Tender List', moduleType: 'TENDER_LIST', category: 'Governance', description: 'Active tenders and procurement notices.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'SCHEME_LIST', moduleName: 'Scheme List', moduleType: 'SCHEME_LIST', category: 'Governance', description: 'Government schemes and programs.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'EVENT_LIST', moduleName: 'Event List', moduleType: 'EVENT_LIST', category: 'Content', description: 'Upcoming events and calendar.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'FORM_EMBED', moduleName: 'Form Embed', moduleType: 'FORM_EMBED', category: 'Engagement', description: 'Embedded form builder forms.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'GRIEVANCE_FORM', moduleName: 'Grievance Form', moduleType: 'GRIEVANCE_FORM', category: 'Governance', description: 'Public grievance submission form.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'CONTACT_DIRECTORY', moduleName: 'Contact Directory', moduleType: 'CONTACT_DIRECTORY', category: 'Utility', description: 'Department contact directory.', isPublicEnabled: false, isSystemModule: false, isActive: false },
  { moduleKey: 'RTI_DISCLOSURE_LIST', moduleName: 'RTI Disclosures', moduleType: 'RTI_DISCLOSURE_LIST', category: 'Governance', description: 'Right to Information disclosures.', isPublicEnabled: false, isSystemModule: false, isActive: false },
];

function loadEnvFile() {
  const candidates = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')];
  const envPath = candidates.find((c) => existsSync(c));
  if (!envPath) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) process.env[key] = rawValue.replace(/^"|"$/g, '');
  }
}

async function main() {
  loadEnvFile();
  const prisma = new PrismaClient();
  try {
    for (const mod of [...SYSTEM_MODULES, ...FUTURE_MODULES]) {
      await prisma.templateModuleRegistry.upsert({
        where: { moduleKey: mod.moduleKey },
        update: { moduleName: mod.moduleName, description: mod.description, category: mod.category, isSystemModule: mod.isSystemModule },
        create: mod,
      });
    }
    console.log(`Seeded ${SYSTEM_MODULES.length + FUTURE_MODULES.length} module registry entries.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
