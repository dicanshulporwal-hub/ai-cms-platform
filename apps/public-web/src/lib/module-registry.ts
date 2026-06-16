import type { ComponentType } from 'react';
import type { ModuleComponentProps } from '@/types/template';

import { SiteHeaderModule } from '@/components/modules/site-header';
import { NavigationModule } from '@/components/modules/navigation';
import { PageContentModule } from '@/components/modules/page-content';
import { BlogListModule } from '@/components/modules/blog-list';
import { DocumentListModule } from '@/components/modules/document-list';
import { FaqListModule } from '@/components/modules/faq-list';
import { FormEmbedModule } from '@/components/modules/form-embed';
import { FooterModule } from '@/components/modules/footer-module';
import { ChatbotModule } from '@/components/modules/chatbot-module';
import { SearchModule } from '@/components/modules/search-module';
import { CustomHtmlModule } from '@/components/modules/custom-html';
import { MediaGalleryModule } from '@/components/modules/media-gallery';
import { AnnouncementListModule } from '@/components/modules/announcement-list';
import { TenderListModule } from '@/components/modules/tender-list';
import { SchemeListModule } from '@/components/modules/scheme-list';
import { QuickLinksModule } from '@/components/modules/quick-links';
import { NewsroomListModule } from '@/components/modules/newsroom-list';
import { StatisticsCountersModule } from '@/components/modules/statistics-counters';
import { GrievanceSubmitModule, GrievanceTrackModule } from '@/components/modules/grievance-modules';
import { RTIDisclosureModule } from '@/components/modules/rti-disclosure';
import { DepartmentListModule } from '@/components/modules/department-list';
import { SocialLinksModule } from '@/components/modules/social-links';
import { LanguageSwitcherModule } from '@/components/modules/language-switcher';
import { NewsletterSubscribeModule } from '@/components/modules/newsletter-subscribe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODULE_MAP: Record<string, ComponentType<ModuleComponentProps>> = {
  // Structure
  SITE_HEADER: SiteHeaderModule,
  NAVIGATION: NavigationModule,
  NAVIGATION_MENU: NavigationModule,
  FOOTER: FooterModule,
  FOOTER_LINKS: FooterModule,

  // Core content
  PAGE_CONTENT: PageContentModule,
  BLOG_LIST: BlogListModule,
  DOCUMENT_LIST: DocumentListModule,
  FAQ_LIST: FaqListModule,
  FORM_EMBED: FormEmbedModule,
  MEDIA_GALLERY: MediaGalleryModule,

  // Utility
  SEARCH: SearchModule,
  CHATBOT: ChatbotModule,
  CUSTOM_HTML: CustomHtmlModule,
  QUICK_LINKS: QuickLinksModule,
  STATISTICS_COUNTERS: StatisticsCountersModule,
  LANGUAGE_SWITCHER: LanguageSwitcherModule as any,
  SOCIAL_LINKS: SocialLinksModule,
  NEWSLETTER_SUBSCRIBE: NewsletterSubscribeModule as any,

  // Government modules
  ANNOUNCEMENT_LIST: AnnouncementListModule as any,
  TENDER_LIST: TenderListModule as any,
  SCHEME_LIST: SchemeListModule as any,
  SERVICE_LIST: SchemeListModule as any,
  NEWSROOM_LIST: NewsroomListModule as any,
  PRESS_RELEASE_LIST: NewsroomListModule as any,
  GRIEVANCE_SUBMIT: GrievanceSubmitModule,
  GRIEVANCE_TRACK: GrievanceTrackModule,
  RTI_DISCLOSURE: RTIDisclosureModule,
  DEPARTMENT_LIST: DepartmentListModule as any,
  CONTACT_DIRECTORY: DepartmentListModule as any,

  // Accessibility controls are rendered separately in AccessibilityToolbar
  // ACCESSIBILITY_CONTROLS is handled inline via the topbar
};

export function resolveModule(moduleType: string): ComponentType<ModuleComponentProps> | null {
  return MODULE_MAP[moduleType] ?? null;
}

export function getRegisteredModuleTypes(): string[] {
  return Object.keys(MODULE_MAP);
}
