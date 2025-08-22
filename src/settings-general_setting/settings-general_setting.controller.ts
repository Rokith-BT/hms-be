import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SettingsGeneralSettingService } from './settings-general_setting.service';
import { SettingsGeneralSetting } from './entities/settings-general_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-general-setting')
export class SettingsGeneralSettingController {
  constructor(private readonly settingsGeneralSettingService: SettingsGeneralSettingService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() general_settingEntity:SettingsGeneralSetting) {
    return this.settingsGeneralSettingService.create(general_settingEntity);
  }

 @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingsGeneralSettingService.findall();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.settingsGeneralSettingService.getHospitalDetails(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() general_settingEntity:SettingsGeneralSetting) {
    return this.settingsGeneralSettingService.update(id,general_settingEntity );
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteSetting/:id')
  async remove(@Param('id') id: number, @Query('hospital_id') hospital_id:number) {
    console.log("controller",hospital_id);
    
    return this.settingsGeneralSettingService.remove(id,hospital_id);
  }

  @UseGuards(AuthGuard)
 @Patch('/logo/:id')
 updates(@Param('id') id: string, @Body() general_settingEntity:SettingsGeneralSetting) {
  console.log("controller");
  
  return this.settingsGeneralSettingService.updates(id,general_settingEntity );
}
}
