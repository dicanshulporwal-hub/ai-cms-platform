import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ModulesController } from './modules.controller';
import { PublicModulesController } from './public-modules.controller';
import { ModuleRegistryService } from './module-registry.service';
import { ModuleEnabledGuard } from './module-enabled.guard';

@Global()
@Module({
  controllers: [ModulesController, PublicModulesController],
  providers: [
    ModuleRegistryService,
    ModuleEnabledGuard,
    { provide: APP_GUARD, useClass: ModuleEnabledGuard },
  ],
  exports: [ModuleRegistryService, ModuleEnabledGuard],
})
export class ModulesModule {}
