import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsJSON, IsOptional } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiPropertyOptional({
    example: {
      blogs: ['read', 'create', 'update', 'delete'],
      pages: ['read', 'create', 'update', 'delete'],
      media: ['read', 'upload', 'delete'],
      users: ['read'],
      settings: ['read'],
    },
  })
  @IsOptional()
  @IsJSON()
  permissions?: object;
}
