import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsFrontCmsSettingService } from './settings-front_cms_setting.service';
import { SettingsFrontCmsSetting } from './entities/settings-front_cms_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-front-cms-setting')
export class SettingsFrontCmsSettingController {
  constructor(private readonly settingsFrontCmsSettingService: SettingsFrontCmsSettingService) {}

  
  @UseGuards(AuthGuard)

  @Get()
  findAll() {
    return this.settingsFrontCmsSettingService.findall();
  }

 
  @UseGuards(AuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body() SettingsFrontCmsSettingEntity:SettingsFrontCmsSetting) {
    return this.settingsFrontCmsSettingService.update(id,SettingsFrontCmsSettingEntity );
  }

 
}
