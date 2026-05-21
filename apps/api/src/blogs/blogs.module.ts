import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  controllers: [BlogsController, CategoriesController, TagsController],
  imports: [PrismaModule],
  providers: [BlogsService, CategoriesService, TagsService],
})
export class BlogsModule {}
