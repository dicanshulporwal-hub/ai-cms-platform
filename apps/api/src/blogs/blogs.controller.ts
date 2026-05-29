import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ModuleEnabled } from '../modules/module-enabled.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BlogResponseDto } from './dto/blog-response.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ListBlogsQueryDto } from './dto/list-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsService } from './blogs.service';

const BLOG_READ_ROLES = [
  'Super Admin',
  'Admin',
  'Editor',
  'Reviewer',
  'Publisher',
  'Viewer',
];

@ApiBearerAuth()
@ApiTags('Blogs')
@Controller('blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ModuleEnabled('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @Roles(...BLOG_READ_ROLES)
  @ApiOkResponse({ type: BlogResponseDto, isArray: true })
  findAll(@Query() query: ListBlogsQueryDto) {
    return this.blogsService.findAll(query);
  }

  @Get(':id')
  @Roles(...BLOG_READ_ROLES)
  @ApiOkResponse({ type: BlogResponseDto })
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Post()
  @Roles('Super Admin', 'Editor')
  @ApiCreatedResponse({ type: BlogResponseDto })
  create(
    @Body() createBlogDto: CreateBlogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.blogsService.create(createBlogDto, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Editor')
  @ApiOkResponse({ type: BlogResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.blogsService.update(id, updateBlogDto, user);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOkResponse({ type: BlogResponseDto })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.blogsService.remove(id, user);
  }

  @Post(':id/submit')
  @Roles('Super Admin', 'Editor')
  @ApiOkResponse({ type: BlogResponseDto })
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.blogsService.submit(id, user);
  }

  @Post(':id/approve')
  @Roles('Super Admin', 'Reviewer')
  @ApiOkResponse({ type: BlogResponseDto })
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.blogsService.approve(id, user);
  }

  @Post(':id/publish')
  @Roles('Super Admin', 'Publisher')
  @ApiOkResponse({ type: BlogResponseDto })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.blogsService.publish(id, user);
  }
}
