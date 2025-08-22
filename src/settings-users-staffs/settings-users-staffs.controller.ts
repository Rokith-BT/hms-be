import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsUsersStaffsService } from './settings-users-staffs.service';
import { SettingsUsersStaff } from './entities/settings-users-staff.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-users-staffs')
export class SettingsUsersStaffsController {
  constructor(private readonly settingsUsersStaffsService: SettingsUsersStaffsService) {}

 
  @UseGuards(AuthGuard)

  @Get()
  findAll() {
    return this.settingsUsersStaffsService.findall();
  }

 
  @UseGuards(AuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body() SettingsUsersStaffEntity: SettingsUsersStaff) {
    return this.settingsUsersStaffsService.update(id,SettingsUsersStaffEntity );
  }

 
}
