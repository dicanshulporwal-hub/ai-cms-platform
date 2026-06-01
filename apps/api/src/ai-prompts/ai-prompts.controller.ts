import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiPromptsService } from './ai-prompts.service';
import { AiPromptRenderingService } from './ai-prompt-rendering.service';

@ApiTags('AI Prompts')
@ApiBearerAuth()
@Controller('ai-prompts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiPromptsController {
  constructor(
    private readonly service: AiPromptsService,
    private readonly rendering: AiPromptRenderingService,
  ) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List AI prompt templates.' })
  list(@Query('taskType') taskType?: string, @Query('moduleKey') moduleKey?: string, @Query('status') status?: string) {
    return this.service.list({ taskType, moduleKey, status });
  }

  @Get('governance')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get prompt governance summary.' })
  governance() { return this.service.getGovernanceSummary(); }

  @Post('seed')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Seed default system prompts.' })
  seed(@CurrentUser() user: AuthenticatedUser) { return this.service.seedDefaultPrompts(user); }

  @Get('runtime/:promptKey')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get rendered active prompt by key.' })
  getRuntime(@Param('promptKey') promptKey: string) { return this.rendering.getActiveVersion(promptKey); }

  @Post('render')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Render a prompt with variables.' })
  render(@Body() body: { promptKey: string; variables: Record<string, string> }) {
    return this.rendering.renderPrompt(body.promptKey, body.variables);
  }

  @Get(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get prompt template with versions.' })
  getById(@Param('id') id: string) { return this.service.getById(id); }

  @Post()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create AI prompt template.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user); }

  @Post(':id/versions')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create new prompt version.' })
  createVersion(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createVersion(id, body, user);
  }

  @Post(':id/versions/:versionId/activate')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Activate a prompt version.' })
  activate(@Param('id') id: string, @Param('versionId') versionId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.activateVersion(id, versionId, user);
  }

  @Post(':id/versions/:versionId/rollback')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Rollback to a previous version.' })
  rollback(@Param('id') id: string, @Param('versionId') versionId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.rollback(id, versionId, user);
  }

  @Post(':id/submit-approval')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Submit prompt for approval.' })
  submitApproval(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.submitForApproval(id, user);
  }

  @Post(':id/approve')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Approve a prompt.' })
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approve(id, user);
  }

  @Post(':id/reject')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Reject a prompt.' })
  reject(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.service.reject(id, body.reason, user);
  }

  @Post(':id/test')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Test a prompt with AI provider.' })
  testPrompt(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    return this.service.testPrompt(id, body, user);
  }

  @Get(':id/test-runs')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get test runs for a prompt.' })
  getTestRuns(@Param('id') id: string) {
    return this.service.getTestRuns(id);
  }

  @Post(':id/safety-check')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run safety check on a prompt version.' })
  safetyCheck(@Param('id') id: string) {
    return this.service.runSafetyCheck(id);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete prompt template (soft).' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deletePrompt(id, user); }
}
