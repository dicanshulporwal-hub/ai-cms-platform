import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { ChatbotService } from './chatbot.service';
import { ChatbotMessageDto } from './dto/chatbot-message.dto';
import { ChatbotResponseDto } from './dto/chatbot-response.dto';
import { ChatbotSettingsResponseDto } from './dto/chatbot-settings-response.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateChatbotSettingsDto } from './dto/update-chatbot-settings.dto';

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}

const CHATBOT_ADMIN_ROLES = ['Super Admin', 'Admin'];

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @ApiOkResponse({ type: ChatbotResponseDto })
  message(@Body() dto: ChatbotMessageDto, @Req() request: RequestLike) {
    return this.chatbotService.handleMessage(dto, this.getIdentity(request));
  }

  @Post('lead')
  @ApiCreatedResponse()
  createLead(@Body() dto: CreateLeadDto, @Req() request: RequestLike) {
    return this.chatbotService.createLead(dto, this.getIdentity(request));
  }

  @Get('public-settings')
  @ApiOkResponse()
  publicSettings() {
    return this.chatbotService.getPublicSettings();
  }

  @Get('conversations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CHATBOT_ADMIN_ROLES)
  @ApiOkResponse()
  conversations(
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.chatbotService.findConversations({ from, search, to });
  }

  @Get('conversations/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CHATBOT_ADMIN_ROLES)
  @ApiOkResponse()
  conversation(@Param('id') id: string) {
    return this.chatbotService.findConversation(id);
  }

  @Get('leads')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CHATBOT_ADMIN_ROLES)
  @ApiOkResponse()
  leads(
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.chatbotService.findLeads({ from, search, to });
  }

  @Get('settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CHATBOT_ADMIN_ROLES)
  @ApiOkResponse({ type: ChatbotSettingsResponseDto })
  settings() {
    return this.chatbotService.getSettings();
  }

  @Put('settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CHATBOT_ADMIN_ROLES)
  @ApiOkResponse({ type: ChatbotSettingsResponseDto })
  updateSettings(
    @Body() dto: UpdateChatbotSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatbotService.updateSettings(dto, user);
  }

  @Get('analytics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CHATBOT_ADMIN_ROLES)
  @ApiOkResponse()
  analytics() {
    return this.chatbotService.getAnalytics();
  }

  private getIdentity(request: RequestLike) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0];

    return {
      ip: forwardedIp?.trim() || request.ip,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    };
  }
}
