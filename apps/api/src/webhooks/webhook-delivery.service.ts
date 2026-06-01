import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Deliver a webhook. Non-blocking — catches all errors.
   * Never blocks the original CMS action.
   */
  async deliver(deliveryId: string): Promise<void> {
    const delivery = await this.prisma.webhookDelivery.findUnique({ where: { id: deliveryId }, include: { endpoint: true } });
    if (!delivery || !delivery.endpoint) return;

    const endpoint = delivery.endpoint;
    const payload = JSON.stringify(delivery.payloadJson);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build headers
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-CMS-Timestamp': timestamp, 'X-CMS-Event': delivery.eventType };

    // Sign payload if secret exists
    if (endpoint.secretEncrypted) {
      const signature = createHmac('sha256', endpoint.secretEncrypted).update(`${timestamp}.${payload}`).digest('hex');
      headers['X-CMS-Signature'] = signature;
    }

    // Add custom headers
    if (endpoint.headersJson) {
      const custom = endpoint.headersJson as Record<string, string>;
      for (const [k, v] of Object.entries(custom)) { headers[k] = v; }
    }

    try {
      await this.prisma.webhookDelivery.update({ where: { id: deliveryId }, data: { status: 'WEBHOOK_PROCESSING', attemptCount: { increment: 1 } } });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), endpoint.timeoutMs || 5000);

      const response = await fetch(endpoint.url, { method: 'POST', headers, body: payload, signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        await this.prisma.webhookDelivery.update({ where: { id: deliveryId }, data: { status: 'WEBHOOK_DELIVERED', lastStatusCode: response.status, deliveredAt: new Date() } });
      } else {
        const shouldRetry = response.status >= 500 || response.status === 429;
        const currentAttempt = (delivery.attemptCount || 0) + 1;
        const canRetry = shouldRetry && currentAttempt < endpoint.maxRetries;

        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: canRetry ? 'WEBHOOK_RETRY_SCHEDULED' : 'WEBHOOK_FAILED',
            lastStatusCode: response.status,
            lastErrorMessage: `HTTP ${response.status}`,
            nextRetryAt: canRetry ? new Date(Date.now() + currentAttempt * 30000) : null,
          },
        });
      }
    } catch (err: any) {
      const currentAttempt = (delivery.attemptCount || 0) + 1;
      const canRetry = currentAttempt < endpoint.maxRetries;
      const errorMsg = err?.name === 'AbortError' ? 'Timeout' : (err?.message || 'Unknown error');

      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: canRetry ? 'WEBHOOK_RETRY_SCHEDULED' : 'WEBHOOK_FAILED',
          lastErrorMessage: errorMsg.substring(0, 500),
          nextRetryAt: canRetry ? new Date(Date.now() + currentAttempt * 30000) : null,
        },
      });
    }
  }
}
