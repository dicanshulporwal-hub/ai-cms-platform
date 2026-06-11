import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

type TemplateModuleSeed = {
  moduleKey: string;
  moduleName: string;
  moduleType: string;
  category: string;
  description: string;
  isPublicEnabled: boolean;
  isSystemModule: boolean;
  isActive: boolean;
  supportedRegionTypesJson: string[];
  defaultConfigJson?: Record<string, unknown>;
};

const COMMON_DEFAULT_CONFIG = {
  displayTitle: '',
  showTitle: true,
  limit: 6,
  displayMode: 'list',
  categoryId: '',
  departmentId: '',
  showDate: true,
  showImage: true,
  showCTA: true,
  showSearch: false,
  showFilters: false,
  customCssClass: '',
  isVisible: true,
};

const withConfig = (config: Record<string, unknown> = {}) => ({ ...COMMON_DEFAULT_CONFIG, ...config });

const DEFAULT_TEMPLATE_MODULES = [
  { moduleKey: 'SITE_HEADER', moduleName: 'Site Header', moduleType: 'SITE_HEADER', category: 'Structure', description: 'Site logo, name, and primary header area.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['HEADER', 'TOPBAR'], defaultConfigJson: withConfig({ headerStyle: 'government', showSearch: true }) },
  { moduleKey: 'NAVIGATION_MENU', moduleName: 'Navigation Menu', moduleType: 'NAVIGATION_MENU', category: 'Structure', description: 'Main public website navigation.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['HEADER', 'NAVIGATION'], defaultConfigJson: withConfig({ menuId: '', location: 'primary', sticky: true, displayMode: 'horizontal' }) },
  { moduleKey: 'NAVIGATION', moduleName: 'Navigation Menu (Legacy)', moduleType: 'NAVIGATION', category: 'Structure', description: 'Legacy navigation module alias.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['HEADER', 'NAVIGATION'], defaultConfigJson: withConfig({ menuId: '', location: 'primary', sticky: true, displayMode: 'horizontal' }) },
  { moduleKey: 'PAGE_CONTENT', moduleName: 'Page Content', moduleType: 'PAGE_CONTENT', category: 'Content', description: 'Renders selected published page content.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'HERO'], defaultConfigJson: withConfig({ displayMode: 'article' }) },
  { moduleKey: 'BLOG_LIST', moduleName: 'Blog List', moduleType: 'BLOG_LIST', category: 'Content', description: 'Displays recent published blog posts.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'SIDEBAR'], defaultConfigJson: withConfig({ limit: 4, displayMode: 'cards' }) },
  { moduleKey: 'DOCUMENT_LIST', moduleName: 'Document List', moduleType: 'DOCUMENT_LIST', category: 'Content', description: 'Lists published documents.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'SIDEBAR'], defaultConfigJson: withConfig({ showFilters: true, displayMode: 'list' }) },
  { moduleKey: 'FAQ_LIST', moduleName: 'FAQ List', moduleType: 'FAQ_LIST', category: 'Content', description: 'Frequently asked questions list.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'SIDEBAR'], defaultConfigJson: withConfig({ displayMode: 'accordion' }) },
  { moduleKey: 'FORM_EMBED', moduleName: 'Form Embed', moduleType: 'FORM_EMBED', category: 'Engagement', description: 'Embedded public form.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ formId: '' }) },
  { moduleKey: 'SEARCH', moduleName: 'Search Box', moduleType: 'SEARCH', category: 'Utility', description: 'Site-wide search box.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['TOPBAR', 'HEADER', 'NAVIGATION', 'CONTENT'], defaultConfigJson: withConfig({ placeholder: 'Search the portal', showFilters: true }) },
  { moduleKey: 'CHATBOT', moduleName: 'Chatbot Widget', moduleType: 'CHATBOT', category: 'Engagement', description: 'Floating chatbot widget for visitor interaction.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CHATBOT', 'FOOTER'], defaultConfigJson: withConfig({ showTitle: false }) },
  { moduleKey: 'FOOTER_LINKS', moduleName: 'Footer Links', moduleType: 'FOOTER_LINKS', category: 'Structure', description: 'Footer links, policies, and contact information.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['FOOTER'], defaultConfigJson: withConfig({ displayMode: 'columns' }) },
  { moduleKey: 'FOOTER', moduleName: 'Site Footer (Legacy)', moduleType: 'FOOTER', category: 'Structure', description: 'Legacy footer module alias.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['FOOTER'], defaultConfigJson: withConfig({ displayMode: 'columns' }) },
  { moduleKey: 'MEDIA_GALLERY', moduleName: 'Media Gallery', moduleType: 'MEDIA_GALLERY', category: 'Content', description: 'Displays media assets in a gallery.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ limit: 8, displayMode: 'grid' }) },
  { moduleKey: 'ANNOUNCEMENT_LIST', moduleName: 'Announcements', moduleType: 'ANNOUNCEMENT_LIST', category: 'Government', description: 'Public announcements and notices.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['TOPBAR', 'CONTENT', 'SIDEBAR'], defaultConfigJson: withConfig({ announcementType: 'all', showPinnedFirst: true, showImportantOnly: false, tickerMode: false }) },
  { moduleKey: 'TENDER_LIST', moduleName: 'Tender List', moduleType: 'TENDER_LIST', category: 'Government', description: 'Active tenders and procurement notices.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ procurementType: 'all', showActiveOnly: true, showClosingDate: true, showCorrigendumBadge: true }) },
  { moduleKey: 'SCHEME_LIST', moduleName: 'Scheme List', moduleType: 'SCHEME_LIST', category: 'Government', description: 'Government schemes and programs.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ showApplyButton: true, showApplicationMode: true }) },
  { moduleKey: 'SERVICE_LIST', moduleName: 'Service List', moduleType: 'SERVICE_LIST', category: 'Government', description: 'Citizen services and application links.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ showApplyButton: true, showApplicationMode: true }) },
  { moduleKey: 'GRIEVANCE_SUBMIT', moduleName: 'Grievance Submit', moduleType: 'GRIEVANCE_SUBMIT', category: 'Government', description: 'Public grievance submission entry point.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ displayMode: 'form-link' }) },
  { moduleKey: 'GRIEVANCE_TRACK', moduleName: 'Grievance Track', moduleType: 'GRIEVANCE_TRACK', category: 'Government', description: 'Public grievance tracking entry point.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ displayMode: 'form-link' }) },
  { moduleKey: 'RTI_DISCLOSURE', moduleName: 'RTI Disclosure', moduleType: 'RTI_DISCLOSURE', category: 'Government', description: 'Right to Information disclosure block.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'FOOTER'], defaultConfigJson: withConfig({ displayMode: 'list' }) },
  { moduleKey: 'DEPARTMENT_LIST', moduleName: 'Department List', moduleType: 'DEPARTMENT_LIST', category: 'Government', description: 'Department directory and office listing.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ showSearch: true, showFilters: true }) },
  { moduleKey: 'CONTACT_DIRECTORY', moduleName: 'Contact Directory', moduleType: 'CONTACT_DIRECTORY', category: 'Government', description: 'Officer and department contact directory.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ departmentId: '', designationId: '', showSearch: true, showFilters: true }) },
  { moduleKey: 'ORGANIZATION_CHART', moduleName: 'Organization Chart', moduleType: 'ORGANIZATION_CHART', category: 'Government', description: 'Organization hierarchy chart.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ displayMode: 'tree' }) },
  { moduleKey: 'NEWSROOM_LIST', moduleName: 'Newsroom List', moduleType: 'NEWSROOM_LIST', category: 'Content', description: 'Newsroom items and updates.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ itemType: 'all', showFeaturedOnly: false, showGallery: true }) },
  { moduleKey: 'PRESS_RELEASE_LIST', moduleName: 'Press Release List', moduleType: 'PRESS_RELEASE_LIST', category: 'Content', description: 'Published press releases.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ itemType: 'press_release', showFeaturedOnly: false, showGallery: false }) },
  { moduleKey: 'ACCESSIBILITY_CONTROLS', moduleName: 'Accessibility Controls', moduleType: 'ACCESSIBILITY_CONTROLS', category: 'Utility', description: 'Accessibility controls for visitors.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['TOPBAR', 'HEADER'], defaultConfigJson: withConfig({ showTitle: false, highContrastEnabled: true }) },
  { moduleKey: 'LANGUAGE_SWITCHER', moduleName: 'Language Switcher', moduleType: 'LANGUAGE_SWITCHER', category: 'Utility', description: 'Language selector for public website.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['TOPBAR', 'HEADER', 'NAVIGATION'], defaultConfigJson: withConfig({ showTitle: false }) },
  { moduleKey: 'STATISTICS_COUNTERS', moduleName: 'Statistics Counters', moduleType: 'STATISTICS_COUNTERS', category: 'Utility', description: 'Manual or automatic portal statistics counters.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT'], defaultConfigJson: withConfig({ statSource: 'manual', manualCounters: [], autoCounters: [] }) },
  { moduleKey: 'QUICK_LINKS', moduleName: 'Quick Links', moduleType: 'QUICK_LINKS', category: 'Utility', description: 'Shortcut links for important public pages.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'SIDEBAR', 'FOOTER'], defaultConfigJson: withConfig({ displayMode: 'grid' }) },
  { moduleKey: 'SOCIAL_LINKS', moduleName: 'Social Links', moduleType: 'SOCIAL_LINKS', category: 'Engagement', description: 'Official social media profile links.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['TOPBAR', 'FOOTER'], defaultConfigJson: withConfig({ showTitle: false }) },
  { moduleKey: 'NEWSLETTER_SUBSCRIBE', moduleName: 'Newsletter Subscribe', moduleType: 'NEWSLETTER_SUBSCRIBE', category: 'Engagement', description: 'Newsletter subscription form.', isPublicEnabled: true, isSystemModule: true, isActive: true, supportedRegionTypesJson: ['CONTENT', 'FOOTER'], defaultConfigJson: withConfig({ displayMode: 'compact' }) },
  { moduleKey: 'CUSTOM_HTML', moduleName: 'Custom HTML', moduleType: 'CUSTOM_HTML', category: 'Custom', description: 'Render sanitized custom HTML content.', isPublicEnabled: true, isSystemModule: false, isActive: true, supportedRegionTypesJson: ['HEADER', 'CONTENT', 'SIDEBAR', 'FOOTER'], defaultConfigJson: withConfig({ html: '' }) },
] satisfies TemplateModuleSeed[];

const CMS_MODULE_KEYS_BY_TEMPLATE_MODULE_TYPE: Record<string, string[]> = {
  PAGE_CONTENT: ['pages'],
  BLOG_LIST: ['blogs'],
  DOCUMENT_LIST: ['documents'],
  FAQ_LIST: ['faq'],
  FORM_EMBED: ['forms'],
  SEARCH: ['search'],
  CHATBOT: ['ai_chatbot'],
  MEDIA_GALLERY: ['media', 'gallery'],
  ANNOUNCEMENT_LIST: ['announcements'],
  TENDER_LIST: ['tender'],
  SCHEME_LIST: ['scheme'],
  SERVICE_LIST: ['scheme'],
  GRIEVANCE_SUBMIT: ['grievance'],
  GRIEVANCE_TRACK: ['grievance'],
  RTI_DISCLOSURE: ['rti'],
  DEPARTMENT_LIST: ['contact_directory'],
  CONTACT_DIRECTORY: ['contact_directory'],
  ORGANIZATION_CHART: ['contact_directory'],
  NEWSROOM_LIST: ['blogs', 'press_releases'],
  PRESS_RELEASE_LIST: ['press_releases'],
  ACCESSIBILITY_CONTROLS: ['accessibility_widget'],
  LANGUAGE_SWITCHER: ['language_switcher'],
  SOCIAL_LINKS: ['social_media'],
  NEWSLETTER_SUBSCRIBE: ['newsletter'],
};

@Injectable()
export class TemplateModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    await this.ensureDefaultModules();
    return this.findModuleManagementFilteredModules(false);
  }

  async findOne(id: string) {
    const mod = await this.prisma.templateModuleRegistry.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found.');
    return mod;
  }

  async findActivePublic() {
    await this.ensureDefaultModules();
    return this.findModuleManagementFilteredModules(true);
  }

  private async ensureDefaultModules() {
    for (const mod of DEFAULT_TEMPLATE_MODULES) {
      await this.prisma.templateModuleRegistry.upsert({
        where: { moduleKey: mod.moduleKey },
        update: {
          moduleName: mod.moduleName,
          moduleType: mod.moduleType,
          description: mod.description,
          category: mod.category,
          defaultConfigJson: (mod.defaultConfigJson ?? {}) as Prisma.InputJsonValue,
          supportedRegionTypesJson: mod.supportedRegionTypesJson as Prisma.InputJsonValue,
        },
        create: {
          ...mod,
          defaultConfigJson: (mod.defaultConfigJson ?? {}) as Prisma.InputJsonValue,
          supportedRegionTypesJson: mod.supportedRegionTypesJson as Prisma.InputJsonValue,
        },
      });
    }
  }

  private async findModuleManagementFilteredModules(requirePublicAccess: boolean) {
    const [registryModules, cmsModules] = await Promise.all([
      this.prisma.templateModuleRegistry.findMany({
        where: requirePublicAccess ? { isActive: true, isPublicEnabled: true } : undefined,
        orderBy: [{ category: 'asc' }, { moduleName: 'asc' }],
      }),
      this.prisma.cmsModule.findMany({
        select: {
          moduleKey: true,
          isEnabledGlobally: true,
          isTemplateAvailable: true,
          isPublicEnabled: true,
        },
      }),
    ]);

    return registryModules.filter((mod) => this.isAllowedByModuleManagement(mod.moduleType, cmsModules, requirePublicAccess));
  }

  private isAllowedByModuleManagement(
    moduleType: string,
    cmsModules: Array<{ moduleKey: string; isEnabledGlobally: boolean; isTemplateAvailable: boolean; isPublicEnabled: boolean }>,
    requirePublicAccess: boolean,
  ) {
    const moduleKeys = CMS_MODULE_KEYS_BY_TEMPLATE_MODULE_TYPE[moduleType];
    if (!moduleKeys?.length) return true;

    return moduleKeys.some((moduleKey) => {
      const cmsModule = cmsModules.find((mod) => mod.moduleKey === moduleKey);
      if (!cmsModule) return false;
      if (!cmsModule.isEnabledGlobally || !cmsModule.isTemplateAvailable) return false;
      if (requirePublicAccess && !cmsModule.isPublicEnabled) return false;
      return true;
    });
  }

  async create(dto: { moduleKey: string; moduleName: string; moduleType: string; description?: string; category?: string; defaultConfigJson?: Record<string, unknown>; supportedRegionTypesJson?: string[] }, user: AuthenticatedUser) {
    const existing = await this.prisma.templateModuleRegistry.findUnique({ where: { moduleKey: dto.moduleKey } });
    if (existing) throw new ConflictException('Module key already exists.');
    const mod = await this.prisma.templateModuleRegistry.create({
      data: {
        moduleKey: dto.moduleKey, moduleName: dto.moduleName, moduleType: dto.moduleType,
        description: dto.description, category: dto.category ?? 'Custom',
        defaultConfigJson: (dto.defaultConfigJson ?? {}) as unknown as Prisma.InputJsonValue,
        supportedRegionTypesJson: (dto.supportedRegionTypesJson ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.created', entityId: mod.id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: dto.moduleKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return mod;
  }

  async update(id: string, dto: { moduleName?: string; description?: string; category?: string; defaultConfigJson?: Record<string, unknown>; supportedRegionTypesJson?: string[] }, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    if (mod.isSystemModule && dto.moduleName) {
      // Allow description/config changes but not key changes for system modules
    }
    const updated = await this.prisma.templateModuleRegistry.update({
      where: { id },
      data: {
        moduleName: dto.moduleName, description: dto.description, category: dto.category,
        defaultConfigJson: dto.defaultConfigJson ? (dto.defaultConfigJson as unknown as Prisma.InputJsonValue) : undefined,
        supportedRegionTypesJson: dto.supportedRegionTypesJson ? (dto.supportedRegionTypesJson as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.updated', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleName: updated.moduleName } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async updateStatus(id: string, isActive: boolean, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    const updated = await this.prisma.templateModuleRegistry.update({ where: { id }, data: { isActive } });
    await this.prisma.auditLog.create({ data: { action: isActive ? 'module_registry.activated' : 'module_registry.deactivated', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: mod.moduleKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async updatePublicVisibility(id: string, isPublicEnabled: boolean, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    const updated = await this.prisma.templateModuleRegistry.update({ where: { id }, data: { isPublicEnabled } });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.public_visibility_changed', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: mod.moduleKey, isPublicEnabled } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return updated;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const mod = await this.findOne(id);
    if (mod.isSystemModule) throw new ForbiddenException('System modules cannot be deleted.');
    await this.prisma.templateModuleRegistry.delete({ where: { id } });
    await this.prisma.auditLog.create({ data: { action: 'module_registry.deleted', entityId: id, entityType: 'TemplateModuleRegistry', metadata: { moduleKey: mod.moduleKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { message: 'Module removed from registry.' };
  }
}
