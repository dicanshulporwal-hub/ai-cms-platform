import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateRoleStatusDto {
  @ApiProperty({ enum: RoleStatus, example: RoleStatus.ACTIVE })
  @IsEnum(RoleStatus)
  @IsNotEmpty()
  status!: RoleStatus;
}
