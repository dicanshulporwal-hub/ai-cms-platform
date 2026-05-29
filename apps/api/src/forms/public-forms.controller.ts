import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { FormSubmissionsService } from './form-submissions.service';

@ApiTags('Public Forms')
@Controller('public/forms')
export class PublicFormsController {
  constructor(private readonly prisma: PrismaService, private readonly submissionsService: FormSubmissionsService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get published form by slug.' })
  async getForm(@Param('slug') slug: string) {
    const form = await this.prisma.form.findUnique({ where: { slug }, include: { fields: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } } });
    if (!form || form.deletedAt || form.status !== 'PUBLISHED' || !form.isPublic) return { error: 'Form not found.', statusCode: 404 };
    return { id: form.id, title: form.title, description: form.description, formType: form.formType, successMessage: form.successMessage, submitButtonLabel: form.submitButtonLabel, fields: form.fields.map(f => ({ fieldKey: f.fieldKey, label: f.label, placeholder: f.placeholder, helpText: f.helpText, fieldType: f.fieldType, isRequired: f.isRequired, optionsJson: f.optionsJson, validationJson: f.validationJson })) };
  }

  @Post(':slug/submit')
  @ApiOperation({ summary: 'Submit a public form.' })
  async submit(@Param('slug') slug: string, @Body() body: Record<string, unknown>, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip;
    const userAgent = req.headers['user-agent'];
    const sourcePage = req.headers['referer'];
    return this.submissionsService.submitPublic(slug, body, ip, userAgent, sourcePage);
  }
}
