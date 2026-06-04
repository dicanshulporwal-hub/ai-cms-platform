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
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Events')
@Controller()
export class EventsController {
  constructor(private readonly service: EventsService) {}

  // === PUBLIC (no auth) ===

  @Get('public/events')
  @ApiOperation({ summary: 'List upcoming published events.' })
  publicList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.service.getPublicEvents({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
      upcoming: upcoming === 'false' ? false : true,
    });
  }

  @Get('public/events/:slug')
  @ApiOperation({ summary: 'Get published event by slug.' })
  publicBySlug(@Param('slug') slug: string) {
    return this.service.getPublicEventBySlug(slug);
  }

  @Post('public/events/:id/register')
  @ApiOperation({ summary: 'Register for a public event (no auth).' })
  publicRegister(@Param('id') id: string, @Body() body: any) {
    return this.service.registerForEvent(id, body);
  }

  // === ADMIN (auth required) ===

  @Get('events/summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get events summary stats.' })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('events')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List all events (admin).' })
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('eventType') eventType?: string,
    @Query('search') search?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.service.list({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      eventType,
      search,
      upcoming: upcoming === 'true',
    });
  }

  @Get('events/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get event by ID with registrations.' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('events')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Create a new event.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(body, user.id);
  }

  @Put('events/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Update an event.' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Post('events/:id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Publish an event.' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Post('events/:id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Cancel an event.' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Post('events/:id/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Mark event as completed.' })
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }

  @Delete('events/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete an event.' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get('events/:id/registrations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List registrations for an event.' })
  getRegistrations(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getRegistrations(id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
