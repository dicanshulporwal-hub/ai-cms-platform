import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface TrackEventDto {
  eventType: string;
  moduleKey?: string;
  sourceType?: string;
  sourceId?: string;
  sourceTitle?: string;
  pageUrl?: string;
  referrer?: string;
  visitorId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

const ALLOWED_EVENT_TYPES = new Set([
  'PAGE_VIEW', 'BLOG_VIEW', 'DOCUMENT_VIEW', 'DOCUMENT_DOWNLOAD',
  'FAQ_VIEW', 'FORM_VIEW', 'FORM_SUBMISSION', 'SEARCH_QUERY',
  'CHATBOT_OPENED', 'CHATBOT_MESSAGE', 'AI_REQUEST', 'CUSTOM',
]);

const MAX_METADATA_SIZE = 2048;

@Injectable()
export class AnalyticsTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(dto: TrackEventDto, ip?: string, userAgent?: string): Promise<boolean> {
    // Validate event type
    if (!dto.eventType || !ALLOWED_EVENT_TYPES.has(dto.eventType)) return false;

    // Check if tracking is enabled
    const settings = await this.getSettings();
    if (!settings.trackingEnabled) return false;

    // Check specific tracking toggles
    if (dto.eventType === 'PAGE_VIEW' && !settings.trackPageViews) return false;
    if (dto.eventType === 'DOCUMENT_DOWNLOAD' && !settings.trackDownloads) return false;
    if (dto.eventType === 'SEARCH_QUERY' && !settings.trackSearches) return false;
    if ((dto.eventType === 'FORM_VIEW' || dto.eventType === 'FORM_SUBMISSION') && !settings.trackForms) return false;
    if ((dto.eventType === 'CHATBOT_OPENED' || dto.eventType === 'CHATBOT_MESSAGE') && !settings.trackChatbot) return false;
    if (dto.eventType === 'AI_REQUEST' && !settings.trackAiUsage) return false;

    // Sanitize metadata size
    let metadataJson: Prisma.InputJsonValue | undefined;
    if (dto.metadata) {
      const metaStr = JSON.stringify(dto.metadata);
      if (metaStr.length <= MAX_METADATA_SIZE) {
        metadataJson = dto.metadata as unknown as Prisma.InputJsonValue;
      }
    }

    // Hash IP if anonymization enabled
    const ipHash = ip && settings.anonymizeIp ? createHash('sha256').update(ip).digest('hex').substring(0, 16) : null;

    // Parse device type from user agent
    const deviceType = userAgent ? this.detectDeviceType(userAgent) : null;
    const browser = userAgent ? this.detectBrowser(userAgent) : null;

    await this.prisma.analyticsEvent.create({
      data: {
        eventType: dto.eventType as any,
        moduleKey: dto.moduleKey?.substring(0, 100) || null,
        sourceType: dto.sourceType as any || null,
        sourceId: dto.sourceId?.substring(0, 191) || null,
        sourceTitle: dto.sourceTitle?.substring(0, 500) || null,
        pageUrl: dto.pageUrl?.substring(0, 2048) || null,
        referrer: dto.referrer?.substring(0, 2048) || null,
        visitorId: dto.visitorId?.substring(0, 100) || null,
        sessionId: dto.sessionId?.substring(0, 100) || null,
        ipHash,
        deviceType,
        browser,
        metadataJson,
      },
    });

    return true;
  }

  private async getSettings() {
    const existing = await this.prisma.analyticsSettings.findFirst();
    if (existing) return existing;
    return this.prisma.analyticsSettings.create({ data: { id: 'default_analytics_settings' } });
  }

  private detectDeviceType(ua: string): string {
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private detectBrowser(ua: string): string {
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
    if (/edg/i.test(ua)) return 'Edge';
    return 'Other';
  }
}
