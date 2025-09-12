import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubInternalAppntDoctorsService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

  async findAll(hospital_id: number) {
    if (hospital_id) {
      try {
        const getDoctors = await this.dynamicConnection.query(`select staff.id doctorId,
 concat("Dr. ",staff.name," ",staff.surname) doctorName from staff left join staff_roles on staff.id = staff_roles.staff_id where staff_roles.role_id = 3`)
        return getDoctors;
      } catch (error) {
        return error
      }
    } else {
      return {
        status: "failed",
        "message": "Enter hospital_id to get the doctors"
      }
    }
  }
}
