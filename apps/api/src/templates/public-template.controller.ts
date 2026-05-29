import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TemplateLayoutService } from './template-layout.service';
import { TemplateModuleRegistryService } from './template-module-registry.service';

@ApiTags('Public Template')
@Controller('public/template')
export class PublicTemplateController {
  constructor(
    private readonly layoutService: TemplateLayoutService,
    private readonly registryService: TemplateModuleRegistryService,
  ) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active template for public portal.' })
  getActive() {
    return this.layoutService.getPublicRenderData();
  }

  @Get('render-data')
  @ApiOperation({ summary: 'Get full render data for public portal.' })
  getRenderData() {
    return this.layoutService.getPublicRenderData();
  }

  @Get('modules')
  @ApiOperation({ summary: 'Get active public modules.' })
  getPublicModules() {
    return this.registryService.findActivePublic();
  }
}
