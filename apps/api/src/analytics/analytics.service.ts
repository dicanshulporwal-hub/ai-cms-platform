import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalEvents, pageViews, blogViews, docDownloads, searchQueries, formSubmissions, chatbotMessages, aiRequests, uniqueVisitors] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'PAGE_VIEW', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'BLOG_VIEW', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'DOCUMENT_DOWNLOAD', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'SEARCH_QUERY', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'FORM_SUBMISSION', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'CHATBOT_MESSAGE', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'AI_REQUEST', createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.groupBy({ by: ['visitorId'], where: { createdAt: { gte: since }, visitorId: { not: null } } }).then(r => r.length),
    ]);

    return { totalEvents, pageViews, blogViews, docDownloads, searchQueries, formSubmissions, chatbotMessages, aiRequests, uniqueVisitors, days };
  }

  async getTopContent(days = 30, take = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const topPages = await this.prisma.analyticsEvent.groupBy({
      by: ['sourceId', 'sourceTitle'],
      where: { eventType: 'PAGE_VIEW', createdAt: { gte: since }, sourceId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take,
    });

    const topBlogs = await this.prisma.analyticsEvent.groupBy({
      by: ['sourceId', 'sourceTitle'],
      where: { eventType: 'BLOG_VIEW', createdAt: { gte: since }, sourceId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take,
    });

    const topDownloads = await this.prisma.analyticsEvent.groupBy({
      by: ['sourceId', 'sourceTitle'],
      where: { eventType: 'DOCUMENT_DOWNLOAD', createdAt: { gte: since }, sourceId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take,
    });

    return { topPages: topPages.map(p => ({ id: p.sourceId, title: p.sourceTitle, views: p._count.id })), topBlogs: topBlogs.map(b => ({ id: b.sourceId, title: b.sourceTitle, views: b._count.id })), topDownloads: topDownloads.map(d => ({ id: d.sourceId, title: d.sourceTitle, downloads: d._count.id })) };
  }

  async getSearchAnalytics(days = 30, take = 20) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await this.prisma.analyticsEvent.findMany({
      where: { eventType: 'SEARCH_QUERY', createdAt: { gte: since } },
      select: { sourceTitle: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Aggregate top queries
    const queryCounts: Record<string, number> = {};
    for (const e of events) {
      const q = e.sourceTitle || 'unknown';
      queryCounts[q] = (queryCounts[q] || 0) + 1;
    }

    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, take)
      .map(([query, count]) => ({ query, count }));

    return { totalSearches: events.length, topQueries, days };
  }

  async getDeviceBreakdown(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const devices = await this.prisma.analyticsEvent.groupBy({
      by: ['deviceType'],
      where: { createdAt: { gte: since }, deviceType: { not: null } },
      _count: { id: true },
    });

    return devices.map(d => ({ device: d.deviceType, count: d._count.id }));
  }

  async getSettings() {
    const existing = await this.prisma.analyticsSettings.findFirst();
    if (existing) return existing;
    return this.prisma.analyticsSettings.create({ data: { id: 'default_analytics_settings' } });
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    return this.prisma.analyticsSettings.update({ where: { id: settings.id }, data });
  }

  async getRecentEvents(take = 50) {
    return this.prisma.analyticsEvent.findMany({
      select: { id: true, eventType: true, sourceType: true, sourceTitle: true, pageUrl: true, deviceType: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
