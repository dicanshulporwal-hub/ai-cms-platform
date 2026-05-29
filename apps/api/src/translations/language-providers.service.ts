import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createCipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BhashiniProvider } from './providers/bhashini.provider';

@Injectable()
export class LanguageProvidersService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService, private readonly bhashiniProvider: BhashiniProvider) {}

  async findAll() {
    const providers = await this.prisma.languageProviderConfig.findMany({ orderBy: { providerName: 'asc' } });
    return providers.map(p => ({ ...p, apiKeyEncrypted: p.apiKeyEncrypted ? '••••••••' : null }));
  }

  async getBhashiniConfig() {
    let config = await this.prisma.languageProviderConfig.findUnique({ where: { providerKey: 'BHASHINI' } });
    if (!config) {
      // Return env-based config info
      return { providerKey: 'BHASHINI', providerName: 'Bhashini', isEnabled: this.bhashiniProvider.isConfigured(), isDefault: false, hasApiKey: this.bhashiniProvider.isConfigured(), capabilities: this.bhashiniProvider.getCapabilities(), pricingType: this.configService.get('BHASHINI_PRICING_TYPE') ?? 'UNKNOWN', configSource: 'environment' };
    }
    return { ...config, apiKeyEncrypted: config.apiKeyEncrypted ? '••••••••' : null };
  }

  async updateBhashiniConfig(dto: { apiKey?: string; baseUrl?: string; userId?: string; pipelineId?: string; defaultSourceLanguage?: string; defaultTargetLanguage?: string; isEnabled?: boolean; isDefault?: boolean; pricingType?: string }, user: AuthenticatedUser) {
    const data: any = { providerName: 'Bhashini', baseUrl: dto.baseUrl, userId: dto.userId, pipelineId: dto.pipelineId, defaultSourceLanguage: dto.defaultSourceLanguage, defaultTargetLanguage: dto.defaultTargetLanguage, isEnabled: dto.isEnabled, isDefault: dto.isDefault, pricingType: dto.pricingType };
    if (dto.apiKey) data.apiKeyEncrypted = this.encryptKey(dto.apiKey);

    const config = await this.prisma.languageProviderConfig.upsert({
      where: { providerKey: 'BHASHINI' },
      update: data,
      create: { providerKey: 'BHASHINI', ...data },
    });

    await this.prisma.auditLog.create({ data: { action: 'bhashini.config_updated', entityId: config.id, entityType: 'LanguageProviderConfig', metadata: { isEnabled: config.isEnabled } as unknown as Prisma.InputJsonValue, userId: user.id } });
    return { ...config, apiKeyEncrypted: config.apiKeyEncrypted ? '••••••••' : null };
  }

  async testBhashiniConnection() {
    if (!this.bhashiniProvider.isConfigured()) {
      return { success: false, message: 'Bhashini API key not configured.' };
    }
    try {
      const result = await this.bhashiniProvider.translate({ text: 'Hello', sourceLanguage: 'en', targetLanguage: 'hi' });
      return { success: true, message: 'Connection successful.', translatedSample: result.translatedText };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Connection failed.' };
    }
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
