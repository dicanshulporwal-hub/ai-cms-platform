import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MODULES = [
  // Core
  { moduleKey: 'dashboard', moduleName: 'Dashboard', category: 'CORE', routePath: '/dashboard', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'auth', moduleName: 'Authentication', category: 'CORE', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'users', moduleName: 'Users', category: 'CORE', routePath: '/users', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'roles', moduleName: 'Roles', category: 'CORE', routePath: '/roles', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'settings', moduleName: 'Settings', category: 'CORE', routePath: '/settings', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  // Content
  { moduleKey: 'pages', moduleName: 'Pages', category: 'CONTENT', routePath: '/pages', publicRoutePath: '/pages', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true },
  { moduleKey: 'blogs', moduleName: 'Blogs', category: 'CONTENT', routePath: '/blogs', publicRoutePath: '/blog', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true },
  { moduleKey: 'categories', moduleName: 'Categories', category: 'CONTENT', routePath: '/categories', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'tags', moduleName: 'Tags', category: 'CONTENT', routePath: '/tags', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'documents', moduleName: 'Documents', category: 'CONTENT', routePath: '/documents', publicRoutePath: '/documents', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true },
  // Media
  { moduleKey: 'media', moduleName: 'Media', category: 'MEDIA', routePath: '/media', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: true },
  // AI
  { moduleKey: 'ai_assistant', moduleName: 'AI Assistant', category: 'AI', routePath: '/ai/usage', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, dependsOnJson: ['ai_providers'] },
  { moduleKey: 'ai_seo', moduleName: 'AI SEO', category: 'AI', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, dependsOnJson: ['ai_providers'] },
  { moduleKey: 'ai_chatbot', moduleName: 'AI Chatbot', category: 'AI', routePath: '/chatbot', publicRoutePath: '/', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true, dependsOnJson: ['ai_providers'] },
  { moduleKey: 'ai_providers', moduleName: 'AI Providers', category: 'AI', routePath: '/ai/providers', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  // Governance
  { moduleKey: 'workflow', moduleName: 'Workflow', category: 'GOVERNANCE', routePath: '/workflow', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'notifications', moduleName: 'Notifications', category: 'GOVERNANCE', routePath: '/notifications', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'audit_logs', moduleName: 'Audit Logs', category: 'GOVERNANCE', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false },
  // Template/Public
  { moduleKey: 'template_manager', moduleName: 'Template Manager', category: 'UTILITY', routePath: '/templates', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false },
  { moduleKey: 'public_website', moduleName: 'Public Website', category: 'UTILITY', publicRoutePath: '/', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: true, isTemplateAvailable: false },
  { moduleKey: 'search', moduleName: 'Search', category: 'UTILITY', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: true, isTemplateAvailable: true },
  // Future
  { moduleKey: 'faq', moduleName: 'FAQ', category: 'CONTENT', publicRoutePath: '/faq', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Frequently Asked Questions module.' },
  { moduleKey: 'tender', moduleName: 'Tenders', category: 'GOVERNANCE', publicRoutePath: '/tenders', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Tender and procurement notices.' },
  { moduleKey: 'scheme', moduleName: 'Schemes', category: 'GOVERNANCE', publicRoutePath: '/schemes', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Government schemes and programs.' },
  { moduleKey: 'events', moduleName: 'Events', category: 'CONTENT', publicRoutePath: '/events', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Events and calendar.' },
  { moduleKey: 'announcements', moduleName: 'Announcements', category: 'CONTENT', publicRoutePath: '/announcements', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Public announcements.' },
  { moduleKey: 'grievance', moduleName: 'Grievance', category: 'PUBLIC_ENGAGEMENT', publicRoutePath: '/grievance', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Public grievance submission.' },
  { moduleKey: 'forms', moduleName: 'Form Builder', category: 'PUBLIC_ENGAGEMENT', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Dynamic form builder.' },
  { moduleKey: 'rti', moduleName: 'RTI Disclosures', category: 'GOVERNANCE', publicRoutePath: '/rti', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Right to Information disclosures.' },
  { moduleKey: 'contact_directory', moduleName: 'Contact Directory', category: 'UTILITY', publicRoutePath: '/contacts', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Department contact directory.' },
  { moduleKey: 'newsletter', moduleName: 'Newsletter', category: 'PUBLIC_ENGAGEMENT', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Newsletter signup and management.' },
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
    for (const mod of MODULES) {
      await prisma.cmsModule.upsert({
        where: { moduleKey: mod.moduleKey },
        update: { moduleName: mod.moduleName, category: mod.category, description: mod.description ?? null },
        create: mod as any,
      });
    }
    console.log(`Seeded ${MODULES.length} CMS modules.`);
  } finally { await prisma.$disconnect(); }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
