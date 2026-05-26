import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: {
        createdAt: true,
        description: true,
        id: true,
        name: true,
        permissions: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      select: {
        createdAt: true,
        description: true,
        id: true,
        name: true,
        permissions: true,
        updatedAt: true,
      },
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
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

    const updatedRole = await this.prisma.role.update({
      data: { permissions: dto.permissions },
      select: {
        createdAt: true,
        description: true,
        id: true,
        name: true,
        permissions: true,
        updatedAt: true,
      },
      where: { id },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'role.permissions_updated',
        entityId: updatedRole.id,
        entityType: 'Role',
        metadata: {
          permissions: dto.permissions,
          roleName: updatedRole.name,
        },
        userId: user.id,
      },
    });

    return updatedRole;
  }
}
