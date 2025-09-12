import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UnlinkAbhaFromPatient } from './entities/op-hub-unlink-abha-from-patient.entity';

@Injectable()
export class OpHubUnlinkAbhaFromPatientService {


  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createUnlinkAbhaFromPatientDto: UnlinkAbhaFromPatient) {
    if (!createUnlinkAbhaFromPatientDto.hospital_id) {
      return {
        "status": "failed",
        "message": "hospital_id is required"
      }
    }
    if (!createUnlinkAbhaFromPatientDto.patient_id) {
      return {
        "status": "failed",
        "message": "patient_id is required"
      }
    }
    if (!createUnlinkAbhaFromPatientDto.abhaAddress) {
      return {
        "status": "failed",
        "message": "abhaAddress is required"
      }
    }
    try {
      await this.dynamicConnection.query(`delete from patient_abha_address where patient_id = ? and abhaAddress = ?`, [createUnlinkAbhaFromPatientDto.patient_id,
      createUnlinkAbhaFromPatientDto.abhaAddress])
      return {
        "status": "success",
        "message": "abha address unlinked from patient successfully"
      }
    } catch (error) {
      return {
        "status": "failed",
        "message": "failed to unlink abha address from patient",
        error: error
      }
    }
  }


}
