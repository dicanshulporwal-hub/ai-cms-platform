import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiBearerAuth()
@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get site settings. Requires Super Admin or Admin.' })
  @ApiOkResponse({ type: SettingsResponseDto })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update site settings. Requires Super Admin or Admin.' })
  @ApiOkResponse({ type: SettingsResponseDto })
  updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.settingsService.updateSettings(updateSettingsDto, user);
  }
}
