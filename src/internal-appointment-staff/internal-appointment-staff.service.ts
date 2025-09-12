import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class InternalAppointmentStaffService {
  constructor(private readonly connection: DataSource
  ) { }

  async findAll(date: any) {
    try {
      const staff = await this.connection.query(`SELECT distinct CONCAT( staff.name, ' ', staff.surname)  doctor,staff.id from staff_attendance
  left join staff on staff_attendance.staff_id = staff.id
    left join staff_roles on staff_roles.staff_id = staff.id 
  where staff_roles.role_id = 3 and staff_attendance.staff_attendance_type_id != 3 and date(staff_attendance.date) = ?`, [date])
      return staff;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


}
