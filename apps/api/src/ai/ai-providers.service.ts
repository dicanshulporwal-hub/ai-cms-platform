import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class AiProvidersService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async findAll() {
    const providers = await this.prisma.aiProviderConfig.findMany({ include: { models: true }, orderBy: { providerName: 'asc' } });
    return providers.map(p => ({ ...p, apiKeyEncrypted: p.apiKeyEncrypted ? '••••••••' : null }));
  }

  async findOne(id: string) {
    const p = await this.prisma.aiProviderConfig.findUnique({ where: { id }, include: { models: true } });
    if (!p) throw new NotFoundException('Provider not found.');
    return { ...p, apiKeyEncrypted: p.apiKeyEncrypted ? '••••••••' : null };
  }

  async create(dto: { providerKey: string; providerName: string; apiKey?: string; baseUrl?: string; organizationId?: string; projectId?: string; defaultTextModel?: string; defaultVisionModel?: string; isEnabled?: boolean; isDefault?: boolean; pricingNotes?: string }, user: AuthenticatedUser) {
    const existing = await this.prisma.aiProviderConfig.findUnique({ where: { providerKey: dto.providerKey } });
    if (existing) throw new ConflictException('Provider already configured.');

    const encrypted = dto.apiKey ? this.encryptKey(dto.apiKey) : null;
    const provider = await this.prisma.aiProviderConfig.create({
      data: { providerKey: dto.providerKey, providerName: dto.providerName, apiKeyEncrypted: encrypted, baseUrl: dto.baseUrl, organizationId: dto.organizationId, projectId: dto.projectId, defaultTextModel: dto.defaultTextModel, defaultVisionModel: dto.defaultVisionModel, isEnabled: dto.isEnabled ?? false, isDefault: dto.isDefault ?? false, pricingNotes: dto.pricingNotes },
    });
    await this.prisma.auditLog.create({ data: { action: 'ai_provider.created', entityId: provider.id, entityType: 'AiProviderConfig', metadata: { providerKey: dto.providerKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { ...provider, apiKeyEncrypted: encrypted ? '••••••••' : null };
  }

  async update(id: string, dto: { providerName?: string; apiKey?: string; baseUrl?: string; organizationId?: string; projectId?: string; defaultTextModel?: string; defaultVisionModel?: string; isDefault?: boolean; pricingNotes?: string }, user: AuthenticatedUser) {
    await this.findOne(id);
    const data: any = { providerName: dto.providerName, baseUrl: dto.baseUrl, organizationId: dto.organizationId, projectId: dto.projectId, defaultTextModel: dto.defaultTextModel, defaultVisionModel: dto.defaultVisionModel, isDefault: dto.isDefault, pricingNotes: dto.pricingNotes };
    if (dto.apiKey) data.apiKeyEncrypted = this.encryptKey(dto.apiKey);
    const updated = await this.prisma.aiProviderConfig.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { action: 'ai_provider.updated', entityId: id, entityType: 'AiProviderConfig', metadata: { providerName: updated.providerName } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { ...updated, apiKeyEncrypted: updated.apiKeyEncrypted ? '••••••••' : null };
  }

  async updateStatus(id: string, isEnabled: boolean, user: AuthenticatedUser) {
    const updated = await this.prisma.aiProviderConfig.update({ where: { id }, data: { isEnabled } });
    await this.prisma.auditLog.create({ data: { action: isEnabled ? 'ai_provider.enabled' : 'ai_provider.disabled', entityId: id, entityType: 'AiProviderConfig', metadata: { providerKey: updated.providerKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { ...updated, apiKeyEncrypted: updated.apiKeyEncrypted ? '••••••••' : null };
  }

  async remove(id: string, user: AuthenticatedUser) {
    const p = await this.prisma.aiProviderConfig.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Provider not found.');
    await this.prisma.aiProviderConfig.delete({ where: { id } });
    await this.prisma.auditLog.create({ data: { action: 'ai_provider.deleted', entityId: id, entityType: 'AiProviderConfig', metadata: { providerKey: p.providerKey } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { message: 'Provider deleted.' };
  }

  async testConnection(id: string) {
    const p = await this.prisma.aiProviderConfig.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Provider not found.');
    return { providerKey: p.providerKey, status: p.isEnabled ? 'CONFIGURED' : 'DISABLED', hasApiKey: !!p.apiKeyEncrypted };
  }

  async getModels(id: string) {
    return this.prisma.aiModelConfig.findMany({ where: { providerConfigId: id }, orderBy: { modelName: 'asc' } });
  }

  async addModel(id: string, dto: { modelKey: string; modelName: string; modelType?: string; pricingType?: string; isFree?: boolean; isFreeTier?: boolean; isPaid?: boolean; maxTokens?: number; contextWindow?: number; supportsVision?: boolean; supportsJson?: boolean; isDefault?: boolean; pricingNotes?: string }, user: AuthenticatedUser) {
    const model = await this.prisma.aiModelConfig.create({
      data: { providerConfigId: id, modelKey: dto.modelKey, modelName: dto.modelName, modelType: dto.modelType ?? 'TEXT', pricingType: dto.pricingType ?? 'UNKNOWN', isFree: dto.isFree ?? false, isFreeTier: dto.isFreeTier ?? false, isPaid: dto.isPaid ?? false, maxTokens: dto.maxTokens, contextWindow: dto.contextWindow, supportsVision: dto.supportsVision ?? false, supportsJson: dto.supportsJson ?? true, isDefault: dto.isDefault ?? false, pricingNotes: dto.pricingNotes },
    });
    return model;
  }

  async updateModel(providerId: string, modelId: string, dto: any) {
    return this.prisma.aiModelConfig.update({ where: { id: modelId }, data: dto });
  }

  async updateModelStatus(modelId: string, isEnabled: boolean) {
    return this.prisma.aiModelConfig.update({ where: { id: modelId }, data: { isEnabled } });
  }

  private encryptKey(key: string): string {
    const secret = this.configService.get<string>('AI_SECRET_ENCRYPTION_KEY') ?? 'default-dev-key-change-in-prod!!';
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(secret.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
}
