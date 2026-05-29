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
import { CreatePageDto } from './dto/create-page.dto';
import { ListPagesQueryDto } from './dto/list-pages-query.dto';
import { PageResponseDto } from './dto/page-response.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

const PAGE_READ_ROLES = [
  'Super Admin',
  'Admin',
  'Editor',
  'Reviewer',
  'Publisher',
  'Viewer',
];

@ApiBearerAuth()
@ApiTags('Pages')
@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ModuleEnabled('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @Roles(...PAGE_READ_ROLES)
  @ApiOkResponse({ type: PageResponseDto, isArray: true })
  findAll(@Query() query: ListPagesQueryDto) {
    return this.pagesService.findAll(query);
  }

  @Get(':id')
  @Roles(...PAGE_READ_ROLES)
  @ApiOkResponse({ type: PageResponseDto })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Post()
  @Roles('Super Admin', 'Editor')
  @ApiCreatedResponse({ type: PageResponseDto })
  create(
    @Body() createPageDto: CreatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pagesService.create(createPageDto, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Editor')
  @ApiOkResponse({ type: PageResponseDto })
  update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pagesService.update(id, updatePageDto, user);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOkResponse({ type: PageResponseDto })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pagesService.remove(id, user);
  }

  @Post(':id/submit')
  @Roles('Super Admin', 'Editor')
  @ApiOkResponse({ type: PageResponseDto })
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pagesService.submit(id, user);
  }

  @Post(':id/approve')
  @Roles('Super Admin', 'Reviewer')
  @ApiOkResponse({ type: PageResponseDto })
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pagesService.approve(id, user);
  }

  @Post(':id/publish')
  @Roles('Super Admin', 'Publisher')
  @ApiOkResponse({ type: PageResponseDto })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pagesService.publish(id, user);
  }
}
