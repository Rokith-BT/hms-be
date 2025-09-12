import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsEmailSettingsService } from './settings-email-settings.service';
import { SettingsEmailSetting } from './entities/settings-email-setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-email-settings')
export class SettingsEmailSettingsController {
  constructor(private readonly settingsEmailSettingsService: SettingsEmailSettingsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() SettingsEmailSettingEntity: SettingsEmailSetting) {
    return this.settingsEmailSettingsService.create(SettingsEmailSettingEntity);
  }


}