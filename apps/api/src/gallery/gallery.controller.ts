import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Gallery')
@Controller()
export class GalleryController {
  constructor(private readonly service: GalleryService) {}

  // === PUBLIC (no auth) ===

  @Get('public/galleries')
  @ApiOperation({ summary: 'List published galleries.' })
  publicList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('featured') featured?: string,
  ) {
    return this.service.getPublicGalleries({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Get('public/galleries/:slug')
  @ApiOperation({ summary: 'Get published gallery by slug with images.' })
  publicBySlug(@Param('slug') slug: string) {
    return this.service.getPublicGalleryBySlug(slug);
  }

  // === ADMIN (auth required) ===

  @Get('galleries/summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get gallery summary stats.' })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('galleries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List all galleries (admin).' })
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.list({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      search,
    });
  }

  @Get('galleries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get gallery by ID with images.' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('galleries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Create a new gallery.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @Put('galleries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Update a gallery.' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Post('galleries/:id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Publish a gallery.' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Post('galleries/:id/archive')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Archive a gallery.' })
  archive(@Param('id') id: string) {
    return this.service.archive(id);
  }

  @Delete('galleries/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete a gallery.' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // === IMAGE MANAGEMENT ===

  @Post('galleries/:id/images')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Add an image to a gallery.' })
  addImage(@Param('id') id: string, @Body() body: any) {
    return this.service.addImage(id, body);
  }

  @Post('galleries/:id/images/bulk')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Add multiple images to a gallery.' })
  addImages(@Param('id') id: string, @Body() body: { images: any[] }) {
    return this.service.addImages(id, body.images || []);
  }

  @Put('galleries/images/:imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Update an image.' })
  updateImage(@Param('imageId') imageId: string, @Body() body: any) {
    return this.service.updateImage(imageId, body);
  }

  @Delete('galleries/images/:imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Remove an image from a gallery.' })
  removeImage(@Param('imageId') imageId: string) {
    return this.service.removeImage(imageId);
  }

  @Post('galleries/:id/images/reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Reorder images in a gallery.' })
  reorderImages(@Param('id') id: string, @Body() body: { imageIds: string[] }) {
    return this.service.reorderImages(id, body.imageIds || []);
  }
}
