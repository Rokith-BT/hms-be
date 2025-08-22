import { Module } from '@nestjs/common';
import { SettingsSmsSettingsService } from './settings-sms-settings.service';
import { SettingsSmsSettingsController } from './settings-sms-settings.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [SettingsSmsSettingsController],
  providers: [SettingsSmsSettingsService,DynamicDatabaseService]
})
export class SettingsSmsSettingsModule {}
