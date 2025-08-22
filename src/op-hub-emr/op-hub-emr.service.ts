import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Emr } from './entities/op-hub-emr.entity';

@Injectable()
export class OpHubEmrService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

  async create(recordEntity: Emr) {

    if (recordEntity.hospital_id) {

      try {

        const [HospatMob] = await this.dynamicConnection.query(`select mobileno from patients where id = ?`, [recordEntity.patient_id])

        let mob = HospatMob.mobileno
        let AdminTrimmedMobileno;
        if (mob.length > 10) {


          AdminTrimmedMobileno = mob.startsWith('91') ? mob.slice(2) : mob;
        }
        else {
          AdminTrimmedMobileno = mob;
        }

        const [getAdminPatId] = await this.connection.query(`select id from patients 
where mobileno = ? or mobileno = ?`, [mob, AdminTrimmedMobileno])


        await this.connection.query(`insert into patient_records (
      patient_id,
      record_name,
      record_type_id,
      files,
      tags)
     values(?,?,?,?,?)`, [
          getAdminPatId.id,
          recordEntity.record_name,
          recordEntity.record_type_id,
          JSON.stringify(recordEntity.files),
          JSON.stringify(recordEntity.tags)
        ])
        return {
          "status": "success",
          "message": "Documents uploaded successfully"
        }
      } catch (error) {
        return {
          "status": "failed",
          "error": error
        }
      }
    }
    else {
      return {
        "status": "failed",
        "message": "Enter hospital_id to upload teh EMR"
      }
    }
  }
}
