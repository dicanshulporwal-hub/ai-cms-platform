import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_SETTINGS_ID = 'default_settings';

// Critical settings that only Super Admin can modify
const CRITICAL_SETTINGS = ['maintenanceMode', 'aiEnabled', 'chatbotEnabled'] as const;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.getOrCreateSettings();
  }

  async updateSettings(dto: UpdateSettingsDto, user: AuthenticatedUser) {
    const settings = await this.getOrCreateSettings();

    // Filter critical settings for non-Super Admin users
    let filteredDto = dto;
    if (user.role !== 'Super Admin') {
      const nonCriticalUpdates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(dto)) {
        if (!CRITICAL_SETTINGS.includes(key as typeof CRITICAL_SETTINGS[number])) {
          nonCriticalUpdates[key] = value;
        }
      }
      filteredDto = nonCriticalUpdates as UpdateSettingsDto;
    }

    const updatedSettings = await this.prisma.settings.update({
      data: {
        aiEnabled: filteredDto.aiEnabled,
        chatbotEnabled: filteredDto.chatbotEnabled,
        defaultMetaDescription: filteredDto.defaultMetaDescription?.trim() || null,
        defaultMetaTitle: filteredDto.defaultMetaTitle?.trim() || null,
        maintenanceMode: filteredDto.maintenanceMode,
        siteDescription: filteredDto.siteDescription?.trim() || null,
        siteLogo: filteredDto.siteLogo?.trim() || null,
        siteName: filteredDto.siteName?.trim(),
        supportEmail: filteredDto.supportEmail?.trim().toLowerCase() || null,
      },
      where: { id: settings.id },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'settings.updated',
        entityId: updatedSettings.id,
        entityType: 'Settings',
        metadata: {
          changes: JSON.parse(JSON.stringify(filteredDto)),
          updatedBy: user.email,
        } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    });

    return updatedSettings;
  }

  private async getOrCreateSettings() {
    const existingSettings = await this.prisma.settings.findFirst();

    if (existingSettings) {
      return existingSettings;
    }

    return this.prisma.settings.create({
      data: {
        aiEnabled: true,
        chatbotEnabled: true,
        id: DEFAULT_SETTINGS_ID,
        maintenanceMode: false,
        siteDescription: 'An AI-first content management system',
        siteName: 'AI CMS',
      },
    });
  }
}
