import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles as AllowedRoles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleResponseDto, PermissionGroupDto } from './dto/role-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @AllowedRoles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List all roles.' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @AllowedRoles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get all available permission groups.' })
  @ApiOkResponse({ type: PermissionGroupDto, isArray: true })
  getPermissions() {
    return this.rolesService.getPermissionGroups();
  }

  @Get(':id')
  @AllowedRoles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get role by ID.' })
  @ApiOkResponse({ type: RoleResponseDto })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @AllowedRoles('Super Admin')
  @ApiOperation({ summary: 'Create a new role. Super Admin only.' })
  @ApiCreatedResponse({ type: RoleResponseDto })
  create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.create(createRoleDto, user);
  }

  @Put(':id')
  @AllowedRoles('Super Admin')
  @ApiOperation({ summary: 'Update role details. Super Admin only.' })
  @ApiOkResponse({ type: RoleResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  @Patch(':id/permissions')
  @AllowedRoles('Super Admin')
  @ApiOperation({ summary: 'Update role permissions. Super Admin only.' })
  @ApiOkResponse({ type: RoleResponseDto })
  updatePermissions(
    @Param('id') id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.updatePermissions(id, updateRolePermissionsDto, user);
  }

  @Patch(':id/status')
  @AllowedRoles('Super Admin')
  @ApiOperation({ summary: 'Activate or deactivate a role. Super Admin only.' })
  @ApiOkResponse({ type: RoleResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() updateRoleStatusDto: UpdateRoleStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.updateStatus(id, updateRoleStatusDto, user);
  }

  @Delete(':id')
  @AllowedRoles('Super Admin')
  @ApiOperation({ summary: 'Delete a non-system role. Super Admin only.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.remove(id, user);
  }
}
