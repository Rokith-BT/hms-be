import { Module } from '@nestjs/common';
import { SettingsModuleService } from './settings_module.service';
import { SettingsModuleController } from './settings_module.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [SettingsModuleController],
  providers: [SettingsModuleService,DynamicDatabaseService],
})
export class SettingsModuleModule {}
