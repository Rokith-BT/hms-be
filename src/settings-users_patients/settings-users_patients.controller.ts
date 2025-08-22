import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsUsersPatientsService } from './settings-users_patients.service';
import { SettingsUsersPatient } from './entities/settings-users_patient.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-users-patients')
export class SettingsUsersPatientsController {
  constructor(private readonly settingsUsersPatientsService: SettingsUsersPatientsService) {}


  @UseGuards(AuthGuard)

  @Get()
  findAll() {
    return this.settingsUsersPatientsService.findall();
  }

 
  @UseGuards(AuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body()  SettingsUsersPatientEntity: SettingsUsersPatient) {
    return this.settingsUsersPatientsService.update(id,SettingsUsersPatientEntity );
  }

 
}
