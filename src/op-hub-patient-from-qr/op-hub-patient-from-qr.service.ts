import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import moment from 'moment';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  PatientFromQr,
  Patient,
} from './entities/op-hub-patient-from-qr.entity';
import { DoubleMetaphone } from 'natural';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class OpHubPatientFromQrService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async create(createPatientFromQr: PatientFromQr) {
    if (createPatientFromQr.hospital_id) {
      try {
        const checAddressInAdmin = await this.dynamicConnection.query(
          `select
                      coalesce(patients.id,"") id ,
                              concat("PT",patients.id) plenome_patient_id,
                      coalesce(patients.patient_name,"") patient_name,
                      coalesce(date(patients.dob),"") dob,
                      coalesce(patients.age,"") age,
                      coalesce(patients.month,"") month,
                      coalesce(patients.day,"") day, 
                      coalesce(patients.image,"") image,
                      coalesce(patients.mobileno,"") mobileno,
                      coalesce(patients.email,"") email,
                      coalesce(patients.gender,"") gender,
                      coalesce(patients.marital_status,"") marital_status,
                      coalesce(patients.blood_group,"") blood_group,
                      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
                      coalesce(patients.guardian_name,"") guardian_name,
                      coalesce(patients.patient_type,"") patient_type,
                      coalesce(patients.ABHA_number,"") ABHA_number,
                      coalesce(patients.known_allergies,"") known_allergies,
                      coalesce(patients.insurance_id,"") insurance_id,
                      coalesce(patients.insurance_validity,"") insurance_validity,
                      coalesce(patients.is_active,"") is_active,
                      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
                      coalesce(patients.dial_code,"91") dial_code,
                      coalesce(patients.salutation,"") salutation,
                      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
                      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
                      coalesce(blood_bank_products.name,"") patient_blood_group,
                        patients.is_kyc_verified

                      from patients 
                                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
    left join patient_abha_address on patients.id = patient_abha_address.patient_id 
    where patient_abha_address.abhaAddress = ?`,
          [createPatientFromQr.hid],
        );
        if (checAddressInAdmin.length > 0) {
          return [
            {
              status: 'success',
              message: 'patient details found successfully',
              details: checAddressInAdmin,
              verified_abha_address: createPatientFromQr.hid,
            },
          ];
        } else {
          let formattedDate;
          if (createPatientFromQr.dob) {
            const date = new Date(createPatientFromQr.dob);

            const DOByear = date.getFullYear();

            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, '0');

            const DOBday = date.getDate().toString().padStart(2, '0');

            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`;
          }
          if (createPatientFromQr.gender.toLocaleLowerCase() == 'm') {
            createPatientFromQr.gender = 'Male';
          }
          if (createPatientFromQr.gender.toLocaleLowerCase() == 'f') {
            createPatientFromQr.gender = 'Female';
          }
          if (createPatientFromQr.gender.toLocaleLowerCase() == 'o') {
            createPatientFromQr.gender = 'Others';
          }
          const checkPatDetInAdmin = await this.connection.query(
            `select
                      coalesce(patients.id,"") id ,
                              concat("PT",patients.id) plenome_patient_id,
                      coalesce(patients.patient_name,"") patient_name,
                      coalesce(date(patients.dob),"") dob,
                      coalesce(patients.age,"") age,
                      coalesce(patients.month,"") month,
                      coalesce(patients.day,"") day, 
                      coalesce(patients.image,"") image,
                      coalesce(patients.mobileno,"") mobileno,
                      coalesce(patients.email,"") email,
                      coalesce(patients.gender,"") gender,
                      coalesce(patients.marital_status,"") marital_status,
                      coalesce(patients.blood_group,"") blood_group,
                      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
                      coalesce(patients.guardian_name,"") guardian_name,
                      coalesce(patients.patient_type,"") patient_type,
                      coalesce(patients.ABHA_number,"") ABHA_number,
                      coalesce(patients.known_allergies,"") known_allergies,
                      coalesce(patients.insurance_id,"") insurance_id,
                      coalesce(patients.insurance_validity,"") insurance_validity,
                      coalesce(patients.is_active,"") is_active,
                      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
                      coalesce(patients.dial_code,"91") dial_code,
                      coalesce(patients.salutation,"") salutation,
                      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
                      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
                      coalesce(blood_bank_products.name,"") patient_blood_group,
                        patients.is_kyc_verified

                      from patients 
                                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where mobileno = ? and patients.dob = ? and patients.gender = ? and patients.patient_name like ?`,
            [
              createPatientFromQr.mobile,
              formattedDate,
              createPatientFromQr.gender,
              `%${createPatientFromQr.name}%`,
            ],
          );

          if (checkPatDetInAdmin.length > 0) {
            const [hos_patient] = await this.dynamicConnection.query(
              `select
                      coalesce(patients.id,"") id ,
                              concat("PT",patients.id) plenome_patient_id,
                      coalesce(patients.patient_name,"") patient_name,
                      coalesce(date(patients.dob),"") dob,
                      coalesce(patients.age,"") age,
                      coalesce(patients.month,"") month,
                      coalesce(patients.day,"") day, 
                      coalesce(patients.image,"") image,
                      coalesce(patients.mobileno,"") mobileno,
                      coalesce(patients.email,"") email,
                      coalesce(patients.gender,"") gender,
                      coalesce(patients.marital_status,"") marital_status,
                      coalesce(patients.blood_group,"") blood_group,
                      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
                      coalesce(patients.guardian_name,"") guardian_name,
                      coalesce(patients.patient_type,"") patient_type,
                      coalesce(patients.ABHA_number,"") ABHA_number,
                      coalesce(patients.known_allergies,"") known_allergies,
                      coalesce(patients.insurance_id,"") insurance_id,
                      coalesce(patients.insurance_validity,"") insurance_validity,
                      coalesce(patients.is_active,"") is_active,
                      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
                      coalesce(patients.dial_code,"91") dial_code,
                      coalesce(patients.salutation,"") salutation,
                      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
                      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
                      coalesce(blood_bank_products.name,"") patient_blood_group,
                        patients.is_kyc_verified

                      from patients 
                                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
                                   where aayush_unique_id = ? `,
              [checkPatDetInAdmin[0].aayush_unique_id],
            );
            if (hos_patient) {
              const inserted_value = await this.dynamicConnection.query(
                `insert into patient_abha_address (abhaAddress, patient_id) values (?,?)`,
                [createPatientFromQr.hid, hos_patient.id],
              );
              return [
                {
                  status: 'success',
                  message: 'patient details found successfully',
                  details: hos_patient,
                  verified_abha_address: createPatientFromQr.hid,
                },
              ];
            } else {
              let abha;
              if (createPatientFromQr.hidn) {
                let inputString = createPatientFromQr.hidn;
                abha = inputString;
              }
              const insertHos = await this.dynamicConnection.query(
                `INSERT into patients(
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
              aayush_unique_id
              ) values(?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  createPatientFromQr.name,
                  formattedDate,
                  createPatientFromQr.mobile,
                  createPatientFromQr.gender,
                  createPatientFromQr.address,
                  abha,
                  createPatientFromQr.statelgd,
                  createPatientFromQr.distlgd,
                  createPatientFromQr['state name'],
                  createPatientFromQr.district_name,
                  checkPatDetInAdmin[0].aayush_unique_id,
                ],
              );
              const insert_data = await this.dynamicConnection.query(
                `insert into patient_abha_address (abhaAddress, patient_id) values (?,?)`,
                [createPatientFromQr.hid, insertHos.insertId],
              );
              const getAayushUniqueId = await this.dynamicConnection.query(
                `select
                      coalesce(patients.id,"") id ,
                              concat("PT",patients.id) plenome_patient_id,
                      coalesce(patients.patient_name,"") patient_name,
                      coalesce(date(patients.dob),"") dob,
                      coalesce(patients.age,"") age,
                      coalesce(patients.month,"") month,
                      coalesce(patients.day,"") day, 
                      coalesce(patients.image,"") image,
                      coalesce(patients.mobileno,"") mobileno,
                      coalesce(patients.email,"") email,
                      coalesce(patients.gender,"") gender,
                      coalesce(patients.marital_status,"") marital_status,
                      coalesce(patients.blood_group,"") blood_group,
                      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
                      coalesce(patients.guardian_name,"") guardian_name,
                      coalesce(patients.patient_type,"") patient_type,
                      coalesce(patients.ABHA_number,"") ABHA_number,
                      coalesce(patients.known_allergies,"") known_allergies,
                      coalesce(patients.insurance_id,"") insurance_id,
                      coalesce(patients.insurance_validity,"") insurance_validity,
                      coalesce(patients.is_active,"") is_active,
                      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
                      coalesce(patients.dial_code,"91") dial_code,
                      coalesce(patients.salutation,"") salutation,
                      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
                      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
                      coalesce(blood_bank_products.name,"") patient_blood_group,
                        patients.is_kyc_verified

                      from patients 
                                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`,
                [insertHos.insertId],
              );
              return [
                {
                  status: 'success',
                  message: 'patient details found successfully',
                  aayush_unique_id: getAayushUniqueId,
                  verified_abha_address: createPatientFromQr.hid,
                },
              ];
            }
          } else {
            let uuid = uuidv4();

            let formattedDate;
            let abha;

            if (createPatientFromQr.dob) {
              const [day, month, year] = createPatientFromQr.dob.split('-');
              if (year.length == 4) {
                formattedDate = `${year}-${month}-${day}`;
              }
              formattedDate = createPatientFromQr.dob;
            }
            if (createPatientFromQr.hidn) {
              let inputString = createPatientFromQr.hidn;
              abha = inputString;
            }
            if (abha == '' || abha == '-') {
              abha = null;
            }
            if (createPatientFromQr.gender.toLocaleLowerCase() == 'm') {
              createPatientFromQr.gender = 'Male';
            }
            if (createPatientFromQr.gender.toLocaleLowerCase() == 'f') {
              createPatientFromQr.gender = 'Female';
            }
            if (createPatientFromQr.gender.toLocaleLowerCase() == 'o') {
              createPatientFromQr.gender = 'Others';
            }

            const insertAdmin = await this.connection.query(
              `INSERT into patients(
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
              aayush_unique_id
              ) values(?,?,?,?,?,?,?,?,?,?,?)`,
              [
                createPatientFromQr.name,
                formattedDate,
                createPatientFromQr.mobile,
                createPatientFromQr.gender,
                createPatientFromQr.address,
                abha,
                createPatientFromQr.statelgd,
                createPatientFromQr.distlgd,
                createPatientFromQr['state name'],
                createPatientFromQr.district_name,
                uuid,
              ],
            );
            const insertHos = await this.dynamicConnection.query(
              `INSERT into patients(
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
              aayush_unique_id
              ) values(?,?,?,?,?,?,?,?,?,?,?)`,
              [
                createPatientFromQr.name,
                formattedDate,
                createPatientFromQr.mobile,
                createPatientFromQr.gender,
                createPatientFromQr.address,
                abha,
                createPatientFromQr.statelgd,
                createPatientFromQr.distlgd,
                createPatientFromQr['state name'],
                createPatientFromQr.district_name,
                uuid,
              ],
            );
            await this.dynamicConnection.query(
              `insert into patient_abha_address (abhaAddress, patient_id) values (?,?)`,
              [createPatientFromQr.hid, insertHos.insertId],
            );
            const getAayushUniqueId = await this.dynamicConnection.query(
              `select
                      coalesce(patients.id,"") id ,
                              concat("PT",patients.id) plenome_patient_id,
                      coalesce(patients.patient_name,"") patient_name,
                      coalesce(date(patients.dob),"") dob,
                      coalesce(patients.age,"") age,
                      coalesce(patients.month,"") month,
                      coalesce(patients.day,"") day, 
                      coalesce(patients.image,"") image,
                      coalesce(patients.mobileno,"") mobileno,
                      coalesce(patients.email,"") email,
                      coalesce(patients.gender,"") gender,
                      coalesce(patients.marital_status,"") marital_status,
                      coalesce(patients.blood_group,"") blood_group,
                      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
                      coalesce(patients.guardian_name,"") guardian_name,
                      coalesce(patients.patient_type,"") patient_type,
                      coalesce(patients.ABHA_number,"") ABHA_number,
                      coalesce(patients.known_allergies,"") known_allergies,
                      coalesce(patients.insurance_id,"") insurance_id,
                      coalesce(patients.insurance_validity,"") insurance_validity,
                      coalesce(patients.is_active,"") is_active,
                      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
                      coalesce(patients.dial_code,"91") dial_code,
                      coalesce(patients.salutation,"") salutation,
                      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
                      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
                      coalesce(blood_bank_products.name,"") patient_blood_group,
                        patients.is_kyc_verified

                      from patients 
                                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`,
              [insertHos.insertId],
            );
            return [
              {
                status: 'success',
                message: 'patient details found successfully',
                aayush_unique_id: getAayushUniqueId,
                verified_abha_address: createPatientFromQr.hid,
              },
            ];
          }
        }
      } catch (error) {
        return [
          {
            status: 'failed',
            message: 'unable to fetch patient data',
            error: error,
          },
        ];
      }
    } else {
      return [{ message: 'Enter hospital_id' }];
    }
  }

  async CreateManually(PatientEntity: Patient) {
    if (!PatientEntity.dial_code) {
      PatientEntity.dial_code = '91';
    }
    if (PatientEntity.gender.toLocaleLowerCase() == 'm') {
      PatientEntity.gender = 'Male';
    }
    if (PatientEntity.gender.toLocaleLowerCase() == 'f') {
      PatientEntity.gender = 'Female';
    }
    if (PatientEntity.gender.toLocaleLowerCase() == 'o') {
      PatientEntity.gender = 'Others';
    }
    if (PatientEntity.hospital_id) {
      let uuid = uuidv4();
      try {
        let response;
        try {
          let formattedDate;
          let abha;
          if (PatientEntity.dob) {
            const date = new Date(PatientEntity.dob);
            const DOByear = date.getFullYear();
            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, '0');
            const DOBday = date.getDate().toString().padStart(2, '0');
            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`;
          }
          if (PatientEntity.ABHA_number) {
            let inputString = PatientEntity.ABHA_number;
            abha = inputString;
          }
          if (abha == '' || abha == null) {
            abha = null;
          }
          const checkAdmin = await this.connection.query(
            `select
      coalesce(patients.id,"") id ,
              concat("PT",patients.id) plenome_patient_id,
      coalesce(patients.patient_name,"") patient_name,
      coalesce(date(patients.dob)) dob,
      coalesce(patients.age,"") age,
      coalesce(patients.month,"") month,
      coalesce(patients.day,"") day, 
      coalesce(patients.image,"") image,
      coalesce(patients.mobileno,"") mobileno,
      coalesce(patients.email,"") email,
      coalesce(patients.gender,"") gender,
      coalesce(patients.marital_status,"") marital_status,
      coalesce(patients.blood_group,"") blood_group,
      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
      coalesce(patients.guardian_name,"") guardian_name,
      coalesce(patients.patient_type,"") patient_type,
      coalesce(patients.ABHA_number,"") ABHA_number,
      coalesce(patients.known_allergies,"") known_allergies,
      coalesce(patients.insurance_id,"") insurance_id,
      coalesce(patients.insurance_validity,"") insurance_validity,
      coalesce(patients.is_active,"") is_active,
      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
      coalesce(patients.dial_code,"91") dial_code,
      coalesce(patients.salutation,"") salutation,
      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
      coalesce(blood_bank_products.name,"") patient_blood_group,
        patients.is_kyc_verified

      from patients 
                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where mobileno = ?`,
            [PatientEntity.mobileno],
          );

          const doubleMetaphone = new DoubleMetaphone();
          for (const a of await checkAdmin) {
            const date = new Date(a?.dob);
            date.setDate(date.getDate() + 1);
            const dateOnly = date.toISOString().split('T')[0];
            if (
              a.gender == PatientEntity.gender &&
              (dateOnly == PatientEntity.dob || a.age == PatientEntity.age)
            ) {
              const [primary1, secondary1] = doubleMetaphone.process(
                a.patient_name,
              );
              const [primary2, secondary2] = doubleMetaphone.process(
                PatientEntity.patient_name,
              );
              const phoneticMatch =
                primary1 === primary2 ||
                primary1 === secondary2 ||
                secondary1 === primary2 ||
                secondary1 === secondary2;
              if (phoneticMatch) {
                return [
                  {
                    status: 'failed',
                    message:
                      'patient already exists with same gender and same dob/age and same name on this mobile number',
                    existing_patient_details: a,
                  },
                ];
              }
            }
          }
          let faceID = null;
          if (PatientEntity.image && PatientEntity.image.trim() != '') {
            const getFaceId = await this.addAppointmentService.getfaceID(
              PatientEntity.image,
            );
            faceID = getFaceId?.faceID;
          }
          await this.connection.query(
            `INSERT INTO patients (patient_name,image,faceId,dob,age,
        email,gender,mobileno,blood_bank_product_id,emergency_mobile_no,
        address,state_code,district_code,pincode,ABHA_number,dial_code,
        salutation,emergency_dial_code,state_name,district_name,aayush_unique_id,insurance_id,insurance_validity,known_allergies)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              PatientEntity.patient_name,
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
              uuid,
              PatientEntity.insurance_id,
              PatientEntity.insurance_validity,
              PatientEntity.known_allergies,
            ],
          );

          const insertHos = await this.dynamicConnection.query(
            `INSERT INTO patients (patient_name,image,faceId,dob,age,
        email,gender,mobileno,blood_bank_product_id,emergency_mobile_no,
        address,state_code,district_code,pincode,ABHA_number,dial_code,
        salutation,emergency_dial_code,state_name,district_name,aayush_unique_id,insurance_id,insurance_validity,known_allergies)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              PatientEntity.patient_name,
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
              uuid,
              PatientEntity.insurance_id,
              PatientEntity.insurance_validity,
              PatientEntity.known_allergies,
            ],
          );

          const [details] = await this.dynamicConnection.query(
            `select
      coalesce(patients.id,"") id ,
              concat("PT",patients.id) plenome_patient_id,
      coalesce(patients.patient_name,"") patient_name,
      coalesce(date(patients.dob),"") dob,
      coalesce(patients.age,"") age,
      coalesce(patients.month,"") month,
      coalesce(patients.day,"") day, 
      coalesce(patients.image,"") image,
      coalesce(patients.mobileno,"") mobileno,
      coalesce(patients.email,"") email,
      coalesce(patients.gender,"") gender,
      coalesce(patients.marital_status,"") marital_status,
      coalesce(patients.blood_group,"") blood_group,
      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
      coalesce(patients.guardian_name,"") guardian_name,
      coalesce(patients.patient_type,"") patient_type,
      coalesce(patients.ABHA_number,"") ABHA_number,
      coalesce(patients.known_allergies,"") known_allergies,
      coalesce(patients.insurance_id,"") insurance_id,
      coalesce(patients.insurance_validity,"") insurance_validity,
      coalesce(patients.is_active,"") is_active,
      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
      coalesce(patients.dial_code,"91") dial_code,
      coalesce(patients.salutation,"") salutation,
      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
      coalesce(blood_bank_products.name,"") patient_blood_group,
        patients.is_kyc_verified

      from patients 
                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
                  where patients.id = ?`,
            [insertHos.insertId],
          );
          const getAbhaAddress = await this.dynamicConnection.query(
            `select abhaAddress from patient_abha_address where patient_id = ?`,
            [insertHos.insertId],
          );
          details.pat_abha_address = await getAbhaAddress;
          const out = await details;

          response = [
            {
              status: 'success',
              messege: 'Patient Profile added successfully',
              patient_type: 'new',
              details: out,
            },
          ];

          return response;
        } catch (error) {
          return [
            {
              status: 'failed',
              error: error,
              message: 'unable to add patient profile',
            },
          ];
        }
      } catch (error) {
        return [error];
      }
    } else {
      return [{ message: 'Enter hospital_id' }];
    }
  }

  async checkWithDetails(PatientEntity: Patient) {
    if (!PatientEntity.dial_code) {
      PatientEntity.dial_code = '91';
    }
    if (
      PatientEntity.gender.toLocaleLowerCase() == 'm' ||
      PatientEntity.gender.toLocaleLowerCase() == 'male'
    ) {
      PatientEntity.gender = 'Male';
    }
    if (
      PatientEntity.gender.toLocaleLowerCase() == 'f' ||
      PatientEntity.gender.toLocaleLowerCase() == 'female'
    ) {
      PatientEntity.gender = 'Female';
    }
    if (
      PatientEntity.gender.toLocaleLowerCase() == 'o' ||
      PatientEntity.gender.toLocaleLowerCase() == 'others'
    ) {
      PatientEntity.gender = 'Others';
    }
    if (PatientEntity.hospital_id) {
      try {
        try {
          let formattedDate;
          let abha;
          if (PatientEntity.dob) {
            const date = new Date(PatientEntity.dob);
            const DOByear = date.getFullYear();
            const DOBmonth = (date.getMonth() + 1).toString().padStart(2, '0');
            const DOBday = date.getDate().toString().padStart(2, '0');
            formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`;
          }
          if (PatientEntity.ABHA_number) {
            let inputString = PatientEntity.ABHA_number;
            abha = inputString;
          }
          if (abha == '' || abha == null) {
            abha = null;
          }

          const checkAdmin = await this.connection.query(
            `select
      coalesce(patients.id,"") id ,
              concat("PT",patients.id) plenome_patient_id,
      coalesce(patients.patient_name,"") patient_name,
      coalesce(date(patients.dob)) dob,
      coalesce(patients.age,"") age,
      coalesce(patients.month,"") month,
      coalesce(patients.day,"") day, 
      coalesce(patients.image,"") image,
      coalesce(patients.mobileno,"") mobileno,
      coalesce(patients.email,"") email,
      coalesce(patients.gender,"") gender,
      coalesce(patients.marital_status,"") marital_status,
      coalesce(patients.blood_group,"") blood_group,
      coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.pincode,"")),"") address,
      coalesce(patients.guardian_name,"") guardian_name,
      coalesce(patients.patient_type,"") patient_type,
      coalesce(patients.ABHA_number,"") ABHA_number,
      coalesce(patients.known_allergies,"") known_allergies,
      coalesce(patients.insurance_id,"") insurance_id,
      coalesce(patients.insurance_validity,"") insurance_validity,
      coalesce(patients.is_active,"") is_active,
      coalesce(patients.aayush_unique_id,"") aayush_unique_id,
      coalesce(patients.dial_code,"91") dial_code,
      coalesce(patients.salutation,"") salutation,
      coalesce(patients.emergency_dial_code,"") emergency_dial_code,
      coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
      coalesce(blood_bank_products.name,"") patient_blood_group,
        patients.is_kyc_verified

      from patients 
                  left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id 
                  where mobileno = ? and dob = ? and gender = ?`,
            [PatientEntity.mobileno, formattedDate, PatientEntity.gender],
          );

          const doubleMetaphone = new DoubleMetaphone();
          for (const a of await checkAdmin) {
            const date = new Date(a?.dob);
            date.setDate(date.getDate() + 1);
            const dateOnly = date.toISOString().split('T')[0];
            if (
              a.gender == PatientEntity.gender &&
              (dateOnly == PatientEntity.dob || a.age == PatientEntity.age)
            ) {
              const [primary1, secondary1] = doubleMetaphone.process(
                a.patient_name,
              );
              const [primary2, secondary2] = doubleMetaphone.process(
                PatientEntity.patient_name,
              );
              const phoneticMatch =
                primary1 === primary2 ||
                primary1 === secondary2 ||
                secondary1 === primary2 ||
                secondary1 === secondary2;

              if (phoneticMatch) {
                return [
                  {
                    status_code: 200,
                    status: 'failed',
                    message:
                      'patient already exists with same gender and same dob/age and same name on this mobile number',
                    existing_patient_details: a,
                  },
                ];
              }
            }
          }
          return [
            {
              status_code: 404,
              status: 'success',
              message: 'patient not found with the given details',
            },
          ];
        } catch (error) {
          return [
            {
              status: 'failed',
              error: error,
              message: 'unable to add patient profile',
            },
          ];
        }
      } catch (error) {
        return [error];
      }
    } else {
      return [{ message: 'Enter hospital_id' }];
    }
  }
}
