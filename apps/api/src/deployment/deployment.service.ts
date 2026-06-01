import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class DeploymentService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  // === ENVIRONMENTS ===
  async listEnvironments() {
    return this.prisma.deploymentEnvironment.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' }, take: 20 });
  }

  async getEnvironment(id: string) {
    const env = await this.prisma.deploymentEnvironment.findUnique({ where: { id } });
    if (!env || env.deletedAt) throw new NotFoundException('Environment not found.');
    return env;
  }

  async createEnvironment(dto: { name: string; environmentKey: string; description?: string; baseUrl?: string; apiUrl?: string; adminUrl?: string; publicUrl?: string; status?: string }, user: AuthenticatedUser) {
    const existing = await this.prisma.deploymentEnvironment.findUnique({ where: { environmentKey: dto.environmentKey } });
    if (existing) throw new BadRequestException('Environment key already exists.');
    const env = await this.prisma.deploymentEnvironment.create({ data: { ...dto, status: (dto.status || 'LOCAL') as any, createdById: user.id } });
    await this.log(env.id, 'ENVIRONMENT_CREATED', 'SUCCESS', `Environment "${dto.name}" created.`, user.id);
    return env;
  }

  async updateEnvironment(id: string, dto: any, user: AuthenticatedUser) {
    const env = await this.getEnvironment(id);
    const updated = await this.prisma.deploymentEnvironment.update({ where: { id }, data: dto });
    await this.log(id, 'ENVIRONMENT_UPDATED', 'SUCCESS', `Environment "${env.name}" updated.`, user.id);
    return updated;
  }

  async deleteEnvironment(id: string, user: AuthenticatedUser) {
    const env = await this.getEnvironment(id);
    await this.prisma.deploymentEnvironment.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.log(id, 'ENVIRONMENT_DELETED', 'INFO', `Environment "${env.name}" deleted.`, user.id);
    return { message: 'Environment deleted.' };
  }

  async setDefault(id: string, user: AuthenticatedUser) {
    await this.prisma.deploymentEnvironment.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    await this.prisma.deploymentEnvironment.update({ where: { id }, data: { isDefault: true } });
    await this.log(id, 'DEFAULT_CHANGED', 'SUCCESS', 'Set as default environment.', user.id);
    return this.getEnvironment(id);
  }

  // === READINESS CHECK ===
  async runReadinessCheck(environmentId: string, user: AuthenticatedUser) {
    const env = await this.getEnvironment(environmentId);
    const checks: { key: string; title: string; category: string; severity: string; status: string; message: string }[] = [];

    // Database
    checks.push({ key: 'db_url', title: 'DATABASE_URL configured', category: 'DATABASE', severity: 'CRITICAL', status: this.config.get('DATABASE_URL') ? 'PASSED' : 'FAILED', message: this.config.get('DATABASE_URL') ? 'Database URL is set.' : 'DATABASE_URL is missing.' });

    // Auth
    checks.push({ key: 'jwt_secret', title: 'JWT_SECRET configured', category: 'SECURITY', severity: 'CRITICAL', status: this.config.get('JWT_SECRET') ? 'PASSED' : 'FAILED', message: this.config.get('JWT_SECRET') ? 'JWT secret is set.' : 'JWT_SECRET is missing.' });

    // Public URLs
    checks.push({ key: 'public_url', title: 'Public website URL configured', category: 'PUBLIC_WEBSITE', severity: 'HIGH', status: this.config.get('PUBLIC_WEB_URL') ? 'PASSED' : 'WARNING', message: this.config.get('PUBLIC_WEB_URL') || 'Using default localhost.' });

    // AI
    const aiProvider = this.config.get('AI_PROVIDER');
    checks.push({ key: 'ai_provider', title: 'AI provider configured', category: 'AI', severity: 'MEDIUM', status: aiProvider ? 'PASSED' : 'WARNING', message: aiProvider ? `Provider: ${aiProvider}` : 'No AI provider configured.' });

    // Storage
    checks.push({ key: 'media_dir', title: 'Media upload directory', category: 'STORAGE', severity: 'HIGH', status: this.config.get('MEDIA_UPLOAD_DIR') ? 'PASSED' : 'WARNING', message: this.config.get('MEDIA_UPLOAD_DIR') || 'Using default.' });

    // Backup
    checks.push({ key: 'backup_dir', title: 'Backup directory configured', category: 'BACKUP', severity: 'MEDIUM', status: this.config.get('BACKUP_UPLOAD_DIR') ? 'PASSED' : 'WARNING', message: this.config.get('BACKUP_UPLOAD_DIR') || 'Using default.' });

    // Health
    checks.push({ key: 'api_port', title: 'API port configured', category: 'SYSTEM', severity: 'LOW', status: 'PASSED', message: `Port: ${this.config.get('PORT') || 3001}` });

    // Score
    const passed = checks.filter(c => c.status === 'PASSED').length;
    const failed = checks.filter(c => c.status === 'FAILED').length;
    const warnings = checks.filter(c => c.status === 'WARNING').length;
    const score = checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0;

    await this.log(environmentId, 'READINESS_CHECK', score >= 80 ? 'SUCCESS' : 'WARNING', `Readiness: ${score}% (${passed} passed, ${failed} failed, ${warnings} warnings)`, user.id);

    return { environmentId, score, passed, failed, warnings, total: checks.length, checks };
  }

  // === CHECKLIST ===
  async getChecklist() {
    return this.prisma.deploymentChecklistItem.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }], take: 100 });
  }

  async seedChecklist() {
    const items = [
      { checklistKey: 'backend_build', title: 'Backend builds successfully', category: 'BUILD', severity: 'CRITICAL', isRequired: true, sortOrder: 1 },
      { checklistKey: 'admin_build', title: 'Admin frontend builds successfully', category: 'BUILD', severity: 'CRITICAL', isRequired: true, sortOrder: 2 },
      { checklistKey: 'public_build', title: 'Public frontend builds successfully', category: 'BUILD', severity: 'CRITICAL', isRequired: true, sortOrder: 3 },
      { checklistKey: 'prisma_migrate', title: 'Database migrations applied', category: 'DATABASE', severity: 'CRITICAL', isRequired: true, sortOrder: 4 },
      { checklistKey: 'seed_data', title: 'Seed data verified', category: 'DATABASE', severity: 'HIGH', isRequired: false, sortOrder: 5 },
      { checklistKey: 'jwt_secret', title: 'JWT secret configured (not default)', category: 'SECURITY', severity: 'CRITICAL', isRequired: true, sortOrder: 6 },
      { checklistKey: 'cors_config', title: 'CORS configured for production', category: 'SECURITY', severity: 'HIGH', isRequired: true, sortOrder: 7 },
      { checklistKey: 'storage_config', title: 'File storage configured', category: 'STORAGE', severity: 'HIGH', isRequired: true, sortOrder: 8 },
      { checklistKey: 'ai_keys', title: 'AI provider keys configured', category: 'AI', severity: 'MEDIUM', isRequired: false, sortOrder: 9 },
      { checklistKey: 'active_template', title: 'Active template selected', category: 'PUBLIC_WEBSITE', severity: 'HIGH', isRequired: true, sortOrder: 10 },
      { checklistKey: 'sitemap', title: 'Sitemap available', category: 'SEO', severity: 'MEDIUM', isRequired: false, sortOrder: 11 },
      { checklistKey: 'accessibility_check', title: 'Accessibility check passed', category: 'ACCESSIBILITY', severity: 'MEDIUM', isRequired: false, sortOrder: 12 },
      { checklistKey: 'backup_created', title: 'Backup created before deploy', category: 'BACKUP', severity: 'HIGH', isRequired: true, sortOrder: 13 },
      { checklistKey: 'analytics_enabled', title: 'Analytics tracking enabled', category: 'MONITORING', severity: 'LOW', isRequired: false, sortOrder: 14 },
      { checklistKey: 'green_code_audit', title: 'Green Code audit passed', category: 'GREEN_CODE', severity: 'LOW', isRequired: false, sortOrder: 15 },
    ];

    let created = 0;
    for (const item of items) {
      const existing = await this.prisma.deploymentChecklistItem.findUnique({ where: { checklistKey: item.checklistKey } });
      if (!existing) { await this.prisma.deploymentChecklistItem.create({ data: item }); created++; }
    }
    return { message: `Seeded ${created} checklist items.`, total: items.length };
  }

  // === LOGS ===
  async getLogs(environmentId?: string) {
    const where: any = {};
    if (environmentId) where.environmentId = environmentId;
    return this.prisma.deploymentLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async createLog(environmentId: string, dto: { action: string; status?: string; message?: string }, user: AuthenticatedUser) {
    return this.log(environmentId, dto.action, dto.status || 'INFO', dto.message || '', user.id);
  }

  // === SUMMARY ===
  async getSummary() {
    const environments = await this.prisma.deploymentEnvironment.count({ where: { deletedAt: null } });
    const defaultEnv = await this.prisma.deploymentEnvironment.findFirst({ where: { isDefault: true, deletedAt: null }, select: { id: true, name: true, status: true } });
    const checklistItems = await this.prisma.deploymentChecklistItem.count();
    const recentLogs = await this.prisma.deploymentLog.count();
    return { environments, defaultEnv, checklistItems, recentLogs };
  }

  private async log(environmentId: string | null, action: string, status: string, message: string, userId: string) {
    await this.prisma.deploymentLog.create({ data: { environmentId, action, status, message, createdById: userId } });
    await this.prisma.auditLog.create({ data: { action: `deployment.${action.toLowerCase()}`, entityId: environmentId || 'system', entityType: 'DeploymentEnvironment', userId, metadata: { status } as unknown as Prisma.InputJsonValue } });
  }
}
