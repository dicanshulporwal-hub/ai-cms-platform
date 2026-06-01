import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

interface CachedRule { sourcePath: string; targetUrl: string; redirectType: string; matchType: string; preserveQueryString: boolean; id: string; }

@Injectable()
export class RedirectsService {
  private cache: CachedRule[] = [];
  private cacheTime = 0;
  private CACHE_TTL = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  // === PUBLIC RESOLVE (fast, cached) ===
  async resolve(path: string): Promise<{ matched: boolean; targetUrl?: string; redirectType?: number; preserveQueryString?: boolean }> {
    const rules = await this.getCachedRules();
    // Exact match first
    const exact = rules.find(r => r.matchType === 'EXACT' && r.sourcePath === path);
    if (exact) { this.trackHit(exact.id); return { matched: true, targetUrl: exact.targetUrl, redirectType: this.typeToCode(exact.redirectType), preserveQueryString: exact.preserveQueryString }; }
    // Prefix match
    const prefix = rules.find(r => r.matchType === 'PREFIX' && path.startsWith(r.sourcePath));
    if (prefix) { const suffix = path.slice(prefix.sourcePath.length); this.trackHit(prefix.id); return { matched: true, targetUrl: prefix.targetUrl + suffix, redirectType: this.typeToCode(prefix.redirectType), preserveQueryString: prefix.preserveQueryString }; }
    return { matched: false };
  }

  async log404(path: string, referrer?: string) {
    if (!path || path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/login')) return;
    const existing = await this.prisma.notFoundLog.findUnique({ where: { path } });
    if (existing) {
      await this.prisma.notFoundLog.update({ where: { path }, data: { hitCount: { increment: 1 }, lastSeenAt: new Date(), referrer: referrer || existing.referrer } });
    } else {
      await this.prisma.notFoundLog.create({ data: { path, referrer, status: 'NF_OPEN' } });
    }
  }

  // === ADMIN CRUD ===
  async list() {
    return this.prisma.redirectRule.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, sourcePath: true, targetUrl: true, redirectType: true, status: true, matchType: true, hitCount: true, lastHitAt: true, createdAt: true } });
  }

  async create(dto: { sourcePath: string; targetUrl: string; redirectType?: string; matchType?: string; preserveQueryString?: boolean; description?: string }, user: AuthenticatedUser) {
    if (!dto.sourcePath?.startsWith('/')) throw new BadRequestException('Source path must start with /.');
    if (!dto.targetUrl) throw new BadRequestException('Target URL is required.');
    // Loop detection
    if (dto.targetUrl === dto.sourcePath) throw new BadRequestException('Redirect loop detected: source and target are the same.');
    const existingTarget = await this.prisma.redirectRule.findFirst({ where: { sourcePath: dto.targetUrl, status: 'REDIRECT_ACTIVE', deletedAt: null } });
    if (existingTarget) throw new BadRequestException('Redirect chain detected: target URL is itself a redirect source.');

    const rule = await this.prisma.redirectRule.create({ data: { sourcePath: dto.sourcePath, targetUrl: dto.targetUrl, redirectType: (dto.redirectType || 'MOVED_PERMANENTLY_301') as any, matchType: dto.matchType || 'EXACT', preserveQueryString: dto.preserveQueryString ?? true, description: dto.description, createdById: user.id } });
    this.invalidateCache();
    await this.prisma.auditLog.create({ data: { action: 'redirect.created', entityId: rule.id, entityType: 'RedirectRule', userId: user.id, metadata: { sourcePath: dto.sourcePath, targetUrl: dto.targetUrl } as unknown as Prisma.InputJsonValue } });
    return rule;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    const rule = await this.prisma.redirectRule.findUnique({ where: { id } });
    if (!rule || rule.deletedAt) throw new NotFoundException('Redirect not found.');
    const updated = await this.prisma.redirectRule.update({ where: { id }, data: dto });
    this.invalidateCache();
    await this.prisma.auditLog.create({ data: { action: 'redirect.updated', entityId: id, entityType: 'RedirectRule', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return updated;
  }

  async deleteRule(id: string, user: AuthenticatedUser) {
    await this.prisma.redirectRule.update({ where: { id }, data: { deletedAt: new Date() } });
    this.invalidateCache();
    await this.prisma.auditLog.create({ data: { action: 'redirect.deleted', entityId: id, entityType: 'RedirectRule', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'Redirect deleted.' };
  }

  // === 404 LOGS ===
  async list404(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.notFoundLog.findMany({ where, orderBy: { lastSeenAt: 'desc' }, take: 50 });
  }

  async update404Status(id: string, status: string) {
    return this.prisma.notFoundLog.update({ where: { id }, data: { status: status as any } });
  }

  async createRedirectFrom404(id: string, targetUrl: string, user: AuthenticatedUser) {
    const log = await this.prisma.notFoundLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('404 log not found.');
    const rule = await this.create({ sourcePath: log.path, targetUrl, redirectType: 'MOVED_PERMANENTLY_301' }, user);
    await this.prisma.notFoundLog.update({ where: { id }, data: { status: 'NF_REDIRECT_CREATED', suggestedTargetUrl: targetUrl } });
    return rule;
  }

  // === SUMMARY ===
  async getSummary() {
    const [active, inactive, total404, open404] = await Promise.all([
      this.prisma.redirectRule.count({ where: { status: 'REDIRECT_ACTIVE', deletedAt: null } }),
      this.prisma.redirectRule.count({ where: { status: 'REDIRECT_INACTIVE', deletedAt: null } }),
      this.prisma.notFoundLog.count(),
      this.prisma.notFoundLog.count({ where: { status: 'NF_OPEN' } }),
    ]);
    return { active, inactive, total404, open404 };
  }

  // === CACHE ===
  private async getCachedRules(): Promise<CachedRule[]> {
    if (Date.now() - this.cacheTime < this.CACHE_TTL && this.cache.length > 0) return this.cache;
    this.cache = await this.prisma.redirectRule.findMany({ where: { status: 'REDIRECT_ACTIVE', deletedAt: null }, select: { id: true, sourcePath: true, targetUrl: true, redirectType: true, matchType: true, preserveQueryString: true }, take: 500 }) as any;
    this.cacheTime = Date.now();
    return this.cache;
  }

  private invalidateCache() { this.cache = []; this.cacheTime = 0; }

  private trackHit(id: string) {
    this.prisma.redirectRule.update({ where: { id }, data: { hitCount: { increment: 1 }, lastHitAt: new Date() } }).catch(() => {});
  }

  private typeToCode(type: string): number {
    switch (type) { case 'MOVED_PERMANENTLY_301': return 301; case 'FOUND_302': return 302; case 'TEMPORARY_REDIRECT_307': return 307; case 'PERMANENT_REDIRECT_308': return 308; default: return 301; }
  }
}
