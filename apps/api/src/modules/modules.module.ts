import { Global, Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { PublicModulesController } from './public-modules.controller';
import { ModuleRegistryService } from './module-registry.service';
import { ModuleEnabledGuard } from './module-enabled.guard';

@Global()
@Module({
  controllers: [ModulesController, PublicModulesController],
  providers: [ModuleRegistryService, ModuleEnabledGuard],
  exports: [ModuleRegistryService, ModuleEnabledGuard],
})
export class ModulesModule {}
