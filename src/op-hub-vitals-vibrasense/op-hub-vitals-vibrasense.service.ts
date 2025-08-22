import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { VitalsVibrasense } from './entities/op-hub-vitals-vibrasense.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OpHubVitalsVibrasenseService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async create(createVitalsVibrasenseDto: VitalsVibrasense) {
    if (!createVitalsVibrasenseDto.hospital_id) {
      return {
        status: 'failed',
        message: 'Enter hospital_id to insert vitals',
      };
    }
    try {
      await this.dynamicConnection.query(
        `insert into VT_Device_Readings (opd_id,
        patient_id,
        device_reading,
        device_name,
        device_id) values (?,?,?,?,?)`,
        [
          createVitalsVibrasenseDto.opd_id,
          createVitalsVibrasenseDto.patient_id,
          JSON.stringify(createVitalsVibrasenseDto.device_reading),
          createVitalsVibrasenseDto.device_name.toLocaleUpperCase(),
          createVitalsVibrasenseDto.device_id,
        ],
      );
      let getAdminOPD_id;
      if (createVitalsVibrasenseDto.opd_id) {
        [getAdminOPD_id] = await this.connection.query(
          `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
          [
            createVitalsVibrasenseDto.hospital_id,
            createVitalsVibrasenseDto.opd_id,
          ],
        );
      } else {
        getAdminOPD_id.id = null;
      }

      const [getHosPAtAAYUSH] = await this.dynamicConnection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createVitalsVibrasenseDto.patient_id],
      );

      const [getAdminPat_id] = await this.connection.query(
        `select id from patients where aayush_unique_id = ? `,
        [getHosPAtAAYUSH.aayush_unique_id],
      );

      await this.connection.query(
        `insert into VT_Device_Readings (opd_id,
          patient_id,
          device_reading,
          device_name,
          device_id) values (?,?,?,?,?)`,
        [
          getAdminOPD_id.id,
          getAdminPat_id.id,
          JSON.stringify(createVitalsVibrasenseDto.device_reading),
          createVitalsVibrasenseDto.device_name,
          createVitalsVibrasenseDto.device_id,
        ],
      );
      return {
        status: 'success',
        message: 'vitals details inserted successfully',
        details: createVitalsVibrasenseDto,
      };
    } catch (error) {
      console.log(error, 'error');
      return {
        status: 'failed',
        message: 'unable to post vitals data',
        error: error,
      };
    }
  }

  async findAll(opd_id: any, hospital_id: any) {
    if (!opd_id && !hospital_id) {
      return {
        status: 'failed',
        message: 'enter hospital_id and opd_id to get vital details',
      };
    }
    try {
      const getVitalDetails = await this.dynamicConnection.query(
        `select * from VT_Device_Readings where opd_id = ?`,
        [opd_id],
      );
      return {
        status: 'success',
        message: 'vitals details fetched successfully',
        details: getVitalDetails,
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'unable to get vital details',
        error: error,
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} vitalsVibrasense`;
  }

  update(id: number, updateVitalsVibrasenseDto: VitalsVibrasense) {
    return `This action updates a #${id} vitalsVibrasense`;
  }

  remove(id: number) {
    return `This action removes a #${id} vitalsVibrasense`;
  }
}
