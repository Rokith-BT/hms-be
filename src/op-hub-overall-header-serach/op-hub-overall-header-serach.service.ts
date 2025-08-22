import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateOverallHeaderSearchDto } from './dto/create-overall-header-search.dto';

@Injectable()
export class OpHubOverallHeaderSerachService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createOverallHeaderSearchDto: CreateOverallHeaderSearchDto) {
    try {
      let result;
      if (createOverallHeaderSearchDto.module.toUpperCase() == 'PATIENT') {
        const getPatients = await this.dynamicConnection.query(
          `SELECT patients.*,blood_bank_products.name patient_blood_group FROM patients
        left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.id like ? or patients.patient_name like ? 
        or patients.mobileno like ?`,
          [
            '%' + createOverallHeaderSearchDto.search + '%',
            '%' + createOverallHeaderSearchDto.search + '%',
            '%' + createOverallHeaderSearchDto.search + '%',
          ],
        );
        result = getPatients;
      }
      if (createOverallHeaderSearchDto.module.toUpperCase() == 'OPD') {
        const getPatients = await this.dynamicConnection.query(
          ` SELECT
    patients.patient_name,
    patients.id AS patient_id,
            concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    coalesce(visit_details.case_sheet_document) case_sheet_document,
    appointment.appointment_status_id,
    appointment_status.color_code,
    CONCAT("APPN",appointment.id) appointment_id,
    patient_charges.payment_status,
    patient_charges.total apptFees,
    concat("OPDN",opd_details.id) opd_id,
    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT(" ", "- ")
    END AS appointment_token 
  FROM
    appointment
  LEFT JOIN
    patients ON patients.id = appointment.patient_id
  LEFT JOIN
    staff ON staff.id = appointment.doctor
  LEFT JOIN
    appointment_queue ON appointment_queue.appointment_id = appointment.id
    left join 
    appointment_status on appointment_status.id = appointment.appointment_status_id
    LEFT JOIN
    visit_details ON visit_details.id = appointment.visit_details_id
    left join
    opd_details on opd_details.id = visit_details.opd_details_id
    left join 
    patient_charges on patient_charges.id = visit_details.patient_charge_id
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 WHERE patients.id like ? or patients.patient_name like ? 
              or patients.mobileno like ?  ORDER BY
  appointment.date DESC, appointment.time DESC `,
          [
            '%' + createOverallHeaderSearchDto.search + '%',
            '%' + createOverallHeaderSearchDto.search + '%',
            '%' + createOverallHeaderSearchDto.search + '%',
          ],
        );
        result = getPatients;
      }
      if (createOverallHeaderSearchDto.module.toUpperCase() == 'APPOINTMENT') {
        const getPatients = await this.dynamicConnection.query(
          `SELECT
  patients.patient_name,
  patients.id AS patient_id,
          concat("PT",patients.id) plenome_patient_id,
  CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
  CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
  CONCAT( patients.mobileno) AS Mobile,
              coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  patients.dial_code,
  opd_details.id opd_id,
  appointment.doctor,
  CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment_status.color_code,
  CONCAT("APPN",appointment.id) appointment_id,
  patient_charges.payment_status,
  patient_charges.total apptFees,
  CASE
      WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
      ELSE CONCAT(" ", "- ")
  END AS appointment_token 
FROM
  appointment
LEFT JOIN
  patients ON patients.id = appointment.patient_id
LEFT JOIN
  staff ON staff.id = appointment.doctor
LEFT JOIN
  appointment_queue ON appointment_queue.appointment_id = appointment.id
  left join 
  appointment_status on appointment_status.id = appointment.appointment_status_id
  LEFT JOIN
  visit_details ON visit_details.id = appointment.visit_details_id
  left join opd_details on opd_details.id = visit_details.opd_details_id
  left join patient_charges on patient_charges.id = visit_details.patient_charge_id
              LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
                WHERE patients.id like ? or patients.patient_name like ? 
              or patients.mobileno like ? 
              GROUP BY
    patients.patient_name, 
    patients.id, 
    appointment.date, 
    appointment.time, 
    patients.mobileno, 
    patients.dial_code, 
    appointment.doctor, 
    staff.name, 
    staff.surname, 
    appointment_status.status, 
    appointment.appointment_status_id, 
    appointment_status.color_code, 
    appointment.id, 
    apptFees,
    opd_id,
    patient_charges.payment_status, 
    appointment_queue.position 
    ORDER BY
  date(appointment.date) ASC, time(appointment.date) ASC `,
          [
            '%' + createOverallHeaderSearchDto.search + '%',
            '%' + createOverallHeaderSearchDto.search + '%',
            '%' + createOverallHeaderSearchDto.search + '%',
          ],
        );
        result = getPatients;
      }
      return {
        status: 'success',
        message: 'details found successfully',
        details: result,
      };
    } catch (error) {
      return error;
    }
  }
}
