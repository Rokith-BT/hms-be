import { Module } from '@nestjs/common';
import { SettingsFrontCmsSettingService } from './settings-front_cms_setting.service';
import { SettingsFrontCmsSettingController } from './settings-front_cms_setting.controller';

@Module({
  controllers: [SettingsFrontCmsSettingController],
  providers: [SettingsFrontCmsSettingService],
})
export class SettingsFrontCmsSettingModule {}
