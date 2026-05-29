import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModuleRegistryService } from './module-registry.service';

@ApiTags('Public Modules')
@Controller('public/modules')
export class PublicModulesController {
  constructor(private readonly moduleRegistry: ModuleRegistryService) {}

  @Get('enabled')
  @ApiOperation({ summary: 'Get public-enabled modules.' })
  getEnabled() { return this.moduleRegistry.getPublicEnabledModules(); }
}
