import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsSmsSettingsService } from './settings-sms-settings.service';
import { SettingsSmsSetting } from './entities/settings-sms-setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-sms-settings')
export class SettingsSmsSettingsController {
  constructor(private readonly settingsSmsSettingsService: SettingsSmsSettingsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() SettingsSmsSettingEntity:SettingsSmsSetting) {
    console.log("controller",SettingsSmsSettingEntity);
    
    return this.settingsSmsSettingsService.create(SettingsSmsSettingEntity);
  }


@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsSmsSettingsService.find_one(+id);
  }

}
