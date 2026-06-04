import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface CmsModuleInfo {
  moduleKey: string;
  moduleName: string;
  isEnabledGlobally: boolean;
  isAdminVisible: boolean;
}

/**
 * Fetches enabled CMS modules. Cached for 5 minutes to avoid repeated calls.
 * Returns a Set of enabled module keys for fast lookup.
 */
export function useEnabledModules() {
  return useQuery<Set<string>>({
    queryKey: ['enabled-modules'],
    queryFn: async () => {
      try {
        const modules = await apiClient<CmsModuleInfo[]>('/modules');
        const enabledKeys = new Set<string>();
        for (const mod of modules) {
          if (mod.isEnabledGlobally && mod.isAdminVisible) {
            enabledKeys.add(mod.moduleKey);
          }
        }
        return enabledKeys;
      } catch {
        // If modules endpoint fails (e.g., fresh install with no modules seeded), allow all
        return new Set<string>();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
