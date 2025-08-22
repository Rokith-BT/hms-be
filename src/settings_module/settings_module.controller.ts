import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsModuleService } from './settings_module.service';
import { SettingsModule } from './entities/settings_module.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('settings_module')
export class SettingsModuleController {
  constructor(private readonly settingsModuleService: SettingsModuleService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createSettingsModuleDto: SettingsModule) {
    return this.settingsModuleService.create(createSettingsModuleDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingsModuleService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsModuleService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSettingsModuleDto: SettingsModule) {
    return this.settingsModuleService.update(+id, updateSettingsModuleDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsModuleService.remove(+id);
  }
}
