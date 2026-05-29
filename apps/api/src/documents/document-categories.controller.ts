import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { DocumentCategoriesService } from './document-categories.service';

@ApiTags('Document Categories')
@ApiBearerAuth()
@Controller('document-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentCategoriesController {
  constructor(private readonly categoriesService: DocumentCategoriesService) {}

  @Get()
  @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'List document categories.' })
  findAll() { return this.categoriesService.findAll(); }

  @Post()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create document category.' })
  create(@Body() dto: { name: string; slug: string; description?: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.create(dto, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update document category.' })
  update(@Param('id') id: string, @Body() dto: { name?: string; slug?: string; description?: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete document category.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.remove(id, user);
  }
}
