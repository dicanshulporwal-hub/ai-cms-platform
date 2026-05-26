import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    if (!request.user) {
      throw new UnauthorizedException('Unauthorized access.');
    }

    // Super Admin bypasses all permission checks
    if (request.user.role === 'Super Admin') {
      return true;
    }

    // Fetch user's role permissions from database
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { role: { select: { permissions: true } } },
    });

    if (!userWithRole?.role?.permissions) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    const rolePermissions = userWithRole.role.permissions as string[];

    const hasPermission = requiredPermissions.every((permission) =>
      rolePermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    return true;
  }
}
