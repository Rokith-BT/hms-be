import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OpHubPatientAppointmentListCountResponse } from './entities/op-hub-patient-appointment-list.entity';

@Injectable()
export class OpHubPatientAppointmentListService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
  ) {
    if (Hospital_id) {
      if (patient_id) {
        try {
          let query = ` 
  SELECT
    patients.patient_name,
    patients.id AS patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    appointment.module,
    coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    coalesce(visit_details.case_sheet_document) case_sheet_document,
    appointment.appointment_status_id,
    appointment_status.color_code,
    concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
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
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
  `;
          let values = [];
          let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4) `;
          values.push(patient_id);
          let order = `  ORDER BY
  appointment.date DESC, appointment.time DESC `;
          if (date) {
            where += ` and appointment.date = ? `;
            values.push(date);
          } else {
            where += ` and (appointment.date < date(now()) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4) )`;
          }
          if (doctor) {
            where += ` and appointment.doctor = ? `;
            values.push(doctor);
          }

          let group = `
GROUP BY
   patients.patient_name, 
   patients.id, 
   appointment.date, 
   appointment.time, 
   patients.mobileno, 
   patients.dial_code, 
   patient_charges.total,
   appointment.doctor, 
   staff.name, 
   opd_id,
   case_sheet_document,
   staff.surname, 
   appointment_status.status, 
   appointment.appointment_status_id, 
   appointment_status.color_code, 
   appointment.id, 
   case_sheet_document,
   patient_charges.payment_status, 
   appointment_queue.position `;

          let final = query + where + group + order;

          const out = await this.dynamicConnection.query(final, values);

          return out;
        } catch (error) {
          return error;
        }
      } else {
        return {
          status: 'failed',
          message: 'enter patient_id to get the values',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'enter hospital_id to get the values',
      };
    }
  }

  async findAllUpcomming(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
  ) {
    if (Hospital_id) {
      if (patient_id) {
        try {
          let query = ` SELECT
    patients.patient_name,
    patients.id AS patient_id,
            concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    appointment.module,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    appointment.appointment_status_id,
    appointment_status.color_code,
   coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    concat("OPDN",opd_details.id) opd_id,
    patient_charges.total apptFees,
    concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
    patient_charges.payment_status,
    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT("APPN", appointment.id)
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
   
    left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 
   `;
          let values = [];
          let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)  `;

          values.push(patient_id);
          let order = `  ORDER BY
    appointment.date ASC, appointment.time ASC `;
          if (date) {
            where += ` and appointment.date = ? `;
            values.push(date);
          } else {
            where += ` and appointment.date > date(now())  `;
          }
          if (doctor) {
            where += ` and appointment.doctor = ? `;
            values.push(doctor);
          }

          let group = `
  GROUP BY
     patients.patient_name, 
     patients.id, 
     appointment.date, 
     appointment.time, 
     patients.mobileno, 
     case_sheet_document,
     patients.dial_code, 
     appointment.doctor, 
     staff.name, 
     patient_charges.total,
     opd_id,
     staff.surname, 
     appointment_status.status, 
     appointment.appointment_status_id, 
     appointment_status.color_code, 
     appointment.id, 
     patient_charges.payment_status, 
     appointment_queue.position `;
          let final = query + where + group + order;
          const out = await this.dynamicConnection.query(final, values);

          return out;
        } catch (error) {
          return error;
        }
      } else {
        return {
          status: 'failed',
          message: 'enter patient_id to get the values',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'enter hospital_id to get the values',
      };
    }
  }

  async findAllToday(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
  ) {
    if (Hospital_id) {
      if (patient_id) {
        try {
          let query = ` SELECT
      patients.patient_name,
      patients.id AS patient_id,
              concat("PT",patients.id) plenome_patient_id,
      CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
      CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
      CONCAT( patients.mobileno) AS Mobile,
                  coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
      patients.dial_code,
      appointment.doctor,
      appointment.module,
      CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
      appointment_status.status appointment_status,
      appointment.appointment_status_id,
      appointment_status.color_code,
         coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
          concat("OPDN",opd_details.id) opd_id,
      concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
      patient_charges.payment_status,
      patient_charges.total apptFees,
      CASE
          WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
          ELSE CONCAT("APPN", appointment.id)
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
      left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                  LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
     `;
          let values = [];
          let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4) `;
          values.push(patient_id);
          let order = `  ORDER BY
      appointment.date ASC, appointment.time ASC `;
          if (date) {
            where += ` and appointment.date = ? `;
            values.push(date);
          } else {
            where += ` and appointment.date = date(now())  `;
          }
          if (doctor) {
            where += ` and appointment.doctor = ? `;
            values.push(doctor);
          }

          let group = `
    GROUP BY
       patients.patient_name, 
       patients.id, 
       appointment.date, 
       appointment.time, 
       patients.mobileno, 
       patients.dial_code, 
       appointment.doctor, 
       staff.name, 
       case_sheet_document,
       opd_id,
       patient_charges.total,
       staff.surname, 
       appointment_status.status, 
       appointment.appointment_status_id, 
       appointment_status.color_code, 
       appointment.id, 
       patient_charges.payment_status, 
       appointment_queue.position `;

          let final = query + where + group + order;
          const out = await this.dynamicConnection.query(final, values);

          return out;
        } catch (error) {
          return error;
        }
      } else {
        return {
          status: 'failed',
          message: 'enter patient_id to get the values',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'enter hospital_id to get the values',
      };
    }
  }

  async findAllHistoryV2(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
    limit: number,
    page: number,
  ): Promise<OpHubPatientAppointmentListCountResponse> {
    const offset = limit * (page - 1);

    try {
      let query = ` 
  SELECT
    patients.patient_name,
    patients.id AS patient_id,
      concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    appointment.module,
    coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    coalesce(visit_details.case_sheet_document) case_sheet_document,
    appointment.appointment_status_id,
    appointment_status.color_code,
    concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
    patient_charges.payment_status,
    patient_charges.total apptFees,
    concat("OPDN",opd_details.id) opd_id,
    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT(" ", "- ")
    END AS appointment_token,
    appointment.id as app_id
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
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
  `;
      const countQuery = ` select count(*) as total from appointment `;
      let values = [];
      let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4) `;
      values.push(patient_id);
      let order = `  ORDER BY
  appointment.date DESC, appointment.time DESC  limit ${limit} offset ${offset} `;
      if (date) {
        where += ` and appointment.date = ? `;
        values.push(date);
      } else {
        where += ` and (appointment.date < date(now()) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4) )`;
      }
      if (doctor) {
        where += ` and appointment.doctor = ? `;
        values.push(doctor);
      }

      let group = `
GROUP BY
   patients.patient_name, 
   patients.id, 
   appointment.date, 
   appointment.time, 
   patients.mobileno, 
   patients.dial_code, 
   patient_charges.total,
   appointment.doctor, 
   staff.name, 
   opd_id,
   case_sheet_document,
   staff.surname, 
   appointment_status.status, 
   appointment.appointment_status_id, 
   appointment_status.color_code, 
   appointment.id, 
   case_sheet_document,
   patient_charges.payment_status, 
   appointment_queue.position
  `;

      let final = query + where + group + order;
      let countFinal = countQuery + where;

      const out = await this.dynamicConnection.query(final, values);
      const [countOut] = await this.dynamicConnection.query(countFinal, values);
      let resp = {
        details: out,
        count: countOut.total,
      };
      console.log(resp, 'resp');

      return resp;
    } catch (error) {
      return error;
    }
  }

  async findAllUpcommingV2(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
    limit: number,
    page: number,
  ): Promise<OpHubPatientAppointmentListCountResponse> {
    const offset = limit * (page - 1);

    try {
      let query = ` SELECT
    patients.patient_name,
    patients.id AS patient_id,
      concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    appointment.module,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    appointment.appointment_status_id,
    appointment_status.color_code,
   coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    concat("OPDN",opd_details.id) opd_id,
    patient_charges.total apptFees,
    concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
    patient_charges.payment_status,
    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT("APPN", appointment.id)
    END AS appointment_token,
    appointment.id as app_id
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
   
    left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 
   `;
      const countQuery = ` select count(*) as total from appointment `;

      let values = [];
      let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)  `;

      values.push(patient_id);
      let order = `  ORDER BY
    appointment.date DESC, appointment.time ASC  limit ${limit} offset ${offset}`;
      if (date) {
        where += ` and appointment.date = ? `;
        values.push(date);
      } else {
        where += ` and appointment.date > date(now())  `;
      }
      if (doctor) {
        where += ` and appointment.doctor = ? `;
        values.push(doctor);
      }

      let group = `
  GROUP BY
     patients.patient_name, 
     patients.id, 
     appointment.date, 
     appointment.time, 
     patients.mobileno, 
     case_sheet_document,
     patients.dial_code, 
     appointment.doctor, 
     staff.name, 
     patient_charges.total,
     opd_id,
     staff.surname, 
     appointment_status.status, 
     appointment.appointment_status_id, 
     appointment_status.color_code, 
     appointment.id, 
     patient_charges.payment_status, 
     appointment_queue.position 
    `;
      let final = query + where + group + order;
      let countFinal = countQuery + where;

      const out = await this.dynamicConnection.query(final, values);
      const [countOut] = await this.dynamicConnection.query(countFinal, values);
      let resp = {
        details: out,
        count: countOut.total,
      };
      console.log(resp, 'resp');

      return resp;
    } catch (error) {
      return error;
    }
  }

  async findAllTodayV2(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
    limit: number,
    page: number,
  ): Promise<OpHubPatientAppointmentListCountResponse> {
    const offset = limit * (page - 1);
    try {
      let query = ` SELECT
      patients.patient_name,
      patients.id AS patient_id,
        concat("PT",patients.id) plenome_patient_id,
      CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
      CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
      CONCAT( patients.mobileno) AS Mobile,
                  coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
      patients.dial_code,
      appointment.doctor,
      appointment.module,
      CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
      appointment_status.status appointment_status,
      appointment.appointment_status_id,
      appointment_status.color_code,
         coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
          concat("OPDN",opd_details.id) opd_id,
      concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
      patient_charges.payment_status,
      patient_charges.total apptFees,
      CASE
          WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
          ELSE CONCAT("APPN", appointment.id)
      END AS appointment_token,
      appointment.id as app_id
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
      left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                  LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
     `;
      const countQuery = ` select count(*) as total from appointment `;

      let values = [];
      let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4) `;
      values.push(patient_id);
      let order = `  ORDER BY
      appointment.date DESC, appointment.time ASC  limit ${limit} offset ${offset}`;
      if (date) {
        where += ` and appointment.date = ? `;
        values.push(date);
      } else {
        where += ` and appointment.date = date(now())  `;
      }
      if (doctor) {
        where += ` and appointment.doctor = ? `;
        values.push(doctor);
      }

      let group = `
    GROUP BY
       patients.patient_name, 
       patients.id, 
       appointment.date, 
       appointment.time, 
       patients.mobileno, 
       patients.dial_code, 
       appointment.doctor, 
       staff.name, 
       case_sheet_document,
       opd_id,
       patient_charges.total,
       staff.surname, 
       appointment_status.status, 
       appointment.appointment_status_id, 
       appointment_status.color_code, 
       appointment.id, 
       patient_charges.payment_status, 
       appointment_queue.position
       `;

      let final = query + where + group + order;
      let countFinal = countQuery + where;

      const out = await this.dynamicConnection.query(final, values);
      const [countOut] = await this.dynamicConnection.query(countFinal, values);
      let resp = {
        details: out,
        count: countOut.total,
      };

      return resp;
    } catch (error) {
      return error;
    }
  }

  async findAllHistoryV3(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
    limit: number,
    page: number,
  ): Promise<OpHubPatientAppointmentListCountResponse> {
    const offset = limit * (page - 1);

    try {
      let query = ` 
  SELECT
    patients.patient_name,
    patients.id AS patient_id,
            concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    appointment.module,
    coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    coalesce(visit_details.case_sheet_document) case_sheet_document,
    appointment.appointment_status_id,
    appointment_status.color_code,
    concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
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
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
  `;
      const countQuery = ` select count(*) as total from appointment `;
      let values = [];
      let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4) `;
      values.push(patient_id);
      let order = `  ORDER BY
  appointment.date DESC, appointment.time DESC  limit ${limit} offset ${offset} `;
      if (date) {
        where += ` and appointment.date = ? `;
        values.push(date);
      } else {
        where += ` and (appointment.date < date(now()) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4) )`;
      }
      if (doctor) {
        where += ` and appointment.doctor = ? `;
        values.push(doctor);
      }

      let group = `
