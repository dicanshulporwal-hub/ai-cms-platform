import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class ContentCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // === SCHEDULES ===
  async listSchedules(filters?: { status?: string; sourceType?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.sourceType) where.sourceType = filters.sourceType;
    return this.prisma.contentSchedule.findMany({ where, orderBy: { scheduledAt: 'asc' }, take: 50 });
  }

  async getSchedule(id: string) {
    const s = await this.prisma.contentSchedule.findUnique({ where: { id } });
    if (!s || s.deletedAt) throw new NotFoundException('Schedule not found.');
    return s;
  }

  async createSchedule(dto: { sourceType: string; sourceId: string; title: string; moduleKey?: string; actionType?: string; scheduledAt: string; timezone?: string }, user: AuthenticatedUser) {
    if (!dto.sourceType || !dto.sourceId || !dto.scheduledAt) throw new BadRequestException('Source type, source ID, and scheduled date are required.');
    const scheduledDate = new Date(dto.scheduledAt);
    if (scheduledDate <= new Date()) throw new BadRequestException('Scheduled date must be in the future.');

    // Check no duplicate active schedule
    const existing = await this.prisma.contentSchedule.findFirst({ where: { sourceType: dto.sourceType, sourceId: dto.sourceId, status: 'SCHEDULED', deletedAt: null } });
    if (existing) throw new BadRequestException('Content already has an active schedule.');

    const schedule = await this.prisma.contentSchedule.create({
      data: { sourceType: dto.sourceType, sourceId: dto.sourceId, title: dto.title, moduleKey: dto.moduleKey, actionType: (dto.actionType || 'SCHEDULE_PUBLISH') as any, scheduledAt: scheduledDate, timezone: dto.timezone || 'UTC', createdById: user.id },
    });
    await this.audit('schedule.created', schedule.id, user.id, { sourceType: dto.sourceType, scheduledAt: dto.scheduledAt });
    return schedule;
  }

  async cancelSchedule(id: string, user: AuthenticatedUser) {
    const s = await this.getSchedule(id);
    if (s.status !== 'SCHEDULED') throw new BadRequestException('Only scheduled items can be cancelled.');
    await this.prisma.contentSchedule.update({ where: { id }, data: { status: 'SCHEDULE_CANCELLED', cancelledAt: new Date() } });
    await this.audit('schedule.cancelled', id, user.id, {});
    return { message: 'Schedule cancelled.' };
  }

  async executeNow(id: string, user: AuthenticatedUser) {
    const s = await this.getSchedule(id);
    return this.executeSchedule(s, user.id);
  }

  // === RUN DUE SCHEDULES ===
  async runDueSchedules(userId: string) {
    const due = await this.prisma.contentSchedule.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() }, deletedAt: null }, take: 20 });
    const results: { id: string; status: string; message: string }[] = [];

    for (const schedule of due) {
      try {
        await this.executeSchedule(schedule, userId);
        results.push({ id: schedule.id, status: 'SUCCESS', message: `Published: ${schedule.title}` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed';
        await this.prisma.contentSchedule.update({ where: { id: schedule.id }, data: { status: 'SCHEDULE_FAILED', failureReason: msg } });
        results.push({ id: schedule.id, status: 'FAILED', message: msg });
      }
    }
    return { executed: results.filter(r => r.status === 'SUCCESS').length, failed: results.filter(r => r.status === 'FAILED').length, results };
  }

  private async executeSchedule(schedule: any, userId: string) {
    if (schedule.actionType === 'SCHEDULE_PUBLISH') {
      if (schedule.sourceType === 'PAGE') {
        const page = await this.prisma.page.findUnique({ where: { id: schedule.sourceId } });
        if (!page || page.deletedAt) throw new Error('Page not found or deleted.');
        if (page.status === 'PUBLISHED') throw new Error('Page already published.');
        await this.prisma.page.update({ where: { id: schedule.sourceId }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
      } else if (schedule.sourceType === 'BLOG') {
        const blog = await this.prisma.blogPost.findUnique({ where: { id: schedule.sourceId } });
        if (!blog || blog.deletedAt) throw new Error('Blog not found or deleted.');
        if (blog.status === 'PUBLISHED') throw new Error('Blog already published.');
        await this.prisma.blogPost.update({ where: { id: schedule.sourceId }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
      } else {
        throw new Error(`Unsupported source type: ${schedule.sourceType}`);
      }
    } else if (schedule.actionType === 'SCHEDULE_ARCHIVE') {
      if (schedule.sourceType === 'PAGE') {
        await this.prisma.page.update({ where: { id: schedule.sourceId }, data: { status: 'ARCHIVED' } });
      } else if (schedule.sourceType === 'BLOG') {
        await this.prisma.blogPost.update({ where: { id: schedule.sourceId }, data: { status: 'ARCHIVED' } });
      }
    }

    await this.prisma.contentSchedule.update({ where: { id: schedule.id }, data: { status: 'SCHEDULE_EXECUTED', executedAt: new Date() } });
    await this.audit('schedule.executed', schedule.id, userId, { sourceType: schedule.sourceType, actionType: schedule.actionType });
  }

  // === CALENDAR VIEW ===
  async getCalendarMonth(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const [schedules, notes] = await Promise.all([
      this.prisma.contentSchedule.findMany({ where: { scheduledAt: { gte: start, lte: end }, deletedAt: null }, select: { id: true, title: true, sourceType: true, actionType: true, status: true, scheduledAt: true }, orderBy: { scheduledAt: 'asc' }, take: 100 }),
      this.prisma.editorialCalendarNote.findMany({ where: { noteDate: { gte: start, lte: end }, deletedAt: null }, select: { id: true, title: true, noteDate: true, noteType: true }, orderBy: { noteDate: 'asc' }, take: 50 }),
    ]);
    return { year, month, schedules, notes };
  }

  // === NOTES ===
  async listNotes() { return this.prisma.editorialCalendarNote.findMany({ where: { deletedAt: null }, orderBy: { noteDate: 'desc' }, take: 50 }); }
  async createNote(dto: { title: string; noteDate: string; noteType?: string; description?: string; moduleKey?: string }, user: AuthenticatedUser) {
    return this.prisma.editorialCalendarNote.create({ data: { title: dto.title, noteDate: new Date(dto.noteDate), noteType: dto.noteType || 'CONTENT_PLAN', description: dto.description, moduleKey: dto.moduleKey, createdById: user.id } });
  }
  async deleteNote(id: string) { await this.prisma.editorialCalendarNote.update({ where: { id }, data: { deletedAt: new Date() } }); return { message: 'Note deleted.' }; }

  // === SUMMARY ===
  async getSummary() {
    const [scheduled, executed, failed, upcoming] = await Promise.all([
      this.prisma.contentSchedule.count({ where: { status: 'SCHEDULED', deletedAt: null } }),
      this.prisma.contentSchedule.count({ where: { status: 'SCHEDULE_EXECUTED', deletedAt: null } }),
      this.prisma.contentSchedule.count({ where: { status: 'SCHEDULE_FAILED', deletedAt: null } }),
      this.prisma.contentSchedule.count({ where: { status: 'SCHEDULED', scheduledAt: { gte: new Date() }, deletedAt: null } }),
    ]);
    return { scheduled, executed, failed, upcoming };
  }

  private async audit(action: string, entityId: string, userId: string, metadata: any) {
    await this.prisma.auditLog.create({ data: { action, entityId, entityType: 'ContentSchedule', userId, metadata: metadata as unknown as Prisma.InputJsonValue } });
  }
}
