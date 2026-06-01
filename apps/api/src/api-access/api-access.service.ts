import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class ApiAccessService {
  constructor(private readonly prisma: PrismaService) {}

  // === API CLIENTS ===
  async listClients() {
    return this.prisma.apiClient.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, clientKey: true, maskedKey: true, status: true, scopesJson: true, rateLimitPerMinute: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' }, take: 50,
    });
  }

  async getClient(id: string) {
    const client = await this.prisma.apiClient.findUnique({ where: { id } });
    if (!client || client.deletedAt) throw new NotFoundException('API client not found.');
    return { ...client, keyHash: undefined }; // Never expose hash
  }

  async createClient(dto: { name: string; description?: string; scopes?: string[]; rateLimitPerMinute?: number; rateLimitPerDay?: number }, user: AuthenticatedUser) {
    if (!dto.name) throw new BadRequestException('Name is required.');

    // Generate secure API key
    const rawKey = `cms_live_${randomBytes(24).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12);
    const maskedKey = `${keyPrefix}...${rawKey.slice(-4)}`;
    const clientKey = `client_${randomBytes(8).toString('hex')}`;

    const client = await this.prisma.apiClient.create({
      data: {
        name: dto.name, description: dto.description, clientKey, keyHash, keyPrefix, maskedKey,
        scopesJson: dto.scopes ? (dto.scopes as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        rateLimitPerMinute: dto.rateLimitPerMinute ?? 60,
        rateLimitPerDay: dto.rateLimitPerDay ?? 10000,
        createdById: user.id,
      },
    });

    await this.prisma.auditLog.create({ data: { action: 'api_client.created', entityId: client.id, entityType: 'ApiClient', userId: user.id, metadata: { name: dto.name } as unknown as Prisma.InputJsonValue } });

    // Return full key ONLY on creation
    return { ...client, keyHash: undefined, apiKey: rawKey, warning: 'Copy this key now. It will not be shown again.' };
  }

  async updateClient(id: string, dto: any, user: AuthenticatedUser) {
    const client = await this.getClient(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.scopes !== undefined) data.scopesJson = dto.scopes as unknown as Prisma.InputJsonValue;
    if (dto.rateLimitPerMinute !== undefined) data.rateLimitPerMinute = dto.rateLimitPerMinute;
    if (dto.rateLimitPerDay !== undefined) data.rateLimitPerDay = dto.rateLimitPerDay;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.apiClient.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { action: 'api_client.updated', entityId: id, entityType: 'ApiClient', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { ...updated, keyHash: undefined };
  }

  async revokeClient(id: string, user: AuthenticatedUser) {
    await this.prisma.apiClient.update({ where: { id }, data: { status: 'API_REVOKED' } });
    await this.prisma.auditLog.create({ data: { action: 'api_client.revoked', entityId: id, entityType: 'ApiClient', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'API client revoked.' };
  }

  async deleteClient(id: string, user: AuthenticatedUser) {
    await this.prisma.apiClient.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'api_client.deleted', entityId: id, entityType: 'ApiClient', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'API client deleted.' };
  }

  // === VALIDATE API KEY (for content delivery) ===
  async validateApiKey(rawKey: string): Promise<{ valid: boolean; clientId?: string; scopes?: string[] }> {
    if (!rawKey) return { valid: false };
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const client = await this.prisma.apiClient.findFirst({ where: { keyHash, status: 'API_ACTIVE', deletedAt: null } });
    if (!client) return { valid: false };
    if (client.expiresAt && client.expiresAt < new Date()) return { valid: false };

    // Update lastUsedAt (non-blocking)
    this.prisma.apiClient.update({ where: { id: client.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

    return { valid: true, clientId: client.id, scopes: (client.scopesJson as string[]) || [] };
  }

  // === LOGS ===
  async listLogs(clientId?: string) {
    const where: any = {};
    if (clientId) where.apiClientId = clientId;
    return this.prisma.apiAccessLog.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 50,
      select: { id: true, endpoint: true, method: true, statusCode: true, responseTimeMs: true, keyPrefix: true, createdAt: true },
    });
  }

  async logAccess(clientId: string | null, keyPrefix: string | null, endpoint: string, method: string, statusCode: number, responseTimeMs: number, errorMessage?: string) {
    await this.prisma.apiAccessLog.create({ data: { apiClientId: clientId, keyPrefix, endpoint, method, statusCode, responseTimeMs, errorMessage } });
  }

  // === SUMMARY ===
  async getSummary() {
    const [total, active, revoked, logsToday] = await Promise.all([
      this.prisma.apiClient.count({ where: { deletedAt: null } }),
      this.prisma.apiClient.count({ where: { status: 'API_ACTIVE', deletedAt: null } }),
      this.prisma.apiClient.count({ where: { status: 'API_REVOKED', deletedAt: null } }),
      this.prisma.apiAccessLog.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    ]);
    return { total, active, revoked, logsToday };
  }

  getAvailableScopes() {
    return [
      { key: 'pages.read', name: 'Read Pages', module: 'pages' },
      { key: 'blogs.read', name: 'Read Blogs', module: 'blogs' },
      { key: 'documents.read', name: 'Read Documents', module: 'documents' },
      { key: 'faqs.read', name: 'Read FAQs', module: 'faqs' },
      { key: 'forms.read', name: 'Read Forms', module: 'forms' },
      { key: 'media.read', name: 'Read Media', module: 'media' },
      { key: 'search.read', name: 'Search Content', module: 'search' },
    ];
  }
}
