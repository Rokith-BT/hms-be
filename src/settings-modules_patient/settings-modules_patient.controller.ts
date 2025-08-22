import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsModulesPatientService } from './settings-modules_patient.service';
import { SettingsModulesPatient } from './entities/settings-modules_patient.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-modules-patient')
export class SettingsModulesPatientController {
  constructor(private readonly settingsModulesPatientService: SettingsModulesPatientService) {}

 
  @UseGuards(AuthGuard)

  @Get()
  findAll() {
    return this.settingsModulesPatientService.findall();
  }

  
  @UseGuards(AuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body() ettingsModulesPatientEntity: SettingsModulesPatient) {
    return this.settingsModulesPatientService.update(id,ettingsModulesPatientEntity );
  }

 
}
