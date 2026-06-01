import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ContentCalendarService } from './content-calendar.service';

@ApiTags('Content Calendar')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentCalendarController {
  constructor(private readonly service: ContentCalendarService) {}

  @Get('content-calendar/summary')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Get calendar summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('content-calendar/month')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Get calendar month view.' })
  getMonth(@Query('year') year: string, @Query('month') month: string) { return this.service.getCalendarMonth(parseInt(year) || new Date().getFullYear(), parseInt(month) || new Date().getMonth() + 1); }

  @Get('content-schedules')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'List schedules.' })
  listSchedules(@Query('status') status?: string, @Query('sourceType') sourceType?: string) { return this.service.listSchedules({ status, sourceType }); }

  @Get('content-schedules/:id')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Get schedule.' })
  getSchedule(@Param('id') id: string) { return this.service.getSchedule(id); }

  @Post('content-schedules')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Create schedule.' })
  createSchedule(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createSchedule(body, user); }

  @Post('content-schedules/:id/cancel')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Cancel schedule.' })
  cancelSchedule(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.cancelSchedule(id, user); }

  @Post('content-schedules/:id/execute-now')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Execute schedule immediately.' })
  executeNow(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.executeNow(id, user); }

  @Post('publishing-queue/run-due')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run all due schedules.' })
  runDue(@CurrentUser() user: AuthenticatedUser) { return this.service.runDueSchedules(user.id); }

  @Get('content-calendar/notes')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'List editorial notes.' })
  listNotes() { return this.service.listNotes(); }

  @Post('content-calendar/notes')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Create editorial note.' })
  createNote(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createNote(body, user); }

  @Delete('content-calendar/notes/:id')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Delete editorial note.' })
  deleteNote(@Param('id') id: string) { return this.service.deleteNote(id); }
}
