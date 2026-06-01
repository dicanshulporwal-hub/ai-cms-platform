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

const MODULE_MAP: Record<string, ComponentType<ModuleComponentProps>> = {
  SITE_HEADER: SiteHeaderModule,
  NAVIGATION: NavigationModule,
  PAGE_CONTENT: PageContentModule,
  BLOG_LIST: BlogListModule,
  DOCUMENT_LIST: DocumentListModule,
  FAQ_LIST: FaqListModule,
  FORM_EMBED: FormEmbedModule,
  FOOTER: FooterModule,
  CHATBOT: ChatbotModule,
  SEARCH: SearchModule,
  CUSTOM_HTML: CustomHtmlModule,
  MEDIA_GALLERY: MediaGalleryModule,
};

export function resolveModule(moduleType: string): ComponentType<ModuleComponentProps> | null {
  return MODULE_MAP[moduleType] ?? null;
}

export function getRegisteredModuleTypes(): string[] {
  return Object.keys(MODULE_MAP);
}
