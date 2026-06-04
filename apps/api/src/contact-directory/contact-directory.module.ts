import { Module } from '@nestjs/common';
import { ContactDirectoryController } from './contact-directory.controller';
import { ContactDirectoryService } from './contact-directory.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactDirectoryController],
  providers: [ContactDirectoryService],
  exports: [ContactDirectoryService],
})
export class ContactDirectoryModule {}
