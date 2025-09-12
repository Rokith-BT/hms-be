import { Module } from '@nestjs/common';
import { SettingsCaptchaSettingsService } from './settings-captcha_settings.service';
import { SettingsCaptchaSettingsController } from './settings-captcha_settings.controller';

@Module({
  controllers: [SettingsCaptchaSettingsController],
  providers: [SettingsCaptchaSettingsService],
})
export class SettingsCaptchaSettingsModule {}
