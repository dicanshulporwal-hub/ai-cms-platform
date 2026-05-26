import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    example: ['pages.view', 'pages.create', 'blogs.view', 'blogs.create'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  permissions!: string[];
}
