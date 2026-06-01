import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchemaController } from './schema.controller';
import { SchemaGeneratorService } from './schema-generator.service';

@Module({
  imports: [ConfigModule],
  controllers: [SchemaController],
  providers: [SchemaGeneratorService],
  exports: [SchemaGeneratorService],
})
export class SchemaModule {}