GROUP BY
   patients.id, 
   patient_charges.total,
   appointment.doctor, 
   staff.id, 
   opd_id,
   case_sheet_document,
   appointment_status.status, 
   appointment.appointment_status_id, 
   appointment_status.color_code, 
   appointment.id, 
   case_sheet_document,
   patient_charges.payment_status, 
   appointment_queue.position
  `;

      let final = query + where + group + order;
      let countFinal = countQuery + where;

      const out = await this.dynamicConnection.query(final, values);
      const [countOut] = await this.dynamicConnection.query(countFinal, values);
      let resp = {
        details: out,
        count: countOut.total,
      };
      console.log(resp, 'resp');

      return resp;
    } catch (error) {
      return error;
    }
  }

  async findAllUpcommingV3(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
    limit: number,
    page: number,
  ): Promise<OpHubPatientAppointmentListCountResponse> {
    const offset = limit * (page - 1);

    try {
      let query = ` SELECT
    patients.patient_name,
    patients.id AS patient_id,
            concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    appointment.module,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    appointment.appointment_status_id,
    appointment_status.color_code,
   coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
    concat("OPDN",opd_details.id) opd_id,
    patient_charges.total apptFees,
    concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
    patient_charges.payment_status,
    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT("APPN", appointment.id)
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
   
    left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 
   `;
      const countQuery = ` select count(*) as total from appointment `;

      let values = [];
      let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)  `;

      values.push(patient_id);
      let order = `  ORDER BY
    appointment.date ASC, appointment.time ASC  limit ${limit} offset ${offset}`;
      if (date) {
        where += ` and appointment.date = ? `;
        values.push(date);
      } else {
        where += ` and appointment.date > date(now())  `;
      }
      if (doctor) {
        where += ` and appointment.doctor = ? `;
        values.push(doctor);
      }

      let group = `
  GROUP BY
   patients.id, 
   patient_charges.total,
   appointment.doctor, 
   staff.id, 
   opd_id,
   case_sheet_document,
   appointment_status.status, 
   appointment.appointment_status_id, 
   appointment_status.color_code, 
   appointment.id, 
   case_sheet_document,
   patient_charges.payment_status, 
   appointment_queue.position 
    `;
      let final = query + where + group + order;
      let countFinal = countQuery + where;

      const out = await this.dynamicConnection.query(final, values);
      const [countOut] = await this.dynamicConnection.query(countFinal, values);
      let resp = {
        details: out,
        count: countOut.total,
      };
      console.log(resp, 'resp');

      return resp;
    } catch (error) {
      return error;
    }
  }

  async findAllTodayV3(
    Hospital_id: number,
    patient_id: number,
    date: any,
    doctor: number,
    limit: number,
    page: number,
  ): Promise<OpHubPatientAppointmentListCountResponse> {
    const offset = limit * (page - 1);
    try {
      let query = ` SELECT
      patients.patient_name,
      patients.id AS patient_id,
              concat("PT",patients.id) plenome_patient_id,
      CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
      CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
      CONCAT( patients.mobileno) AS Mobile,
                  coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
      patients.dial_code,
      appointment.doctor,
      appointment.module,
      CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
      appointment_status.status appointment_status,
      appointment.appointment_status_id,
      appointment_status.color_code,
         coalesce(visit_details.case_sheet_document,"-") case_sheet_document,
          concat("OPDN",opd_details.id) opd_id,
      concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
      patient_charges.payment_status,
      patient_charges.total apptFees,
      CASE
          WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
          ELSE CONCAT("APPN", appointment.id)
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
      left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                  LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
     `;
      const countQuery = ` select count(*) as total from appointment `;

      let values = [];
      let where = ` where  appointment.id and appointment.patient_id = ? and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4) `;
      values.push(patient_id);
      let order = `  ORDER BY
      appointment.date ASC, appointment.time ASC  limit ${limit} offset ${offset}`;
      if (date) {
        where += ` and appointment.date = ? `;
        values.push(date);
      } else {
        where += ` and appointment.date = date(now())  `;
      }
      if (doctor) {
        where += ` and appointment.doctor = ? `;
        values.push(doctor);
      }

      let group = `
    GROUP BY
   patients.id, 
   patient_charges.total,
   appointment.doctor, 
   staff.id, 
   opd_id,
   case_sheet_document,
   appointment_status.status, 
   appointment.appointment_status_id, 
   appointment_status.color_code, 
   appointment.id, 
   case_sheet_document,
   patient_charges.payment_status, 
   appointment_queue.position
       `;

      let final = query + where + group + order;
      let countFinal = countQuery + where;

      const out = await this.dynamicConnection.query(final, values);
      const [countOut] = await this.dynamicConnection.query(countFinal, values);
      let resp = {
        details: out,
        count: countOut.total,
      };

      return resp;
    } catch (error) {
      return error;
    }
  }
}
