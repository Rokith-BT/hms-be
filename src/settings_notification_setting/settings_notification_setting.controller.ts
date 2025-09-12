import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsNotificationSettingService } from './settings_notification_setting.service';
import { SettingsNotificationSetting } from './entities/settings_notification_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-notification-setting')
export class SettingsNotificationSettingController {
  constructor(private readonly settingsNotificationSettingService: SettingsNotificationSettingService) {}


@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingsNotificationSettingService.findAll();
  }

 @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() SettingsNotificationSettingEntity: SettingsNotificationSetting) {
    return this.settingsNotificationSettingService.update(id, SettingsNotificationSettingEntity);
  }

  
}
