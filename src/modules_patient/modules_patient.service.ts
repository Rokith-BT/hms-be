import { Injectable } from '@nestjs/common';
import { CreateModulesPatientDto } from './dto/create-modules_patient.dto';
import { UpdateModulesPatientDto } from './dto/update-modules_patient.dto';

@Injectable()
export class ModulesPatientService {
  create(createModulesPatientDto: CreateModulesPatientDto) {
    return 'This action adds a new modulesPatient';
  }

  findAll() {
    return `This action returns all modulesPatient`;
  }

  findOne(id: number) {
    return `This action returns a #${id} modulesPatient`;
  }

  update(id: number, updateModulesPatientDto: UpdateModulesPatientDto) {
    return `This action updates a #${id} modulesPatient`;
  }

  remove(id: number) {
    return `This action removes a #${id} modulesPatient`;
  }
}
