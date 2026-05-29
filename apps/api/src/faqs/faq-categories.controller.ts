import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleEnabled } from '../modules/module-enabled.decorator';
import { FaqCategoriesService } from './faq-categories.service';

@ApiTags('FAQ Categories')
@ApiBearerAuth()
@Controller('faq-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ModuleEnabled('faq')
export class FaqCategoriesController {
  constructor(private readonly service: FaqCategoriesService) {}

  @Get() @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  findAll() { return this.service.findAll(); }

  @Post() @Roles('Super Admin', 'Admin')
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user); }

  @Put(':id') @Roles('Super Admin', 'Admin')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user); }

  @Delete(':id') @Roles('Super Admin', 'Admin')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user); }
}
