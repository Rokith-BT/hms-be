import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsRolesPermissionsService } from './settings_roles-permissions.service';
import { SettingsRolesPermission } from './entities/settings_roles-permission.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-roles-permissions')
export class SettingsRolesPermissionsController {
  constructor(private readonly settingsRolesPermissionsService: SettingsRolesPermissionsService) {}

  // @Post()
  // create(@Body() rolespermissionEntity:SettingsRolesPermission) {
  //   return this.settingsRolesPermissionsService.create(rolespermissionEntity);
  // }
@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingsRolesPermissionsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsRolesPermissionsService.findone(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() rolespermissionEntity:SettingsRolesPermission) {
    return this.settingsRolesPermissionsService.update(id,rolespermissionEntity);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.settingsRolesPermissionsService.remove(id);
  // }
}
