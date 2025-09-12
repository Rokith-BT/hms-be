import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsCaptchaSettingsService } from './settings-captcha_settings.service';
import { SettingsCaptchaSetting } from './entities/settings-captcha_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-captcha-settings')
export class SettingsCaptchaSettingsController {
  constructor(private readonly settingsCaptchaSettingsService: SettingsCaptchaSettingsService) {}

@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingsCaptchaSettingsService.findall();
  }


@UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body()  SettingsCaptchaSettingEntity:SettingsCaptchaSetting) {
    return this.settingsCaptchaSettingsService.update(id,SettingsCaptchaSettingEntity );
  }

}
