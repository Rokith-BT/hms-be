import { Module } from '@nestjs/common';
import { SettingsNotificationSettingService } from './settings_notification_setting.service';
import { SettingsNotificationSettingController } from './settings_notification_setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsNotificationSetting } from './entities/settings_notification_setting.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({

  controllers: [SettingsNotificationSettingController],
  providers: [SettingsNotificationSettingService],
})
export class SettingsNotificationSettingModule {}
