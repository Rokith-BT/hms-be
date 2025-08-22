import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmrAddNewPatientWithAbhaQr, Patient } from './entities/emr_add-new-patient-with-abha-qr.entity';
import * as moment from 'moment';
const crypto = require('node:crypto');
const fs = require('node:fs');
import { v4 as uuidv4 } from 'uuid';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class EmrAddNewPatientWithAbhaQrservice {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
      @Inject(forwardRef(() => FaceAuthService))
      private readonly addAppointmentService: FaceAuthService,
    ) { }

  generateRandomPassword(length: number = 12): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    const randomBytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % characters.length;
      password += characters.charAt(randomIndex);
    }

    return password;
  }

  async create(createPatientFromQr_Entity: EmrAddNewPatientWithAbhaQr) {
    try {
      let uuid = uuidv4()
      try {
        let patient_id;
        let abha
        if (createPatientFromQr_Entity.hidn) {
          let inputString = createPatientFromQr_Entity.hidn
          abha = inputString.replace(/\D/g, '');
        }
        let mob = createPatientFromQr_Entity.mobile
        let AdminTrimmedMobileno;
        if (mob.length > 10) {
          AdminTrimmedMobileno = mob.startsWith('91') ? mob.slice(2) : mob;
        }
        else {
          AdminTrimmedMobileno = mob;
        }
        let AdminPatId
        const [checkinAdmin] = await this.connection.query(`SELECT  * FROM patients WHERE mobileno = ? or mobileno = ?`,
          [createPatientFromQr_Entity.mobile,
            AdminTrimmedMobileno])
        if (checkinAdmin) {
          AdminPatId = checkinAdmin.id
          let formattedDate;
          if (createPatientFromQr_Entity.dob) {
            let originalDateString = createPatientFromQr_Entity.dob;
            const originalDate = moment(originalDateString, 'DD/MM/YYYY');
            formattedDate = originalDate.format('YYYY-MM-DD');
          }

          await this.connection.query(`update patients set 
          dob = ?,gender = ?,address = ?,ABHA_number = ?,state_code = ?,district_code = ?,dial_code = ? 
          where id = ?`,
            [
              formattedDate,
              createPatientFromQr_Entity.gender,
              createPatientFromQr_Entity.address,
              abha,
              createPatientFromQr_Entity.statelgd,
              createPatientFromQr_Entity.distlgd,
              "91",
              checkinAdmin.id
            ])
        } else {
          try {
            let formattedDate
            let abha;
            if (createPatientFromQr_Entity.dob) {
              let originalDateString = createPatientFromQr_Entity.dob;
              const originalDate = moment(originalDateString, 'DD/MM/YYYY');
              formattedDate = originalDate.format('YYYY-MM-DD');

            }
            if (createPatientFromQr_Entity.hidn) {
              let inputString = createPatientFromQr_Entity.hidn
              abha = inputString.replace(/\D/g, '');
            }


            let insertAdmin = await this.connection.query(`INSERT into patients(patient_name,
        dob,
        mobileno,
        gender,
        address,
        ABHA_number,
        state_code,
        district_code,
        state_name,
        district_name,
        aayush_unique_id
        ) values(?,?,?,?,?,?,?,?,?,?,?)`,
              [
                createPatientFromQr_Entity.name,
                formattedDate,
                createPatientFromQr_Entity.mobile,
                createPatientFromQr_Entity.gender,
                createPatientFromQr_Entity.address,
                abha,
                createPatientFromQr_Entity.statelgd,
                createPatientFromQr_Entity.distlgd,
                createPatientFromQr_Entity['state name'],
                createPatientFromQr_Entity.district_name,
                uuid
              ])
            AdminPatId = insertAdmin.insertId
          } catch (error) {

            return [error]
          }
        }
        const [checkinAdminforHos] = await this.connection.query(`SELECT  * FROM patients WHERE id = ?`,
          [AdminPatId])

        const [patientDetails] = await this.connection.query(`SELECT patients.* ,blood_bank_products.name patient_blood_group
            from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where patients.id = ?`, [AdminPatId])

        const [result] = await this.dynamicConnection.query(
          `SELECT  * FROM patients WHERE mobileno = ? or mobileno = ?`,
          [createPatientFromQr_Entity.mobile,
            AdminTrimmedMobileno]
        );

        if (result) {
          patient_id = result.id;
        }

        let response;

        if (patient_id) {
          let formattedDate;
          let abha;
          if (createPatientFromQr_Entity.dob) {
            let originalDateString = createPatientFromQr_Entity.dob;
            const originalDate = moment(originalDateString, 'DD/MM/YYYY');
            formattedDate = originalDate.format('YYYY-MM-DD');
          }
          if (createPatientFromQr_Entity.hidn) {
            let inputString = createPatientFromQr_Entity.hidn
            abha = inputString.replace(/\D/g, '');

          }
          await this.dynamicConnection.query(`update patients set 
          dob = ?,gender = ?,address = ?,ABHA_number = ?,state_code = ?,district_code = ?,dial_code = ?
           where id = ?`,
            [
              formattedDate,
              createPatientFromQr_Entity.gender,
              createPatientFromQr_Entity.address,
              abha,
              createPatientFromQr_Entity.statelgd,
              createPatientFromQr_Entity.distlgd,
              "91",
              patient_id
            ])
          response =
            [{
              "status": "success",
              "messege": "Patient Profile found successfully",
              "patient_type": "old",
              "details": patientDetails
            }]
        }
        else {
          let formattedDate;
          let abha;
          if (createPatientFromQr_Entity.dob) {
            let originalDateString = createPatientFromQr_Entity.dob;
            const originalDate = moment(originalDateString, 'DD/MM/YYYY');
            formattedDate = originalDate.format('YYYY-MM-DD');
          }

          await this.dynamicConnection.query(`INSERT into patients
            (
            patient_name,
            dob,
            mobileno,
            gender,
            address,
            ABHA_number,
            state_code,
            district_code,
            state_name,
            district_name,
            dial_code,
            aayush_unique_id) 
            values(?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              checkinAdminforHos.patient_name,
              formattedDate,
              checkinAdminforHos.mobileno,
              checkinAdminforHos.gender,
              checkinAdminforHos.address,
              checkinAdminforHos.ABHA_number,
              checkinAdminforHos.statelgd,
              checkinAdminforHos.distlgd,
              checkinAdminforHos.state_name,
              checkinAdminforHos.district_name,
              "91",
              checkinAdminforHos.aayush_unique_id
            ]
          )
          response =
            [{
              "status": "success",
              "messege": "Patient Profile found successfully",
              "patient_type": "new",
              "details": patientDetails
            }]
        }
        return response
      } catch (error) {
        return error;
      }
    } catch (error) {

      return [error]
    }
  }


  async CreateManually(PatientEntity: Patient) {



    if (!PatientEntity.dial_code) {
      PatientEntity.dial_code = '91'
    }
    if (PatientEntity.hospital_id) {
      let uuid = uuidv4()
      let response;
      try {
        let adminPatID;
        const [checkOld] = await this.dynamicConnection.query(`SELECT patients.* ,blood_bank_products.name patient_blood_group
      from patients 
      left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.mobileno = ?`, [PatientEntity.mobileno])
        const [checkOldAdmin] = await this.connection.query(`select * from  patients WHERE mobileno = ?`, [PatientEntity.mobileno])
        if (checkOldAdmin) {
          adminPatID = checkOldAdmin.id
          let formattedDate;
          let abha;
          if (PatientEntity.dob) {

            const date = new Date(PatientEntity.dob);

            const DOByear = date.getFullYear();
            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, "0");
            const DOBday = date.getDate().toString().padStart(2, "0");

            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`
          }
          if (PatientEntity.ABHA_number) {
            let inputString = PatientEntity.ABHA_number
            abha = inputString.replace(/\D/g, '');
          }
          if (abha == "" || abha == null) {
            abha = null
          }
          try {
            await this.dynamicConnection.query(
              `update  patients set patient_name = ?,image = ?,dob = ?,
          email = ?,gender = ?,blood_bank_product_id = ?,
          emergency_mobile_no = ?,address = ?,state_code = ?,
          district_code = ?,pincode = ?,ABHA_number = ? ,dial_code = ?,salutation = ?,
          emergency_dial_code = ?,state_name = ?,district_name = ?,aayush_unique_id = ?
          where id = ? `,
              [PatientEntity.patient_name,
              JSON.stringify(PatientEntity.image),
                formattedDate,
              PatientEntity.email,
              PatientEntity.gender,
              PatientEntity.blood_bank_product_id,
              PatientEntity.emergency_mobile_no,
              PatientEntity.address,
              PatientEntity.state_code,
              PatientEntity.district_code,
              PatientEntity.pincode,
                abha,
              PatientEntity.dial_code,
              PatientEntity.salutation,
              PatientEntity.emergency_dial_code,
              PatientEntity.state_name,
              PatientEntity.district_name,
              checkOld.id
              ]
            );
          } catch (error) {
            console.log(error, "err",);
          }
        }
        else {
          let formattedDate;
          let abha;
          if (PatientEntity.dob) {

            const date = new Date(PatientEntity.dob);
            const DOByear = date.getFullYear();
            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, "0");
            const DOBday = date.getDate().toString().padStart(2, "0");
            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`
          }
          try {

            if (abha == "" || abha == null) {
              abha = null
            }
            console.log("inga varudhaaaa");
            let result
            try {
                      let faceID = null;
        if (PatientEntity.image && PatientEntity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(PatientEntity.image)
          faceID = getFaceId?.faceID
        }
              result = await this.dynamicConnection.query(
                `INSERT INTO patients (patient_name,image,faceId,dob,age,
        email,gender,mobileno,blood_bank_product_id,emergency_mobile_no,
        address,state_code,district_code,pincode,ABHA_number,dial_code,
        salutation,emergency_dial_code,state_name,district_name,aayush_unique_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [PatientEntity.patient_name,
                PatientEntity.image,
                faceID,
                  formattedDate,
                PatientEntity.age,
                PatientEntity.email,
                PatientEntity.gender,
                PatientEntity.mobileno,
                PatientEntity.blood_bank_product_id,
                PatientEntity.emergency_mobile_no,
                PatientEntity.address,
                PatientEntity.state_code,
                PatientEntity.district_code,
                PatientEntity.pincode,
                  abha,
                PatientEntity.dial_code,
                PatientEntity.salutation,
                PatientEntity.emergency_dial_code,
                PatientEntity.state_name,
                PatientEntity.district_name,
                  uuid
                ]
              );
            } catch (error) {
              console.log(error, "[[[[[[]]]]]]");
            }

            adminPatID = result.insertId
          } catch (error) {
            response = [error]
          }
        }
        if (checkOld) {
          let formattedDate;
          let abha;
          if (PatientEntity.dob) {

            const date = new Date(PatientEntity.dob);

            const DOByear = date.getFullYear();
            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, "0");
            const DOBday = date.getDate().toString().padStart(2, "0");

            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`
          }
          if (PatientEntity.ABHA_number) {
            let inputString = PatientEntity.ABHA_number
            abha = inputString.replace(/\D/g, '');
          }
          if (abha == "" || abha == null) {
            abha = null
          }

          await this.connection.query(
            `update  patients set patient_name = ?, image = ?,dob = ?,
    email = ?,gender = ?,blood_bank_product_id = ?,
    emergency_mobile_no = ?,address = ?,state_code = ?,
    district_code = ?,pincode = ?,ABHA_number = ? ,dial_code = ?,salutation = ?,
    emergency_dial_code = ?,state_name = ?,district_name = ?
    where id = ? `,
            [PatientEntity.patient_name,
            JSON.stringify(PatientEntity.image),
              formattedDate,
            PatientEntity.email,
            PatientEntity.gender,
            PatientEntity.blood_bank_product_id,
            PatientEntity.emergency_mobile_no,
            PatientEntity.address,
            PatientEntity.state_code,
            PatientEntity.district_code,
            PatientEntity.pincode,
              abha,
            PatientEntity.dial_code,
            PatientEntity.salutation,
            PatientEntity.emergency_dial_code,
            PatientEntity.state_name,
            PatientEntity.district_name,
            checkOldAdmin.id
            ]
          );

          let [abc] = await this.connection.query(`SELECT patients.* ,blood_bank_products.name patient_blood_group
  from patients 
  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.mobileno = ?`, [PatientEntity.mobileno])
          response =
            [{
              "status": "success",
              "messege": "Patient Profile found successfully",
              "patient_type": "old",
              "details": abc
            }]
        }

        else {
          let formattedDate;
          let abha;
          if (PatientEntity.dob) {

            const date = new Date(PatientEntity.dob);
            const DOByear = date.getFullYear();
            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, "0");
            const DOBday = date.getDate().toString().padStart(2, "0");
            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`
          }

          abha = PatientEntity.ABHA_number
          if (abha == "" || abha == null || abha == "null" || abha == "-") {
            abha = null
          }
                      let faceID = null;
        if (PatientEntity.image && PatientEntity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(PatientEntity.image)
          faceID = getFaceId?.faceID
        }
          const result = await this.connection.query(
            `INSERT INTO patients (patient_name,image,faceId,dob,age,
        email,gender,mobileno,blood_bank_product_id,emergency_mobile_no,
        address,state_code,district_code,pincode,ABHA_number,dial_code,salutation,
        emergency_dial_code,state_name,district_name,aayush_unique_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [PatientEntity.patient_name,
            PatientEntity.image,
            faceID,
              formattedDate,
            PatientEntity.age,
            PatientEntity.email,
            PatientEntity.gender,
            PatientEntity.mobileno,
            PatientEntity.blood_bank_product_id,
            PatientEntity.emergency_mobile_no,
            PatientEntity.address,
            PatientEntity.state_code,
            PatientEntity.district_code,
            PatientEntity.pincode,
              abha,
            PatientEntity.dial_code,
            PatientEntity.salutation,
            PatientEntity.emergency_dial_code,
            PatientEntity.state_name,
            PatientEntity.district_name,
              uuid
            ]
          );

          const [details] = await this.connection.query(`SELECT patients.* ,blood_bank_products.name patient_blood_group
    from patients 
    left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`, [result.insertId])

          response =
            [{
              "status": "success",
              "messege": "Patient Profile added successfully",
              "patient_type": "new",
              "details": details
            }];
        }
        return response
      } catch (error) {
        console.log(error);

        return [{
          "error": error,
          "message": "Error in inserting in dynamicDB"
        }]
      }

    }
    else {
      return [{ "message": "Enter hospital_id" }]
    }

  }



  async findQR(token: string) {

    try {
      let query = `select  
    concat("APPN",appointment.id) id,
    patients.id patient_id,
    patients.mobileno,
    patients.aayush_unique_id,
    staff.id doctor_id,
    concat("APPN",appointment.id) appointment_id,
    appointment_queue.position tokenNumber
        from appointment
        left join patients on patients.id = appointment.patient_id
        left join staff on staff.id = appointment.doctor
        left join appointment_queue on appointment.id = appointment_queue.appointment_id                  
        where appointment.id = ? `
      let values = [token]

      const appointment = await this.connection.query(query, values)
      if (!appointment.aayush_unique_id) {
        appointment.aayush_unique_id = 'NA'
      }
      return {
        "QR_Type_ID": 3,
        "QR_Type": "Appointment_QR",
        "Appointment_details": appointment
      }



    } catch (error) {
      return error
    }
  }








}




