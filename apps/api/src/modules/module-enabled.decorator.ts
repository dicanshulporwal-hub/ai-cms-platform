import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY = 'module_key';
export const ModuleEnabled = (moduleKey: string) => SetMetadata(MODULE_KEY, moduleKey);
