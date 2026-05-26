import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from './permissions.constants';

const SYSTEM_ROLE_NAMES = [
  'Super Admin',
  'Admin',
  'Editor',
  'Reviewer',
  'Publisher',
  'Viewer',
];

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true } },
      },
    });

    return roles.map((role) => ({
      createdAt: role.createdAt,
      description: role.description,
      id: role.id,
      isSystemRole: role.isSystemRole,
      name: role.name,
      permissions: role.permissions,
      status: role.status,
      updatedAt: role.updatedAt,
      userCount: role._count.users,
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return {
      createdAt: role.createdAt,
      description: role.description,
      id: role.id,
      isSystemRole: role.isSystemRole,
      name: role.name,
      permissions: role.permissions,
      status: role.status,
      updatedAt: role.updatedAt,
      userCount: role._count.users,
    };
  }

  async create(dto: CreateRoleDto, user: AuthenticatedUser) {
    // Check for duplicate name
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name.trim() },
    });
    if (existing) {
      throw new ConflictException('A role with this name already exists.');
    }

    // Validate permissions if provided
    if (dto.permissions?.length) {
      this.validatePermissionKeys(dto.permissions);
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        permissions: dto.permissions ?? [],
        isSystemRole: false,
        status: UserStatus.ACTIVE,
      },
      include: {
        _count: { select: { users: true } },
      },
    });

    await this.createAuditLog('role.created', role.id, user.id, {
      name: role.name,
      permissions: dto.permissions ?? [],
    });

    return {
      createdAt: role.createdAt,
      description: role.description,
      id: role.id,
      isSystemRole: role.isSystemRole,
      name: role.name,
      permissions: role.permissions,
      status: role.status,
      updatedAt: role.updatedAt,
      userCount: role._count.users,
    };
  }

  async update(id: string, dto: UpdateRoleDto, user: AuthenticatedUser) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    // Prevent renaming system roles
    if (role.isSystemRole && dto.name && dto.name.trim() !== role.name) {
      throw new ForbiddenException('System role names cannot be changed.');
    }

    // Check for duplicate name if changing
    if (dto.name && dto.name.trim() !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: dto.name.trim() },
      });
      if (existing) {
        throw new ConflictException('A role with this name already exists.');
      }
    }

    const updatedRole = await this.prisma.role.update({
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: { select: { users: true } },
      },
      where: { id },
    });

    await this.createAuditLog('role.updated', updatedRole.id, user.id, {
      changes: { name: dto.name, description: dto.description },
      roleName: updatedRole.name,
    });

    return {
      createdAt: updatedRole.createdAt,
      description: updatedRole.description,
      id: updatedRole.id,
      isSystemRole: updatedRole.isSystemRole,
      name: updatedRole.name,
      permissions: updatedRole.permissions,
      status: updatedRole.status,
      updatedAt: updatedRole.updatedAt,
      userCount: updatedRole._count.users,
    };
  }

  async updatePermissions(
    id: string,
    dto: UpdateRolePermissionsDto,
    user: AuthenticatedUser,
  ) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    // Prevent reducing Super Admin permissions
    if (role.name === 'Super Admin') {
      throw new ForbiddenException(
        'Super Admin role permissions cannot be modified.',
      );
    }

    // Prevent user from modifying their own role permissions
    const currentUserRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { roleId: true },
    });
    if (currentUserRole?.roleId === id) {
      throw new ForbiddenException(
        'You cannot modify permissions of your own role.',
      );
    }

    // Validate permission keys
    this.validatePermissionKeys(dto.permissions);

    const updatedRole = await this.prisma.role.update({
      data: { permissions: dto.permissions },
      include: {
        _count: { select: { users: true } },
      },
      where: { id },
    });

    await this.createAuditLog('role.permissions_updated', updatedRole.id, user.id, {
      permissions: dto.permissions,
      roleName: updatedRole.name,
    });

    return {
      createdAt: updatedRole.createdAt,
      description: updatedRole.description,
      id: updatedRole.id,
      isSystemRole: updatedRole.isSystemRole,
      name: updatedRole.name,
      permissions: updatedRole.permissions,
      status: updatedRole.status,
      updatedAt: updatedRole.updatedAt,
      userCount: updatedRole._count.users,
    };
  }

  async updateStatus(id: string, dto: UpdateRoleStatusDto, user: AuthenticatedUser) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    // Prevent deactivating Super Admin role
    if (role.name === 'Super Admin') {
      throw new ForbiddenException('Super Admin role cannot be deactivated.');
    }

    const updatedRole = await this.prisma.role.update({
      data: { status: dto.status as UserStatus },
      include: {
        _count: { select: { users: true } },
      },
      where: { id },
    });

    const action =
      dto.status === 'ACTIVE' ? 'role.activated' : 'role.deactivated';
    await this.createAuditLog(action, updatedRole.id, user.id, {
      roleName: updatedRole.name,
      status: dto.status,
    });

    return {
      createdAt: updatedRole.createdAt,
      description: updatedRole.description,
      id: updatedRole.id,
      isSystemRole: updatedRole.isSystemRole,
      name: updatedRole.name,
      permissions: updatedRole.permissions,
      status: updatedRole.status,
      updatedAt: updatedRole.updatedAt,
      userCount: updatedRole._count.users,
    };
  }

  async remove(id: string, user: AuthenticatedUser) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    // Prevent deleting system roles
    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be deleted.');
    }

    // Prevent deleting roles with active users
    if (role._count.users > 0) {
      throw new ForbiddenException(
        'Cannot delete a role that is assigned to users. Reassign users first.',
      );
    }

    await this.prisma.role.delete({ where: { id } });

    await this.createAuditLog('role.deleted', id, user.id, {
      roleName: role.name,
    });

    return { message: 'Role deleted successfully.' };
  }

  getPermissionGroups() {
    return Object.entries(PERMISSION_GROUPS).map(([key, group]) => ({
      key,
      label: group.label,
      permissions: [...group.permissions],
    }));
  }

  private validatePermissionKeys(permissions: string[]) {
    const invalid = permissions.filter((p) => !ALL_PERMISSIONS.includes(p));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid permission keys: ${invalid.join(', ')}`,
      );
    }
  }

  private async createAuditLog(
    action: string,
    entityId: string,
    userId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType: 'Role',
        metadata: metadata as unknown as Prisma.InputJsonValue,
        userId,
      },
    });
  }
}
