import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsSystemNotificationSettingService } from './settings-system_notification_setting.service';
import { SettingsSystemNotificationSetting } from './entities/settings-system_notification_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-system-notification-setting')
export class SettingsSystemNotificationSettingController {
  constructor(private readonly settingsSystemNotificationSettingService: SettingsSystemNotificationSettingService) {}

 
@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingsSystemNotificationSettingService.findAll();
  }


@UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() SettingsSystemNotificationSettingEntity:SettingsSystemNotificationSetting) {
    return this.settingsSystemNotificationSettingService.update(id, SettingsSystemNotificationSettingEntity);
  }

}
