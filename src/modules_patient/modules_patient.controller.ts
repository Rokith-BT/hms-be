import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ModulesPatientService } from './modules_patient.service';
import { CreateModulesPatientDto } from './dto/create-modules_patient.dto';
import { UpdateModulesPatientDto } from './dto/update-modules_patient.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('modules-patient')
export class ModulesPatientController {
  constructor(private readonly modulesPatientService: ModulesPatientService) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() createModulesPatientDto: CreateModulesPatientDto) {
    return this.modulesPatientService.create(createModulesPatientDto);
  }
@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.modulesPatientService.findAll();
  }
@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesPatientService.findOne(+id);
  }
@UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModulesPatientDto: UpdateModulesPatientDto) {
    return this.modulesPatientService.update(+id, updateModulesPatientDto);
  }
@UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulesPatientService.remove(+id);
  }
}
