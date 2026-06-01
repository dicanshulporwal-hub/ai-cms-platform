import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { SchemaGeneratorService } from './schema-generator.service';

@ApiTags('Structured Data')
@Controller()
export class SchemaController {
  constructor(
    private readonly generator: SchemaGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  // === PUBLIC ENDPOINTS ===

  @Get('public/structured-data/global')
  @ApiOperation({ summary: 'Get global structured data (public).' })
  async getGlobalSchema() {
    return this.generator.generateGlobalSchema();
  }

  @Get('public/structured-data/:sourceType/:sourceId')
  @ApiOperation({ summary: 'Get structured data for a content item (public).' })
  async getPublicSchema(@Param('sourceType') sourceType: string, @Param('sourceId') sourceId: string) {
    return this.generator.getPublicSchemaForSource(sourceType.toUpperCase(), sourceId);
  }

  // === ADMIN: SETTINGS ===

  @Get('structured-data/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get structured data settings.' })
  async getSettings() {
    return this.generator.getOrCreateSettings();
  }

  @Put('structured-data/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update structured data settings.' })
  async updateSettings(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const settings = await this.generator.getOrCreateSettings();
    const updated = await this.prisma.structuredDataSettings.update({ where: { id: settings.id }, data: body });
    await this.prisma.auditLog.create({ data: { action: 'schema.settings_updated', entityId: settings.id, entityType: 'StructuredDataSettings', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return updated;
  }

  // === ADMIN: ENTRIES ===

  @Get('structured-data/entries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List structured data entries.' })
  async listEntries() {
    return this.prisma.structuredDataEntry.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: 'desc' }, take: 100 });
  }

  @Get('structured-data/entries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get structured data entry.' })
  async getEntry(@Param('id') id: string) {
    return this.prisma.structuredDataEntry.findUnique({ where: { id } });
  }

  @Post('structured-data/entries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create structured data entry.' })
  async createEntry(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const entry = await this.prisma.structuredDataEntry.create({ data: { ...body, schemaJson: body.schemaJson as unknown as Prisma.InputJsonValue, createdById: user.id } });
    await this.prisma.auditLog.create({ data: { action: 'schema.entry_created', entityId: entry.id, entityType: 'StructuredDataEntry', userId: user.id, metadata: { schemaType: body.schemaType } as unknown as Prisma.InputJsonValue } });
    return entry;
  }

  @Put('structured-data/entries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update structured data entry.' })
  async updateEntry(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const data: any = { ...body, updatedById: user.id };
    if (body.schemaJson) data.schemaJson = body.schemaJson as unknown as Prisma.InputJsonValue;
    const entry = await this.prisma.structuredDataEntry.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { action: 'schema.entry_updated', entityId: id, entityType: 'StructuredDataEntry', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return entry;
  }

  @Post('structured-data/entries/:id/activate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Activate structured data entry.' })
  async activateEntry(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const entry = await this.prisma.structuredDataEntry.update({ where: { id }, data: { status: 'ACTIVE' } });
    await this.prisma.auditLog.create({ data: { action: 'schema.entry_activated', entityId: id, entityType: 'StructuredDataEntry', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return entry;
  }

  @Post('structured-data/entries/:id/validate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Validate structured data entry.' })
  async validateEntry(@Param('id') id: string) {
    const entry = await this.prisma.structuredDataEntry.findUnique({ where: { id } });
    if (!entry) return { status: 'INVALID', errors: ['Entry not found.'], warnings: [] };
    const result = this.generator.validateSchema(entry.schemaJson);
    await this.prisma.structuredDataEntry.update({ where: { id }, data: { validatedAt: new Date(), validationJson: result as unknown as Prisma.InputJsonValue } });
    return result;
  }

  @Delete('structured-data/entries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete structured data entry.' })
  async deleteEntry(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.prisma.structuredDataEntry.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { action: 'schema.entry_deleted', entityId: id, entityType: 'StructuredDataEntry', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return { message: 'Entry deleted.' };
  }

  // === GENERATION ===

  @Post('structured-data/generate/:sourceType/:sourceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Generate structured data for content.' })
  async generateSchema(@Param('sourceType') sourceType: string, @Param('sourceId') sourceId: string, @CurrentUser() user: AuthenticatedUser) {
    const schemas = await this.generator.getPublicSchemaForSource(sourceType.toUpperCase(), sourceId);
    if (schemas.length === 0) return { message: 'No schema generated. Content may not be published.' };

    // Save as draft entry
    const schemaJson = schemas[0];
    const schemaType = (schemaJson as any)['@type'] || 'CUSTOM';
    const entry = await this.prisma.structuredDataEntry.create({
      data: {
        sourceType: sourceType.toUpperCase() as any,
        sourceId,
        schemaType: this.mapSchemaType(schemaType),
        schemaJson: schemaJson as unknown as Prisma.InputJsonValue,
        status: 'DRAFT',
        isAutoGenerated: true,
        createdById: user.id,
      },
    });
    await this.prisma.auditLog.create({ data: { action: 'schema.generated', entityId: entry.id, entityType: 'StructuredDataEntry', userId: user.id, metadata: { sourceType, sourceId } as unknown as Prisma.InputJsonValue } });
    return entry;
  }

  @Post('structured-data/validate-json')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Validate JSON-LD schema.' })
  async validateJson(@Body() body: { schemaJson: any }) {
    return this.generator.validateSchema(body.schemaJson);
  }

  private mapSchemaType(type: string): any {
    const map: Record<string, string> = {
      WebSite: 'WEBSITE', Organization: 'ORGANIZATION', GovernmentOrganization: 'GOVERNMENT_ORGANIZATION',
      WebPage: 'WEB_PAGE', Article: 'ARTICLE', BlogPosting: 'BLOG_POSTING',
      FAQPage: 'FAQ_PAGE', BreadcrumbList: 'BREADCRUMB_LIST', DigitalDocument: 'DIGITAL_DOCUMENT',
      SearchAction: 'SEARCH_ACTION', ContactPage: 'CONTACT_PAGE', Event: 'EVENT',
    };
    return map[type] || 'CUSTOM';
  }
}
