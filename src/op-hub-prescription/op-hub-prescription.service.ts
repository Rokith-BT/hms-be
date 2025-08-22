import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Prescription } from './entities/op-hub-prescription.entity';

@Injectable()
export class OpHubPrescriptionService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }


  async create(createPrescriptionDto: Prescription) {
    if (createPrescriptionDto.Hospital_id) {
      try {


        let numb
        try {
          numb = createPrescriptionDto.appointment_id.replace(/[a-zA-Z]/g, '')

        } catch (error) {
          numb = createPrescriptionDto.appointment_id
        }


        const [patientMobHos] = await this.dynamicConnection.query(`select mobileno from patients where id = ?`, [createPrescriptionDto.patient_id])

        let HosPatientMobileNo = patientMobHos.mobileno
        let HosTrimmedMobileno;
        if (HosPatientMobileNo.length > 10) {

          HosTrimmedMobileno = HosPatientMobileNo.startsWith('91') ? HosPatientMobileNo.slice(2) : HosPatientMobileNo;
        }
        else {
          HosTrimmedMobileno = HosPatientMobileNo;
        }

        const [AdminPatId] = await this.connection.query(`select id from patients where mobileno = ?`, [HosTrimmedMobileno])
        const [appntHOS] = await this.dynamicConnection.query(`select * from appointment where id = ?`, [numb])
        const [AdminApptId] = await this.connection.query(`select id from appointment 
where Hospital_id = ? and hos_appointment_id = ?`, [createPrescriptionDto.Hospital_id,
        appntHOS.id
        ])
        await this.connection.query(`insert into patient_records(patient_id,record_name,files,
      record_type_id,appointment_id) values(?,?,?,?,?)`, [
          AdminPatId.id,
          createPrescriptionDto.record_name,
          createPrescriptionDto.files,
          3,
          AdminApptId.id
        ])

        return {
          "status": "success",
          "message": "Prescription added successfully"
        }
      } catch (error) {
        console.log(error);

        return error
      }
    } else {
      return {
        "status": "failed",
        "message": "Enter hospital_id to upload prescription"
      }
    }
  }

  async findAll(createPrescriptionDto: Prescription) {
    if (createPrescriptionDto.Hospital_id) {
      if (createPrescriptionDto.patient_id) {
        try {
          const [patientMobHos] = await this.dynamicConnection.query(`select mobileno from patients where id = ?`, [createPrescriptionDto.patient_id])
          const [AdminPatId] = await this.connection.query(`select id from patients where mobileno = ?`, [patientMobHos.mobileno])
          const getPrescr = await this.connection.query(`select patient_records.record_name,patient_records.files,patient_records.tags,
      opd_details.hos_opd_id,concat("Dr. ",staff.name," ",staff.surname) doctorName,CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) appointDate
             from patient_records
             left join appointment on appointment.id = patient_records.appointment_id
             left join visit_details on visit_details.id = appointment.visit_details_id
             left join opd_details on opd_details.id = visit_details.opd_details_id
             left join staff on staff.id = appointment.doctor
             where patient_records.patient_id = ? and record_type_id = 3`, [AdminPatId.id])
          return getPrescr
        } catch (error) {
          return error
        }
      } else {
        return {
          "status": "failed",
          "message": "Enter hospital_id to get prescription"
        }
      }
    } else {
      return {
        "status": "failed",
        "message": "Enter hospital_id to get prescription"
      }
    }
  }
}
