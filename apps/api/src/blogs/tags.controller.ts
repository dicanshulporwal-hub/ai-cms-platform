import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';
import { UpdateTagDto } from './dto/update-tag.dto';

const TAXONOMY_READ_ROLES = [
  'Super Admin',
  'Admin',
  'Editor',
  'Reviewer',
  'Publisher',
  'Viewer',
];

@ApiBearerAuth()
@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Roles(...TAXONOMY_READ_ROLES)
  findAll() {
    return this.tagsService.findAll();
  }

  @Post()
  @Roles('Super Admin', 'Admin', 'Editor')
  create(
    @Body() createTagDto: CreateTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tagsService.create(createTagDto, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin', 'Editor')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tagsService.update(id, updateTagDto, user);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tagsService.remove(id, user);
  }
}
