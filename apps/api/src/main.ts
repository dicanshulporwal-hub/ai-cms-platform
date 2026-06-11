import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { resolveMediaUploadDir } from './media/media-storage';

function normalizeProcessEnv() {
  for (const key of ['DATABASE_URL']) {
    const value = process.env[key];
    if (!value) continue;
    process.env[key] = value.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
}

async function bootstrap() {
  normalizeProcessEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = Number(process.env.PORT ?? 3001);
  const uploadDir = process.env.MEDIA_UPLOAD_DIR ?? 'uploads/media';

  app.useStaticAssets(resolveMediaUploadDir(uploadDir), {
    prefix: '/uploads/media/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI CMS API')
    .setDescription('Backend API for the AI-first CMS MVP.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
}

void bootstrap();
