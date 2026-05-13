import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

export type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true };
}>;

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
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };
  }
}
