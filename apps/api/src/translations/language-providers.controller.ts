import { Body, Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { LanguageProvidersService } from './language-providers.service';

@ApiTags('Language Providers')
@ApiBearerAuth()
@Controller('language-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LanguageProvidersController {
  constructor(private readonly service: LanguageProvidersService) {}

  @Get() @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List language providers.' })
  findAll() { return this.service.findAll(); }

  @Get('bhashini') @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get Bhashini config.' })
  getBhashini() { return this.service.getBhashiniConfig(); }

  @Put('bhashini') @Roles('Super Admin')
  @ApiOperation({ summary: 'Update Bhashini config.' })
  updateBhashini(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateBhashiniConfig(dto, user); }

  @Post('bhashini/test-connection') @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Test Bhashini connection.' })
  testBhashini() { return this.service.testBhashiniConnection(); }
}
