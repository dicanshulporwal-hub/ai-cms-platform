import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

export type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true };
}>;

const SALT_ROUNDS = 10;

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  'Super Admin': 5,
  Admin: 4,
  Editor: 3,
  Reviewer: 2,
  Publisher: 2,
  Viewer: 1,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmailWithRole(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  findByIdWithRole(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  toAuthenticatedUser(user: UserWithRole): AuthenticatedUser {
    return {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role.name,
    };
  }

  async findAll(query: ListUsersQueryDto) {
    const { page = 1, limit = 10, search, roleId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
      ...(roleId ? { roleId } : {}),
      ...(status ? { status } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        include: {
          role: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        createdAt: user.createdAt,
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      })),
      limit,
      page,
      total,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      createdAt: user.createdAt,
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt,
    };
  }

  async create(dto: CreateUserDto, currentUser: AuthenticatedUser) {
    // Check if email already exists
    const existingUser = await this.findByEmailWithRole(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    // Validate role assignment permissions
    await this.validateRoleAssignment(dto.roleId, currentUser);

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        name: dto.name.trim(),
        passwordHash,
        roleId: dto.roleId,
        status: dto.status ?? UserStatus.ACTIVE,
      },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'user.created',
        entityId: user.id,
        entityType: 'User',
        metadata: {
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          roleName: user.role.name,
          status: user.status,
        } as unknown as Prisma.InputJsonValue,
        userId: currentUser.id,
      },
    });

    return {
      createdAt: user.createdAt,
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, dto: UpdateUserDto, currentUser: AuthenticatedUser) {
    const user = await this.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Prevent self-editing of account
    if (user.id === currentUser.id) {
      throw new ForbiddenException('You cannot edit your own account.');
    }

    // Prevent Admin from editing Super Admin
    this.validateEditPermission(user, currentUser);

    // Check email uniqueness if changing
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmailWithRole(dto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use.');
      }
    }

    // Validate role assignment if changing
    if (dto.roleId) {
      await this.validateRoleAssignment(dto.roleId, currentUser);
    }

    const updatedUser = await this.prisma.user.update({
      data: {
        email: dto.email?.trim().toLowerCase(),
        name: dto.name?.trim(),
        roleId: dto.roleId,
      },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
      where: { id },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'user.updated',
        entityId: updatedUser.id,
        entityType: 'User',
        metadata: {
          changes: { email: dto.email, name: dto.name, roleId: dto.roleId },
          email: updatedUser.email,
          name: updatedUser.name,
          roleId: updatedUser.roleId,
          roleName: updatedUser.role.name,
        } as unknown as Prisma.InputJsonValue,
        userId: currentUser.id,
      },
    });

    return {
      createdAt: updatedUser.createdAt,
      email: updatedUser.email,
      id: updatedUser.id,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    currentUser: AuthenticatedUser,
  ) {
    const user = await this.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Prevent self-deactivation
    if (user.id === currentUser.id) {
      throw new ForbiddenException('You cannot change your own account status.');
    }

    // Prevent Admin from deactivating Super Admin
    this.validateEditPermission(user, currentUser);

    const updatedUser = await this.prisma.user.update({
      data: { status: dto.status },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
      where: { id },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'user.status_changed',
        entityId: updatedUser.id,
        entityType: 'User',
        metadata: {
          newStatus: dto.status,
          previousStatus: user.status,
        } as unknown as Prisma.InputJsonValue,
        userId: currentUser.id,
      },
    });

    return {
      createdAt: updatedUser.createdAt,
      email: updatedUser.email,
      id: updatedUser.id,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async remove(id: string, currentUser: AuthenticatedUser) {
    const user = await this.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Prevent self-deletion
    if (user.id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    // Prevent Admin from deleting Super Admin
    this.validateEditPermission(user, currentUser);

    // Soft delete by setting status to INACTIVE
    await this.prisma.user.update({
      data: { status: UserStatus.INACTIVE },
      where: { id },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'user.deleted',
        entityId: user.id,
        entityType: 'User',
        metadata: {
          email: user.email,
          name: user.name,
          roleName: user.role.name,
        } as unknown as Prisma.InputJsonValue,
        userId: currentUser.id,
      },
    });

    return { message: 'User deleted successfully.' };
  }

  private async validateRoleAssignment(
    roleId: string,
    currentUser: AuthenticatedUser,
  ) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    const targetRoleLevel = ROLE_HIERARCHY[role.name] ?? 0;

    // Super Admin can create anyone
    if (currentUser.role === 'Super Admin') {
      return;
    }

    // Admin can only create users with role lower than Admin
    if (currentUser.role === 'Admin') {
      if (targetRoleLevel >= ROLE_HIERARCHY['Admin']) {
        throw new ForbiddenException(
          'Admin cannot create Super Admin or Admin users.',
        );
      }
      return;
    }

    // Other roles cannot create users
    throw new ForbiddenException('You do not have permission to create users.');
  }

  private validateEditPermission(
    targetUser: UserWithRole,
    currentUser: AuthenticatedUser,
  ) {
    const currentUserRoleLevel = ROLE_HIERARCHY[currentUser.role] ?? 0;
    const targetUserRoleLevel = ROLE_HIERARCHY[targetUser.role.name] ?? 0;

    // Prevent Admin from editing Super Admin
    if (currentUser.role === 'Admin' && targetUser.role.name === 'Super Admin') {
      throw new ForbiddenException(
        'Admin cannot edit or delete Super Admin users.',
      );
    }

    // Prevent editing users with equal or higher role level
    if (targetUserRoleLevel >= currentUserRoleLevel) {
      throw new ForbiddenException(
        'You cannot edit or delete users with equal or higher privileges.',
      );
    }
  }
}
