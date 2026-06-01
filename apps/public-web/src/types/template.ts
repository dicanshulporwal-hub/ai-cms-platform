export interface RenderData {
  template: WebsiteTemplate | null;
  regions: TemplateRegion[];
  settings?: SiteSettings | null;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string | null;
  siteLogo: string | null;
  supportEmail: string | null;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  version: string;
  templateType: 'GOVERNMENT' | 'CORPORATE' | 'BLOG' | 'LANDING_PAGE' | 'CUSTOM';
  status: 'ACTIVE';
  isActive: true;
  thumbnailUrl: string | null;
  configJson: Record<string, unknown> | null;
}

export interface TemplateRegion {
  id: string;
  templateId: string;
  regionKey: string;
  regionName: string;
  regionType: 'HEADER' | 'NAVIGATION' | 'CONTENT' | 'SIDEBAR' | 'FOOTER' | 'CHATBOT';
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  modules: TemplateRegionModule[];
}

export interface TemplateRegionModule {
  id: string;
  templateId: string;
  regionId: string;
  moduleType: string;
  moduleKey: string;
  displayTitle: string;
  configJson: Record<string, unknown> | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface ModuleComponentProps {
  config: Record<string, unknown> | null;
  moduleKey: string;
  theme?: Record<string, string>;
}
