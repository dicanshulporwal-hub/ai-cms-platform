import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * All CMS modules — every feature that has been built or will be built.
 * Each entry maps to a sidebar item, backend API group, and/or public route.
 */
const MODULES = [
  // ═══════════════════════════════════════════════════════════════
  // CORE — Cannot be disabled
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'dashboard', moduleName: 'Dashboard', category: 'CORE', icon: 'LayoutDashboard', routePath: '/dashboard', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Admin dashboard with analytics and quick actions.' },
  { moduleKey: 'auth', moduleName: 'Authentication', category: 'CORE', icon: 'Lock', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'JWT authentication and login system.' },
  { moduleKey: 'users', moduleName: 'Users', category: 'CORE', icon: 'Users', routePath: '/users', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'User management with role assignment.' },
  { moduleKey: 'roles', moduleName: 'Roles & Permissions', category: 'CORE', icon: 'Shield', routePath: '/roles', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Role management with granular permissions.' },
  { moduleKey: 'settings', moduleName: 'Settings', category: 'CORE', icon: 'Settings', routePath: '/settings', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Site settings, SEO defaults, feature toggles.' },
  { moduleKey: 'modules', moduleName: 'Module Management', category: 'CORE', icon: 'Box', routePath: '/modules', isCoreModule: true, isSystemModule: true, isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Enable/disable CMS modules per project.' },

  // ═══════════════════════════════════════════════════════════════
  // CONTENT — Page/Blog/Document management
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'pages', moduleName: 'Pages', category: 'CONTENT', icon: 'FileText', routePath: '/pages', publicRoutePath: '/pages', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true, description: 'Website page management with workflow.' },
  { moduleKey: 'blogs', moduleName: 'Blogs', category: 'CONTENT', icon: 'Newspaper', routePath: '/blogs', publicRoutePath: '/blog', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true, description: 'Blog post management with categories and tags.' },
  { moduleKey: 'categories', moduleName: 'Categories', category: 'CONTENT', icon: 'FolderTree', routePath: '/categories', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Content categorization for blogs and pages.' },
  { moduleKey: 'tags', moduleName: 'Tags', category: 'CONTENT', icon: 'Tags', routePath: '/tags', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Content tagging for blogs and pages.' },
  { moduleKey: 'documents', moduleName: 'Documents', category: 'CONTENT', icon: 'FileText', routePath: '/documents', publicRoutePath: '/documents', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true, description: 'Document management with AI metadata generation.' },

  // ═══════════════════════════════════════════════════════════════
  // MEDIA — File and image management
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'media', moduleName: 'Media Library', category: 'MEDIA', icon: 'Images', routePath: '/media', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: true, description: 'Image and file upload, management, and gallery.' },

  // ═══════════════════════════════════════════════════════════════
  // AI — AI-powered features
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'ai_assistant', moduleName: 'AI Content Assistant', category: 'AI', icon: 'Sparkles', routePath: '/ai/usage', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'AI content generation, rewriting, summarization.', dependsOnJson: ['ai_providers'] },
  { moduleKey: 'ai_seo', moduleName: 'AI SEO Assistant', category: 'AI', icon: 'Sparkles', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'AI-powered SEO metadata generation.', dependsOnJson: ['ai_providers'] },
  { moduleKey: 'ai_chatbot', moduleName: 'AI Chatbot', category: 'AI', icon: 'MessageCircle', routePath: '/chatbot', publicRoutePath: '/', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: true, isTemplateAvailable: true, description: 'Public chatbot with knowledge retrieval and lead capture.', dependsOnJson: ['ai_providers'] },
  { moduleKey: 'ai_providers', moduleName: 'AI Providers', category: 'AI', icon: 'Sparkles', routePath: '/ai/providers', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Multi-provider AI configuration and routing.' },
  { moduleKey: 'ai_document_metadata', moduleName: 'AI Document Metadata', category: 'AI', icon: 'Sparkles', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'AI-powered PDF metadata extraction.', dependsOnJson: ['ai_providers', 'documents'] },
  { moduleKey: 'ai_template_generator', moduleName: 'AI Template Generator', category: 'AI', icon: 'Sparkles', routePath: '/templates/ai-generate', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'AI-powered website template generation.', dependsOnJson: ['ai_providers', 'template_manager'] },

  // ═══════════════════════════════════════════════════════════════
  // GOVERNANCE — Workflow, notifications, audit
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'workflow', moduleName: 'Workflow', category: 'GOVERNANCE', icon: 'ClipboardCheck', routePath: '/workflow', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Content approval workflow with review stages.' },
  { moduleKey: 'notifications', moduleName: 'Notifications', category: 'GOVERNANCE', icon: 'Bell', routePath: '/notifications', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'In-app notification system.' },
  { moduleKey: 'audit_logs', moduleName: 'Audit Logs', category: 'GOVERNANCE', icon: 'FileText', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'System-wide audit trail.' },
  { moduleKey: 'chatbot_leads', moduleName: 'Chatbot Leads', category: 'GOVERNANCE', icon: 'Users', routePath: '/chatbot/leads', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Lead capture from chatbot conversations.', dependsOnJson: ['ai_chatbot'] },

  // ═══════════════════════════════════════════════════════════════
  // TEMPLATE & PUBLIC — Website rendering
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'template_manager', moduleName: 'Template Manager', category: 'UTILITY', icon: 'Layout', routePath: '/templates', isEnabledGlobally: true, isAdminVisible: true, isPublicEnabled: false, isTemplateAvailable: false, description: 'Website template upload, AI generation, compliance checks, layout builder.' },
  { moduleKey: 'template_modules', moduleName: 'Template Modules', category: 'UTILITY', icon: 'Layout', routePath: '/templates/modules', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'Module registry for template placement.' },
  { moduleKey: 'public_website', moduleName: 'Public Website', category: 'UTILITY', icon: 'Globe', publicRoutePath: '/', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: true, isTemplateAvailable: false, description: 'Public-facing website renderer.' },
  { moduleKey: 'search', moduleName: 'Search', category: 'UTILITY', icon: 'Search', isEnabledGlobally: true, isAdminVisible: false, isPublicEnabled: true, isTemplateAvailable: true, description: 'Site-wide search functionality.' },

  // ═══════════════════════════════════════════════════════════════
  // FUTURE — Not yet built, registered as placeholders
  // ═══════════════════════════════════════════════════════════════
  { moduleKey: 'faq', moduleName: 'FAQ', category: 'CONTENT', icon: 'HelpCircle', routePath: '/faq', publicRoutePath: '/faq', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Frequently Asked Questions management.' },
  { moduleKey: 'announcements', moduleName: 'Announcements', category: 'CONTENT', icon: 'Megaphone', routePath: '/announcements', publicRoutePath: '/announcements', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Public announcements and notices.' },
  { moduleKey: 'events', moduleName: 'Events', category: 'CONTENT', icon: 'Calendar', routePath: '/events', publicRoutePath: '/events', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Event management and calendar.' },
  { moduleKey: 'tender', moduleName: 'Tenders', category: 'GOVERNMENT', icon: 'FileText', routePath: '/tenders', publicRoutePath: '/tenders', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Tender and procurement notices.' },
  { moduleKey: 'scheme', moduleName: 'Schemes', category: 'GOVERNMENT', icon: 'FileText', routePath: '/schemes', publicRoutePath: '/schemes', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Government schemes and programs.' },
  { moduleKey: 'grievance', moduleName: 'Grievance', category: 'PUBLIC_ENGAGEMENT', icon: 'MessageSquare', routePath: '/grievance', publicRoutePath: '/grievance', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Public grievance submission and tracking.' },
  { moduleKey: 'forms', moduleName: 'Form Builder', category: 'PUBLIC_ENGAGEMENT', icon: 'ClipboardList', routePath: '/forms', publicRoutePath: '/forms', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Dynamic form builder and submissions.' },
  { moduleKey: 'rti', moduleName: 'RTI Disclosures', category: 'GOVERNMENT', icon: 'FileText', routePath: '/rti', publicRoutePath: '/rti', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Right to Information disclosures.' },
  { moduleKey: 'contact_directory', moduleName: 'Contact Directory', category: 'UTILITY', icon: 'Phone', routePath: '/contacts', publicRoutePath: '/contacts', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Department contact directory.' },
  { moduleKey: 'newsletter', moduleName: 'Newsletter', category: 'PUBLIC_ENGAGEMENT', icon: 'Mail', routePath: '/newsletter', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Newsletter signup and email campaigns.' },
  { moduleKey: 'gallery', moduleName: 'Photo Gallery', category: 'MEDIA', icon: 'Image', routePath: '/gallery', publicRoutePath: '/gallery', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Photo and video gallery management.' },
  { moduleKey: 'press_releases', moduleName: 'Press Releases', category: 'CONTENT', icon: 'Newspaper', routePath: '/press-releases', publicRoutePath: '/press-releases', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Press release management and publishing.' },
  { moduleKey: 'careers', moduleName: 'Careers', category: 'PUBLIC_ENGAGEMENT', icon: 'Briefcase', routePath: '/careers', publicRoutePath: '/careers', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Job postings and career page.' },
  { moduleKey: 'downloads', moduleName: 'Downloads Center', category: 'CONTENT', icon: 'Download', routePath: '/downloads', publicRoutePath: '/downloads', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Downloadable resources and files.' },
  { moduleKey: 'feedback', moduleName: 'Feedback', category: 'PUBLIC_ENGAGEMENT', icon: 'MessageCircle', routePath: '/feedback', publicRoutePath: '/feedback', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Public feedback collection.' },
  { moduleKey: 'sitemap', moduleName: 'Sitemap', category: 'UTILITY', icon: 'Map', publicRoutePath: '/sitemap', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Auto-generated XML and HTML sitemap.' },
  { moduleKey: 'accessibility_widget', moduleName: 'Accessibility Widget', category: 'UTILITY', icon: 'Eye', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Frontend accessibility controls (font size, contrast).' },
  { moduleKey: 'language_switcher', moduleName: 'Language Switcher', category: 'UTILITY', icon: 'Globe', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Multi-language support and switcher.' },
  { moduleKey: 'social_media', moduleName: 'Social Media Feed', category: 'PUBLIC_ENGAGEMENT', icon: 'Share2', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: true, description: 'Social media feed integration.' },
  { moduleKey: 'analytics', moduleName: 'Analytics', category: 'UTILITY', icon: 'BarChart', routePath: '/analytics', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'Website analytics and visitor tracking.' },
  { moduleKey: 'email_notifications', moduleName: 'Email Notifications', category: 'GOVERNANCE', icon: 'Mail', isEnabledGlobally: false, isAdminVisible: false, isPublicEnabled: false, isTemplateAvailable: false, description: 'Email notification system for workflow events.' },
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
    let created = 0;
    let updated = 0;
    for (const mod of MODULES) {
      const existing = await prisma.cmsModule.findUnique({ where: { moduleKey: mod.moduleKey } });
      if (existing) {
        await prisma.cmsModule.update({
          where: { moduleKey: mod.moduleKey },
          data: { moduleName: mod.moduleName, category: mod.category, description: mod.description ?? null, icon: mod.icon ?? null, routePath: mod.routePath ?? null, publicRoutePath: mod.publicRoutePath ?? null },
        });
        updated++;
      } else {
        await prisma.cmsModule.create({ data: mod as any });
        created++;
      }
    }
    console.log(`Module registry: ${created} created, ${updated} updated. Total: ${MODULES.length} modules.`);
  } finally { await prisma.$disconnect(); }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
