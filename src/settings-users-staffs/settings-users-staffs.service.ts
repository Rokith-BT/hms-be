import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsUsersStaff } from './entities/settings-users-staff.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsUsersStaffsService {
  constructor(private readonly connection: DataSource) {}

  async findall() {
    try {
       const users_staff = await this.connection.query(`select staff.id,staff.employee_id as staff_ID, staff.name,staff.email,roles.name as role,staff_designation.designation,department.department_name,
    staff.contact_no as phone ,staff.is_active from staff
    join staff_roles on staff_roles.staff_id = staff.id
    join roles on staff_roles.role_id = roles.id
    join staff_designation on staff.staff_designation_id = staff_designation.id
    join department on staff.department_id = department.id`);
    return users_staff;
    } catch (error) {
          throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async update(id:string, SettingsUsersStaffEntity: SettingsUsersStaff ) {
    try{
       await this.connection.query(
        `update staff SET is_active = ? where id = ?`,
        [
          SettingsUsersStaffEntity.is_active,
          id
        ]
      );

      return [{"data": {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.USER_STAFF,
        "updated_values":await this.connection.query(`select * from users where id = ?`, [id])
      }}]
    }catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
