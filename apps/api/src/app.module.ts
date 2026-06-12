import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessibilityModule } from './accessibility/accessibility.module';
import { AiModule } from './ai/ai.module';
import { AiPromptsModule } from './ai-prompts/ai-prompts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ApiAccessModule } from './api-access/api-access.module';
import { BrokenLinksModule } from './broken-links/broken-links.module';
import { BackupModule } from './backup/backup.module';
import { SchemaModule } from './schema/schema.module';
import { SitemapModule } from './sitemap/sitemap.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ContentCalendarModule } from './content-calendar/content-calendar.module';
import { ContentImporterModule } from './content-importer/content-importer.module';
import { ContactDirectoryModule } from './contact-directory/contact-directory.module';
import { validateEnvironment } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { DeploymentModule } from './deployment/deployment.module';
import { DocumentsModule } from './documents/documents.module';
import { EventsModule } from './events/events.module';
import { FormsModule } from './forms/forms.module';
import { FaqsModule } from './faqs/faqs.module';
import { GalleryModule } from './gallery/gallery.module';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { ModulesModule } from './modules/modules.module';
import { NavigationModule } from './navigation/navigation.module';
import { NewsroomModule } from './newsroom/newsroom.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedirectsModule } from './redirects/redirects.module';
import { RolesModule } from './roles/roles.module';
import { RtiModule } from './rti/rti.module';
import { SchemeServicesModule } from './scheme-services/scheme-services.module';
import { SettingsModule } from './settings/settings.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { TemplatesModule } from './templates/templates.module';
import { TendersModule } from './tenders/tenders.module';
import { TranslationsModule } from './translations/translations.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AiModule,
    AiPromptsModule,
    AccessibilityModule,
    AnalyticsModule,
    AnnouncementsModule,
    ApiAccessModule,
    AuthModule,
    BackupModule,
    BlogsModule,
    BrokenLinksModule,
    ChatbotModule,
    ContentCalendarModule,
    ContentImporterModule,
    ContactDirectoryModule,
    DashboardModule,
    DeploymentModule,
    DocumentsModule,
    EventsModule,
    FormsModule,
    FaqsModule,
    GalleryModule,
    HealthModule,
    MediaModule,
    ModulesModule,
    NavigationModule,
    NewsroomModule,
    NotificationsModule,
    PagesModule,
    PrismaModule,
    RedirectsModule,
    RolesModule,
    RtiModule,
    SchemeServicesModule,
    SchemaModule,
    SettingsModule,
    SocialMediaModule,
    SitemapModule,
    TemplatesModule,
    TendersModule,
    TranslationsModule,
    UsersModule,
    WebhooksModule,
    WorkflowModule,
  ],
})
export class AppModule {}
