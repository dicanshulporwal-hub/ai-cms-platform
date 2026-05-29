import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULE_KEY } from './module-enabled.decorator';
import { ModuleRegistryService } from './module-registry.service';

@Injectable()
export class ModuleEnabledGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRegistry: ModuleRegistryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!moduleKey) return true;

    const isEnabled = await this.moduleRegistry.isModuleEnabled(moduleKey);
    if (!isEnabled) {
      throw new ForbiddenException(`Module "${moduleKey}" is disabled for this project.`);
    }

    return true;
  }
}
