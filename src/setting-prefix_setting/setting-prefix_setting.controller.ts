import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingPrefixSettingService } from './setting-prefix_setting.service';
import { SettingPrefixSetting } from './entities/setting-prefix_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setting-prefix-setting')
export class SettingPrefixSettingController {
  constructor(private readonly settingPrefixSettingService: SettingPrefixSettingService) {}

    @UseGuards(AuthGuard)
  @Post()
  create(@Body() prefix_setting_entity:SettingPrefixSetting) {
    return this.settingPrefixSettingService.create(prefix_setting_entity);
  }

    @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingPrefixSettingService.findall();
  }

 
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() SettingPrefixSettingServiceEntity:SettingPrefixSetting) {
    return this.settingPrefixSettingService.update(id,SettingPrefixSettingServiceEntity );
  }

 
}
