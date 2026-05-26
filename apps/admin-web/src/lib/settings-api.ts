import { apiClient } from '@/lib/api-client';

export interface Settings {
  id: string;
  siteName: string;
  siteDescription: string | null;
  siteLogo: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  supportEmail: string | null;
  chatbotEnabled: boolean;
  aiEnabled: boolean;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  siteName?: string;
  siteDescription?: string;
  siteLogo?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  supportEmail?: string;
  chatbotEnabled?: boolean;
  aiEnabled?: boolean;
  maintenanceMode?: boolean;
}

export async function fetchSettings() {
  return apiClient<Settings>('/api/settings', { cache: 'no-store' });
}

export async function updateSettings(data: UpdateSettingsInput) {
  return apiClient<Settings>('/api/settings', {
    body: JSON.stringify(data),
    method: 'PUT',
  });
}
