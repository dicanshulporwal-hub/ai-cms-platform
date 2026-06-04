import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // === ADMIN ===

  async getSummary() {
    const [total, published, upcoming, registrations] = await Promise.all([
      this.prisma.event.count({ where: { deletedAt: null } }),
      this.prisma.event.count({ where: { status: 'EVENT_PUBLISHED', deletedAt: null } }),
      this.prisma.event.count({ where: { status: 'EVENT_PUBLISHED', startDate: { gte: new Date() }, deletedAt: null } }),
      this.prisma.eventRegistration.count(),
    ]);
    return { total, published, upcoming, registrations };
  }

  async list(query: { page?: number; limit?: number; status?: string; eventType?: string; search?: string; upcoming?: boolean }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.eventType) where.eventType = query.eventType;
    if (query.upcoming) where.startDate = { gte: new Date() };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { summary: { contains: query.search } },
        { venueName: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          eventType: true,
          status: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          isAllDay: true,
          venueName: true,
          isOnline: true,
          isFeatured: true,
          isRegistrationOpen: true,
          maxAttendees: true,
          featuredImageUrl: true,
          publishedAt: true,
          createdAt: true,
          _count: { select: { registrations: true } },
        },
        orderBy: [{ startDate: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: {
        registrations: { orderBy: { registeredAt: 'desc' }, take: 50 },
      },
    });
    if (!event) throw new NotFoundException('Event not found.');
    return event;
  }

  async create(dto: {
    title: string;
    slug: string;
    description?: string;
    summary?: string;
    eventType?: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    venueName?: string;
    venueAddress?: string;
    venueCity?: string;
    venueState?: string;
    isOnline?: boolean;
    onlineLink?: string;
    onlinePlatform?: string;
    organizerName?: string;
    organizerEmail?: string;
    organizerPhone?: string;
    departmentName?: string;
    featuredImageUrl?: string;
    attachmentUrl?: string;
    maxAttendees?: number;
    isFeatured?: boolean;
    isRegistrationOpen?: boolean;
    registrationDeadline?: string;
    metaTitle?: string;
    metaDescription?: string;
  }, userId: string) {
    if (!dto.title || !dto.slug || !dto.startDate) {
      throw new BadRequestException('Title, slug, and startDate are required.');
    }

    const existing = await this.prisma.event.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('An event with this slug already exists.');

    return this.prisma.event.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        summary: dto.summary,
        eventType: (dto.eventType as any) || 'OTHER_EVENT',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isAllDay: dto.isAllDay ?? false,
        venueName: dto.venueName,
        venueAddress: dto.venueAddress,
        venueCity: dto.venueCity,
        venueState: dto.venueState,
        isOnline: dto.isOnline ?? false,
        onlineLink: dto.onlineLink,
        onlinePlatform: dto.onlinePlatform,
        organizerName: dto.organizerName,
        organizerEmail: dto.organizerEmail,
        organizerPhone: dto.organizerPhone,
        departmentName: dto.departmentName,
        featuredImageUrl: dto.featuredImageUrl,
        attachmentUrl: dto.attachmentUrl,
        maxAttendees: dto.maxAttendees,
        isFeatured: dto.isFeatured ?? false,
        isRegistrationOpen: dto.isRegistrationOpen ?? false,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: Record<string, any>) {
    const event = await this.prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found.');

    if (dto.slug && dto.slug !== event.slug) {
      const dup = await this.prisma.event.findUnique({ where: { slug: dto.slug } });
      if (dup) throw new BadRequestException('Slug already in use.');
    }

    const data: any = { ...dto };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.registrationDeadline) data.registrationDeadline = new Date(data.registrationDeadline);

    return this.prisma.event.update({ where: { id }, data });
  }

  async publish(id: string) {
    const event = await this.prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found.');
    return this.prisma.event.update({
      where: { id },
      data: { status: 'EVENT_PUBLISHED', publishedAt: new Date() },
    });
  }

  async cancel(id: string) {
    const event = await this.prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found.');
    return this.prisma.event.update({
      where: { id },
      data: { status: 'EVENT_CANCELLED' },
    });
  }

  async complete(id: string) {
    const event = await this.prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found.');
    return this.prisma.event.update({
      where: { id },
      data: { status: 'EVENT_COMPLETED' },
    });
  }

  async delete(id: string) {
    const event = await this.prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found.');
    return this.prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // === REGISTRATIONS ===

  async getRegistrations(eventId: string, query: { page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where: { eventId },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.eventRegistration.count({ where: { eventId } }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // === PUBLIC ===

  async getPublicEvents(query: { page?: number; limit?: number; type?: string; upcoming?: boolean }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = { status: 'EVENT_PUBLISHED', deletedAt: null };
    if (query.type) where.eventType = query.type;
    if (query.upcoming !== false) where.startDate = { gte: new Date() };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          eventType: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          isAllDay: true,
          venueName: true,
          venueCity: true,
          isOnline: true,
          isFeatured: true,
          isRegistrationOpen: true,
          featuredImageUrl: true,
          maxAttendees: true,
          _count: { select: { registrations: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { startDate: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPublicEventBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, status: 'EVENT_PUBLISHED', deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        summary: true,
        eventType: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        isAllDay: true,
        venueName: true,
        venueAddress: true,
        venueCity: true,
        venueState: true,
        isOnline: true,
        onlineLink: true,
        onlinePlatform: true,
        organizerName: true,
        organizerEmail: true,
        organizerPhone: true,
        departmentName: true,
        featuredImageUrl: true,
        attachmentUrl: true,
        maxAttendees: true,
        isFeatured: true,
        isRegistrationOpen: true,
        registrationDeadline: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        _count: { select: { registrations: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found.');
    return event;
  }

  async registerForEvent(eventId: string, dto: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    designation?: string;
    message?: string;
  }) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, status: 'EVENT_PUBLISHED', deletedAt: null },
      select: { id: true, isRegistrationOpen: true, maxAttendees: true, registrationDeadline: true, _count: { select: { registrations: true } } },
    });

    if (!event) throw new NotFoundException('Event not found.');
    if (!event.isRegistrationOpen) throw new BadRequestException('Registration is closed for this event.');
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new BadRequestException('Registration deadline has passed.');
    }
    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      throw new BadRequestException('Event is at full capacity.');
    }

    if (!dto.name || !dto.email) throw new BadRequestException('Name and email are required.');

    // Check duplicate registration
    const existing = await this.prisma.eventRegistration.findFirst({
      where: { eventId, email: dto.email },
    });
    if (existing) throw new BadRequestException('You have already registered for this event.');

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        organization: dto.organization,
        designation: dto.designation,
        message: dto.message,
      },
    });
  }
}
