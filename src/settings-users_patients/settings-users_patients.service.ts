import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsUsersPatient } from './entities/settings-users_patient.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsUsersPatientsService {
  constructor(private readonly connection: DataSource) { }

  async findall() {
    try {
       const users_patients = await this.connection.query(`select users.id,users.user_id as patient_id,patients.patient_name,users.username,patients.mobileno,users.is_active as action from users 
    join patients on users.user_id = patients.id`);
    return users_patients;
    } catch (error) {
       throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }
  async update(id: string, SettingsUsersPatientEntity: SettingsUsersPatient) {
    try {
      await this.connection.query(
        'update users SET is_active = ? where id = ?',
        [SettingsUsersPatientEntity.is_active,
          id]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.USER_DETAILS,
          "updated_values": await this.connection.query('SELECT * FROM users WHERE id = ?', [id])
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
