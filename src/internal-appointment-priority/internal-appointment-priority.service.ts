import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { InternalAppointmentPriority } from "./entities/internal-appointment-priority.entity";

@Injectable()
export class InternalAppointmentPriorityService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async findAll(): Promise<InternalAppointmentPriority[]> {
    try {
      const appointment_priority = await this.connection.query('SELECT * FROM appoint_priority');
      return appointment_priority;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
  async findOne(id: string): Promise<InternalAppointmentPriority | null> {
    try {
      const appointment_priority = await this.connection.query('SELECT * FROM appoint_priority WHERE id = ?', [id]);
      if (appointment_priority.length === 1) {
        return appointment_priority;
      } else {
        return null;
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}
