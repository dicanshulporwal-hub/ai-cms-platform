import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiProvidersService } from './ai-providers.service';
import { AiRouterService } from './ai-router.service';

@ApiTags('AI Providers')
@ApiBearerAuth()
@Controller('ai-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiProvidersController {
  constructor(
    private readonly providersService: AiProvidersService,
    private readonly routerService: AiRouterService,
  ) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List AI provider configs.' })
  findAll() { return this.providersService.findAll(); }

  @Get(':id')
  @Roles('Super Admin', 'Admin')
  findOne(@Param('id') id: string) { return this.providersService.findOne(id); }

  @Post()
  @Roles('Super Admin')
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.providersService.create(dto, user); }

  @Put(':id')
  @Roles('Super Admin')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.providersService.update(id, dto, user); }

  @Patch(':id/status')
  @Roles('Super Admin')
  updateStatus(@Param('id') id: string, @Body() body: { isEnabled: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.providersService.updateStatus(id, body.isEnabled, user); }

  @Delete(':id')
  @Roles('Super Admin')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.providersService.remove(id, user); }

  @Post(':id/test-connection')
  @Roles('Super Admin', 'Admin')
  testConnection(@Param('id') id: string) { return this.providersService.testConnection(id); }

  @Get(':id/models')
  @Roles('Super Admin', 'Admin')
  getModels(@Param('id') id: string) { return this.providersService.getModels(id); }

  @Post(':id/models')
  @Roles('Super Admin')
  addModel(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.providersService.addModel(id, dto, user); }

  @Put(':id/models/:modelId')
  @Roles('Super Admin')
  updateModel(@Param('id') id: string, @Param('modelId') modelId: string, @Body() dto: any) { return this.providersService.updateModel(id, modelId, dto); }

  @Patch(':id/models/:modelId/status')
  @Roles('Super Admin')
  updateModelStatus(@Param('id') id: string, @Param('modelId') modelId: string, @Body() body: { isEnabled: boolean }) { return this.providersService.updateModelStatus(modelId, body.isEnabled); }
}
