import { Module } from '@nestjs/common';
import { SettingsSystemNotificationSettingService } from './settings-system_notification_setting.service';
import { SettingsSystemNotificationSettingController } from './settings-system_notification_setting.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsSystemNotificationSetting } from './entities/settings-system_notification_setting.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingsSystemNotificationSetting])],

  controllers: [SettingsSystemNotificationSettingController],
  providers: [SettingsSystemNotificationSettingService],
})
export class SettingsSystemNotificationSettingModule {}
