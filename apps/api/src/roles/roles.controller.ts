import {
  Body,
  Controller,
  Get,
  Param,
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
import { Roles as AllowedRoles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @AllowedRoles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List roles. Requires Super Admin or Admin.' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @AllowedRoles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get role by ID. Requires Super Admin or Admin.' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id/permissions')
  @AllowedRoles('Super Admin')
  @ApiOperation({
    summary: 'Update role permissions. Requires Super Admin only.',
  })
  updatePermissions(
    @Param('id') id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.updatePermissions(id, updateRolePermissionsDto, user);
  }
}
