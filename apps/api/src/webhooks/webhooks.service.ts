import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: WebhookDeliveryService,
  ) {}

  async list() {
    return this.prisma.webhookEndpoint.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: 'desc' }, take: 50, select: { id: true, name: true, url: true, isEnabled: true, subscribedEventsJson: true, timeoutMs: true, maxRetries: true, updatedAt: true } });
  }

  async getById(id: string) {
    const ep = await this.prisma.webhookEndpoint.findUnique({ where: { id } });
    if (!ep || ep.deletedAt) throw new NotFoundException('Webhook not found.');
    return { ...ep, secretEncrypted: ep.secretEncrypted ? '••••••••' : null };
  }

  async create(dto: { name: string; url: string; secret?: string; subscribedEvents?: string[]; headers?: Record<string, string>; includeSensitiveData?: boolean; timeoutMs?: number; maxRetries?: number }, user: AuthenticatedUser) {
    if (!dto.name || !dto.url) throw new BadRequestException('Name and URL are required.');

    const ep = await this.prisma.webhookEndpoint.create({
      data: {
        name: dto.name, url: dto.url, secretEncrypted: dto.secret || null,
        subscribedEventsJson: dto.subscribedEvents ? (dto.subscribedEvents as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        headersJson: dto.headers ? (dto.headers as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        includeSensitiveData: dto.includeSensitiveData ?? false,
        timeoutMs: Math.min(dto.timeoutMs ?? 5000, 15000),
        maxRetries: Math.min(dto.maxRetries ?? 3, 5),
        createdById: user.id,
      },
    });

    await this.prisma.auditLog.create({ data: { action: 'webhook.created', entityId: ep.id, entityType: 'WebhookEndpoint', userId: user.id, metadata: { name: dto.name } as unknown as Prisma.InputJsonValue } });
    return ep;
  }

  async update(id: string, dto: any, user: AuthenticatedUser) {
    const ep = await this.prisma.webhookEndpoint.findUnique({ where: { id } });
    if (!ep || ep.deletedAt) throw new NotFoundException('Webhook not found.');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.secret !== undefined) data.secretEncrypted = dto.secret || null;
    if (dto.subscribedEvents !== undefined) data.subscribedEventsJson = dto.subscribedEvents as unknown as Prisma.InputJsonValue;
    if (dto.headers !== undefined) data.headersJson = dto.headers as unknown as Prisma.InputJsonValue;
    if (dto.includeSensitiveData !== undefined) data.includeSensitiveData = dto.includeSensitiveData;
    if (dto.timeoutMs !== undefined) data.timeoutMs = Math.min(dto.timeoutMs, 15000);
    if (dto.maxRetries !== undefined) data.maxRetries = Math.min(dto.maxRetries, 5);
    if (dto.isEnabled !== undefined) data.isEnabled = dto.isEnabled;

    const updated = await this.prisma.webhookEndpoint.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { action: 'webhook.updated', entityId: id, entityType: 'WebhookEndpoint', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return updated;
  }

  async deleteEndpoint(id: string, user: AuthenticatedUser) {
    await this.prisma.webhookEndpoint.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'webhook.deleted', entityId: id, entityType: 'WebhookEndpoint', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'Webhook deleted.' };
  }

  async testEndpoint(id: string, user: AuthenticatedUser) {
    const ep = await this.prisma.webhookEndpoint.findUnique({ where: { id } });
    if (!ep || ep.deletedAt) throw new NotFoundException('Webhook not found.');

    const testPayload = { eventId: 'test-' + Date.now(), eventType: 'TEST', occurredAt: new Date().toISOString(), source: 'ai-first-cms', data: { message: 'This is a test webhook delivery.' } };

    const del = await this.prisma.webhookDelivery.create({
      data: { endpointId: id, eventType: 'TEST', eventId: testPayload.eventId, payloadJson: testPayload as unknown as Prisma.InputJsonValue, status: 'WEBHOOK_PENDING' },
    });

    // Deliver async (non-blocking)
    this.delivery.deliver(del.id).catch(() => {});

    await this.prisma.auditLog.create({ data: { action: 'webhook.tested', entityId: id, entityType: 'WebhookEndpoint', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'Test webhook sent.', deliveryId: del.id };
  }

  /**
   * Publish an event to all subscribed endpoints.
   * Called from CMS modules. Non-blocking.
   */
  async publishEvent(eventType: string, data: Record<string, unknown>, eventId?: string) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({ where: { isEnabled: true, deletedAt: null } });

    for (const ep of endpoints) {
      const subscribed = (ep.subscribedEventsJson as string[]) || [];
      if (subscribed.length > 0 && !subscribed.includes(eventType)) continue;

      const payload = { eventId: eventId || `evt-${Date.now()}`, eventType, occurredAt: new Date().toISOString(), source: 'ai-first-cms', data };

      const del = await this.prisma.webhookDelivery.create({
        data: { endpointId: ep.id, eventType, eventId: payload.eventId, payloadJson: payload as unknown as Prisma.InputJsonValue, status: 'WEBHOOK_PENDING' },
      });

      // Fire and forget
      this.delivery.deliver(del.id).catch(() => {});
    }
  }

  async listDeliveries(filters?: { status?: string; eventType?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.eventType) where.eventType = filters.eventType;
    return this.prisma.webhookDelivery.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 50,
      select: { id: true, endpointId: true, eventType: true, status: true, attemptCount: true, lastStatusCode: true, lastErrorMessage: true, deliveredAt: true, createdAt: true, endpoint: { select: { name: true } } },
    });
  }

  async retryDelivery(id: string, user: AuthenticatedUser) {
    const del = await this.prisma.webhookDelivery.findUnique({ where: { id } });
    if (!del) throw new NotFoundException('Delivery not found.');
    await this.prisma.webhookDelivery.update({ where: { id }, data: { status: 'WEBHOOK_PENDING', nextRetryAt: null } });
    this.delivery.deliver(id).catch(() => {});
    return { message: 'Retry scheduled.' };
  }

  async getSummary() {
    const [total, enabled, failed, delivered] = await Promise.all([
      this.prisma.webhookEndpoint.count({ where: { deletedAt: null } }),
      this.prisma.webhookEndpoint.count({ where: { isEnabled: true, deletedAt: null } }),
      this.prisma.webhookDelivery.count({ where: { status: 'WEBHOOK_FAILED' } }),
      this.prisma.webhookDelivery.count({ where: { status: 'WEBHOOK_DELIVERED' } }),
    ]);
    return { total, enabled, failed, delivered };
  }
}
