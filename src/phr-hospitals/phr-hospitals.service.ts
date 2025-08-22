import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
const moment = require("moment");
const Razorpay = require('razorpay');

@Injectable()
export class PhrHospitalsService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
  ) { }
  async convertTo12HourFormat(time) {
    return moment(time, "HH:mm:ss").format("h:mm A");
  }
  async getHospitalAppointmentHistoryById(patient_id: number, hospital_id: number) {

    try {

      const [getPatientId] = await this.connection.query(`select * from patients where id = ?`, [patient_id])
      const [getHosPatId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [getPatientId.aayush_unique_id])
      if (!getHosPatId) {
        return {
          status: "success",
          message: "You haven't booked any appointments in this hospital"
        }
      }
      let query = `select  
      patients.id,
      patients.patient_name,patients.gender,patients.age,
      patients.mobileno,
      patients.email,
      patients.ABHA_number,
      concat(staff.name,"",staff.surname) doctorName,
      staff.id doctor_id,
          coalesce(visit_details.case_sheet_document,"-")case_sheet_document ,
      appointment.source,
      GROUP_CONCAT(specialist.specialist_name) AS specialist_names,
      concat(CASE 
WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
ELSE 'TEMP' 
END,appointment.id) appointment_id,
      DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
      DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
      concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
      appointment_status.status appointment_status,
      appointment.appointment_status_id,
      appointment_status.color_code,
      appointment_queue.position,
      CASE
              WHEN appointment.live_consult = 'yes' THEN 'online'
              ELSE 'offline'
          END AS consultingType,
          appointment.message,
          case 
when appointment.doctor is null then
patient_charges.temp_standard_charge else
patient_charges.standard_charge end consultFees,
                          case 
when appointment.doctor is null then
patient_charges.temp_tax else
patient_charges.tax end taxPercentage,
patient_charges.additional_charge additional_charge,
patient_charges.additional_charge_note additional_charge_note,
patient_charges.discount_percentage discount_percentage,
patient_charges.discount_amount discount_amount,
patient_charges.id patientChargeId,
       case 
when appointment.doctor is null then 
    format(((patient_charges.temp_standard_charge * patient_charges.temp_tax)/100 ),2) else

format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) end  taxAmount,
      patient_charges.total netAmount,
      patient_charges.discount_percentage,
      patient_charges.discount_amount,
      patient_charges.additional_charge,
      patient_charges.additional_charge_note,
      transactions.id transactionID,
      transactions.payment_mode,
      transactions.payment_date,
      CASE
              WHEN patient_charges.payment_status = 'paid' THEN 'Payment done'
              WHEN patient_charges.payment_status = 'refunded' THEN 'refunded'
              WHEN patient_charges.payment_status = 'partially_paid' and appointment.doctor is null THEN 'Payment done'
              ELSE 'Need payment' 

          END AS payment_status

          from appointment
          left join patients on patients.id = appointment.patient_id
          left join staff on staff.id = appointment.doctor
          left join visit_details on visit_details.id = appointment.visit_details_id
          LEFT JOIN specialist ON 
          IF(
              JSON_VALID(staff.specialist) AND JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON)),
              1,
              0
          )
              left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
          left join patient_charges on patient_charges.opd_id = opd_details.id
          left join transactions on transactions.id = patient_charges.transaction_id
          LEFT JOIN appointment_status ON appointment_status.id = appointment.appointment_status_id
          left join doctor_shift on doctor_shift.id = appointment.shift_id
          left join appointment_queue on appointment.id = appointment_queue.appointment_id
  WHERE
      (patients.id = ? and (appointment.date < date(now()) or 
      appointment.appointment_status_id = 4 or appointment.appointment_status_id = 6))
      group by id,patient_name,gender,age,mobileno,email,ABHA_number,doctorName,doctor_id,source,appointment_id,
          appointmentDate,
          appointmentTime,
          slot,
          patient_charges.id,
          appointment_status,
          appointment_status_id,
          color_code,
          position,
          case_sheet_document,
          consultingType,
          message,
          consultFees,
          taxPercentage,
      discount_percentage,
      discount_amount,
      additional_charge,
      additional_charge_note,
          taxAmount,
          netAmount,
          transactionID,
          payment_mode,
          payment_date,
          payment_status `
      let values = [getHosPatId.id]
      const [getHosName] = await this.connection.query(`select * from hospitals where plenome_id = ?`, [hospital_id])
      const HosName = await getHosName.hospital_name
      const HosAddress = await getHosName.address
      const answer = await this.dynamicConnection.query(query, values)
      for (const ans of answer) {
        if (!ans.doctor_id) {
          let opn = await this.convertTo12HourFormat(getHosName.hospital_opening_timing)
          let cls = await this.convertTo12HourFormat(getHosName.hospital_closing_timing)
          ans.slot = opn + " - " + cls
        }
        if (ans) {
          const getApptId = await ans.appointment_id.replace(/[a-zA-Z]/g, '')
          const [getAdminApptDetails] = await this.connection.query(`select * from appointment where Hospital_id and hos_appointment_id = ?`, [hospital_id, getApptId])
          ans.hospital_name = HosName
          ans.hospital_address = HosAddress
          ans.phr_doctor = getAdminApptDetails.doctor
          ans.phr_global_shift_id = getAdminApptDetails.global_shift_id
          ans.phr_hospital_id = getAdminApptDetails.Hospital_id
          ans.phr_live_consult = getAdminApptDetails.live_consult
          ans.phr_shift_id = getAdminApptDetails.shift_id
          ans.phr_appointment_id = getAdminApptDetails.id
        }
      }
      return answer
    } catch (error) {
      return [{
        "status": "failed",
        "message": "unable to fetch past appointment of the patient",
        "error": error
      }]
    }

  }
  async getHospitalAppointmentHistoryByIdList(patient_id: number, hospital_id: number, limit: number, page: number) {

    try {
      const offset = limit * (page - 1);

      const [getPatientId] = await this.connection.query(`select * from patients where id = ?`, [patient_id])
      const [getHosPatId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [getPatientId.aayush_unique_id])
      if (!getHosPatId) {
        return {
          status_code: 400,
          status: "success",
          message: "You haven't booked any appointments in this hospital"
        }
      }
      let query = `select  
      patients.id,
      patients.patient_name,patients.gender,patients.age,
      patients.mobileno,
      patients.email,
      patients.ABHA_number,
      concat(staff.name,"",staff.surname) doctorName,
      staff.id doctor_id,
          coalesce(visit_details.case_sheet_document,"-")case_sheet_document ,
      appointment.source,
      GROUP_CONCAT(specialist.specialist_name) AS specialist_names,
      concat(CASE 
WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
ELSE 'TEMP' 
END,appointment.id) appointment_id,
      DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
      DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
      concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
      appointment_status.status appointment_status,
      appointment.appointment_status_id,
      appointment_status.color_code,
      appointment_queue.position,
      CASE
              WHEN appointment.live_consult = 'yes' THEN 'online'
              ELSE 'offline'
          END AS consultingType,
          appointment.message,
          case 
when appointment.doctor is null then
patient_charges.temp_standard_charge else
patient_charges.standard_charge end consultFees,
                          case 
when appointment.doctor is null then
patient_charges.temp_tax else
patient_charges.tax end taxPercentage,
patient_charges.additional_charge additional_charge,
patient_charges.additional_charge_note additional_charge_note,
patient_charges.discount_percentage discount_percentage,
patient_charges.discount_amount discount_amount,
patient_charges.id patientChargeId,
       case 
when appointment.doctor is null then 
    format(((patient_charges.temp_standard_charge * patient_charges.temp_tax)/100 ),2) else

format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) end  taxAmount,
      patient_charges.total netAmount,
      patient_charges.discount_percentage,
      patient_charges.discount_amount,
      patient_charges.additional_charge,
      patient_charges.additional_charge_note,
      transactions.id transactionID,
      transactions.payment_mode,
      transactions.payment_date,
      CASE
              WHEN patient_charges.payment_status = 'paid' THEN 'Payment done'
              WHEN patient_charges.payment_status = 'refunded' THEN 'refunded'
              WHEN patient_charges.payment_status = 'partially_paid' and appointment.doctor is null THEN 'Payment done'
              ELSE 'Need payment' 

          END AS payment_status

          from appointment
          left join patients on patients.id = appointment.patient_id
          left join staff on staff.id = appointment.doctor
          left join visit_details on visit_details.id = appointment.visit_details_id
          LEFT JOIN specialist ON 
          IF(
              JSON_VALID(staff.specialist) AND JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON)),
              1,
              0
          )
              left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
          left join patient_charges on patient_charges.opd_id = opd_details.id
          left join transactions on transactions.id = patient_charges.transaction_id
          LEFT JOIN appointment_status ON appointment_status.id = appointment.appointment_status_id
          left join doctor_shift on doctor_shift.id = appointment.shift_id
          left join appointment_queue on appointment.id = appointment_queue.appointment_id
  WHERE
      (patients.id = ? and (appointment.date <= date(now()) or 
      appointment.appointment_status_id = 4 or appointment.appointment_status_id = 6))
      group by id,patient_name,doctor_id,appointment_id
          limit ? offset ?`
      let values = [getHosPatId.id, limit, offset]
      const [getHosName] = await this.connection.query(`select * from hospitals where plenome_id = ?`, [hospital_id])
      const HosName = await getHosName.hospital_name
      const HosAddress = await getHosName.address
      const answer = await this.dynamicConnection.query(query, values)
      console.log(answer.length,"[[[[[[[[[[]]]]]]]]]");
      
      for (const ans of answer) {
        if (!ans.doctor_id) {
          let opn = await this.convertTo12HourFormat(getHosName.hospital_opening_timing)
          let cls = await this.convertTo12HourFormat(getHosName.hospital_closing_timing)
          ans.slot = opn + " - " + cls
        }
        if (ans) {
          const getApptId = await ans.appointment_id.replace(/[a-zA-Z]/g, '')
          const [getAdminApptDetails] = await this.connection.query(`select * from appointment where Hospital_id and hos_appointment_id = ?`, [hospital_id, getApptId])
          ans.hospital_name = HosName
          ans.hospital_address = HosAddress
          ans.phr_doctor = getAdminApptDetails.doctor
          ans.phr_global_shift_id = getAdminApptDetails.global_shift_id
          ans.phr_hospital_id = getAdminApptDetails.Hospital_id
          ans.phr_live_consult = getAdminApptDetails.live_consult
          ans.phr_shift_id = getAdminApptDetails.shift_id
          ans.phr_appointment_id = getAdminApptDetails.id
        }
      }
      let [count] = await this.dynamicConnection.query(`select count(id) total from  appointment where patient_id = ? and (appointment.date <= date(now()) or 
      appointment.appointment_status_id = 4 or appointment.appointment_status_id = 6)`, [getHosPatId.id, hospital_id])

      return {
        status_code: 200,
        status: "Success",
        message: "Details Fetched Successfully",
        details: answer,
        total: count.total
      }

    } catch (error) {
      return [{
        status_code:500,
        "status": "Failed",
        "message": "THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER",
      }]
    }

  }

}
