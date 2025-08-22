import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsModulesPatient } from './entities/settings-modules_patient.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsModulesPatientService {
  constructor(private readonly connection: DataSource) { }

  async findall() {
    try {
       const modules_patient = await this.connection.query(`select permission_patient.id,permission_patient.name,permission_patient.is_active from permission_patient`)
    return modules_patient;
    } catch (error) {
        throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async update(id: string, SettingsModulesPatientEntity: SettingsModulesPatient) {
    try {
      await this.connection.query(
        `update permission_patient SET is_active = ? where id = ?`,
        [
          SettingsModulesPatientEntity.is_active,
          id
        ]
      );
      return [{
        "date": {
          status: process.env.SUCCESS_STATUS_V2,
          "message": process.env.PERMISSION_PATIENT,
          "updated_values": await this.connection.query(`select * from permission_patient where id = ?`, [id])
        }
      }];

    } catch (error) {
        throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
