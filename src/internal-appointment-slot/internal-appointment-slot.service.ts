import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class InternalAppointmentSlotService {

  constructor(private readonly connection: DataSource) { }
  async findAll(staff_id: number, global_shift_id: number, date: string) {
    try {
      const charges = await this.connection.query(`select doctor_shift.id shift_id,doctor_shift.staff_id,doctor_shift.global_shift_id,doctor_shift.day,
    concat(start_time," - ",end_time) slot
     from doctor_shift where staff_id = ? 
    and global_shift_id = ? and day = dayname(?)`, [staff_id, global_shift_id, date])
      return charges;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }


  }
}
