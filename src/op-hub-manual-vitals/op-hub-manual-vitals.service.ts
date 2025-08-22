import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateManualVitalDto } from './dto/create-manual_vital.dto';

@Injectable()
export class OpHubManualVitalsService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) { }
  async create(createManualVitalDto: CreateManualVitalDto, opd_id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }

    try {
      await this.dynamicConnection.query(`update visit_details set spo2 = ?,
            respiration = ?,
            temperature = ?,
            pulse = ?,
            weight = ?,
            height = ?,
            bp = ? where opd_details_id = ?`, [
        createManualVitalDto.spo2,
        createManualVitalDto.respiration,
        createManualVitalDto.temperature,
        createManualVitalDto.pulse,
        createManualVitalDto.weight,
        createManualVitalDto.height,
        createManualVitalDto.bp,
        opd_id
      ])
      const [getAdminOPD] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
        hospital_id,
        opd_id
      ])
      await this.connection.query(`update visit_details set spo2 = ?,
              respiration = ?,
              temperature = ?,
              pulse = ?,
              weight = ?,
              height = ?,
              bp = ? where opd_details_id = ?`, [
        createManualVitalDto.spo2,
        createManualVitalDto.respiration,
        createManualVitalDto.temperature,
        createManualVitalDto.pulse,
        createManualVitalDto.weight,
        createManualVitalDto.height,
        createManualVitalDto.bp,
        getAdminOPD.id
      ])
      return {
        "status": "success",
        "message": "manual vitals updated successfully"
      }
    } catch (error) {
      return {
        "status": "failed",
        "message": "unable to update manual vital values"
      }
    }
  }

  async findAll(opd_id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      const [getManualVitals] = await this.dynamicConnection.query(`select  
            concat("OPDN",opd_details_id) opd_details_id,
            opd_details.patient_id,
            concat("Dr.",staff.name," ",staff.surname) consultant,
            CONCAT(DATE_FORMAT(visit_details.appointment_date, '%D %b %Y')) AS date_time,

            coalesce(visit_details.spo2,"") spo2,
    coalesce(visit_details.respiration,"") respiration,
    coalesce(visit_details.temperature,"") temperature,
    coalesce(visit_details.pulse,"") pulse,
    coalesce(visit_details.weight,"") weight,
   coalesce(visit_details.height,"")height,
    coalesce(visit_details.bp,"")bp from visit_details left join staff on staff.id = visit_details.cons_doctor 
    left join opd_details on opd_details.id  = visit_details.opd_details_id
    where opd_details_id = ?`, [opd_id])

      return {
        "status": "success",
        "message": "manual vitals fetched successfully",
        "details": getManualVitals
      }
    } catch (error) {
      console.log(error);

      return {
        "status": "failed",
        "message": "unable to fetch manual vitals"
      }
    }
  }
}
