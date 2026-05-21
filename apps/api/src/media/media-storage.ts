import { isAbsolute, resolve } from 'path';

export function resolveMediaUploadDir(uploadDir = 'uploads/media') {
  if (isAbsolute(uploadDir)) {
    return uploadDir;
  }

  const cwd = process.cwd();
  const normalizedCwd = cwd.replaceAll('\\', '/');
  const workspaceRoot = normalizedCwd.endsWith('/apps/api')
    ? resolve(cwd, '..', '..')
    : cwd;

  return resolve(workspaceRoot, uploadDir);
}

export function normalizePublicMediaBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}
