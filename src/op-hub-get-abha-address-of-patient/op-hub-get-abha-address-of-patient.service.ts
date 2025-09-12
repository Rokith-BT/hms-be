import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubGetAbhaAddressOfPatientService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(patient_id: number) {
    try {
      const getAbhaAddress = await this.dynamicConnection.query(
        `SELECT abhaAddress
FROM patient_abha_address
WHERE patient_id = ?
ORDER BY created_at DESC
LIMIT 1`,
        [patient_id],
      );
      if (getAbhaAddress.length > 0) {
        return {
          status: 'success',
          message: 'patient abha address found successfully',
          abha_address: getAbhaAddress[0],
        };
      } else {
        return {
          status: 'success',
          message: 'no abha address found for the patient',
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        message: 'patient abha address not found',
        abha_address: error,
      };
    }
  }
}
