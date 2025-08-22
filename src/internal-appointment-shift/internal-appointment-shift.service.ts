import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InternalAppointmentShiftService {
  constructor(private readonly connection: DataSource) {}

  async findAll(staff_id: number) {
    try {
      const charges = await this.connection.query(
        `select global_shift.name shift_name,
      global_shift.start_time,
      global_shift.end_time,
      global_shift.id global_shift_id,
    doctor_global_shift.staff_id staff_id 
    from global_shift left join doctor_global_shift on doctor_global_shift.global_shift_id = global_shift.id
     where staff_id = ?`,
        [staff_id],
      );
      return charges;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get global_shift_id and global_shift.name

  async findshift(staff_id: number) {
    try {
      const shift = await this.connection.query(
        `select global_shift_id,global_shift.name from doctor_global_shift 
left join global_shift ON doctor_global_shift.global_shift_id = global_shift.id
where doctor_global_shift.staff_id = ?`,
        [staff_id],
      );
      return shift;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
