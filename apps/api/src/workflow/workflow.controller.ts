import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WorkflowActionDto } from './dto/workflow-action.dto';
import { WorkflowHistoryResponseDto } from './dto/workflow-history-response.dto';
import { WorkflowService } from './workflow.service';

const WORKFLOW_READ_ROLES = [
  'Super Admin',
  'Admin',
  'Editor',
  'Reviewer',
  'Publisher',
  'Viewer',
];

@ApiBearerAuth()
@ApiTags('Workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('history/:contentType/:contentId')
  @Roles(...WORKFLOW_READ_ROLES)
  @ApiOkResponse({ type: WorkflowHistoryResponseDto, isArray: true })
  history(
    @Param('contentType') contentType: 'PAGE' | 'BLOG',
    @Param('contentId') contentId: string,
  ) {
    return this.workflowService.history(contentType, contentId);
  }

  @Post('pages/:id/submit')
  @Roles('Super Admin', 'Editor')
  submitPage(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.submitPage(id, user, dto);
  }

  @Post('pages/:id/start-review')
  @Roles('Super Admin', 'Reviewer')
  startPageReview(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.startPageReview(id, user, dto);
  }

  @Post('pages/:id/request-changes')
  @Roles('Super Admin', 'Reviewer')
  requestPageChanges(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.requestPageChanges(id, user, dto);
  }

  @Post('pages/:id/approve')
  @Roles('Super Admin', 'Reviewer')
  approvePage(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.approvePage(id, user, dto);
  }

  @Post('pages/:id/publish')
  @Roles('Super Admin', 'Publisher')
  publishPage(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.publishPage(id, user, dto);
  }

  @Post('blogs/:id/submit')
  @Roles('Super Admin', 'Editor')
  submitBlog(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.submitBlog(id, user, dto);
  }

  @Post('blogs/:id/start-review')
  @Roles('Super Admin', 'Reviewer')
  startBlogReview(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.startBlogReview(id, user, dto);
  }

  @Post('blogs/:id/request-changes')
  @Roles('Super Admin', 'Reviewer')
  requestBlogChanges(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.requestBlogChanges(id, user, dto);
  }

  @Post('blogs/:id/approve')
  @Roles('Super Admin', 'Reviewer')
  approveBlog(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.approveBlog(id, user, dto);
  }

  @Post('blogs/:id/publish')
  @Roles('Super Admin', 'Publisher')
  publishBlog(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workflowService.publishBlog(id, user, dto);
  }
}
