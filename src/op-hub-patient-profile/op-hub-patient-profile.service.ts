import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { parse, format } from 'date-fns';
import {
  Patientprofile,
  ABHAProfile,
} from './entities/op-hub-patient-profile.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class OpHubPatientProfileService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async getPatientDetails(patientId: number, Hospital_id: number) {
    if (Hospital_id) {
      try {
        try {
          const patient = await this.dynamicConnection.query(
            `select
coalesce(patients.id,"") id ,
  concat("PT",patients.id) plenome_patient_id,
coalesce(patients.patient_name,"") patient_name,
coalesce( DATE(patients.dob),"") dob,
coalesce(patients.age,"") age,
coalesce(patients.month,"") month,
coalesce(patients.day,"") day, 
coalesce(patients.image,"") image,
coalesce(patients.mobileno,"") mobileno,
coalesce(patients.email,"") email,
coalesce(patients.gender,"") gender,
coalesce(patients.marital_status,"") marital_status,
coalesce(patients.blood_group,"") blood_group,
coalesce(patients.address,"") address,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.state_name,"") state_code,
coalesce(patients.district_name,"") district_code,
coalesce(patients.pincode,"") pincode,
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
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.id = ?`,
            [patientId],
          );
          if (patient.length == 0) {
            return {
              status: 'failed',
              message: 'Patient not found',
            };
          }
          let patientDetails: any;
          patientDetails = {
            patient: patient[0],
          };
          return patientDetails;
        } catch (error) {
          return [
            {
              status: 'failed',
              message: `Error fetching patient details: ${error.message}`,
            },
          ];
        }
      } catch (error) {
        return [
          {
            status: 'failed',
            message: `Error in getPatientDetails: ${error}`,
          },
        ];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get patient details',
        },
      ];
    }
  }

  async updatePatientDetails(
    patientId: number,
    Entity: Patientprofile,
    Hospital_id: number,
  ) {
    if (Hospital_id) {
      try {
        let abha;
        abha = Entity.ABHA_number;
        if (abha == '' || abha == null || abha == 'null' || abha == '-') {
          abha = null;
        }
        const [check_kyc_verified] = await this.dynamicConnection.query(
          `select * from patients where id = ?`,
          [patientId],
        );
        let faceID = null;
        if (Entity.image && Entity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            Entity.image,
          );
          faceID = getFaceId?.faceID;
        }
        if (check_kyc_verified.is_kyc_verified == 0) {
          await this.dynamicConnection.query(
            `update patients set patient_name = ?,dob = ?,age = ?,email = ?,ABHA_number = ?,
    image = ?,faceId = ?,blood_bank_product_id = ?,gender = ?,emergency_mobile_no = ?,address = ?,insurance_id = ?,
    insurance_validity = ?,abha_address = ?,salutation = ?,known_allergies = ? where id = ?`,
            [
              Entity.patient_name,
              Entity.dob,
              Entity.age,
              Entity.email,
              abha,
              Entity.image,
              faceID,
              Entity.blood_bank_product_id,
              Entity.gender,
              Entity.emergency_mobile_no,
              Entity.address,
              Entity.insurance_id,
              Entity.insurance_validity,
              Entity.abha_address,
              Entity.salutation,
              Entity.known_allergies,
              patientId,
            ],
          );
        } else {
          if (
            check_kyc_verified.patient_name == Entity.patient_name &&
            check_kyc_verified.dob.toLocaleDateString('en-CA').split('T')[0] ==
              Entity.dob &&
            check_kyc_verified.gender == Entity.gender
            // && check_kyc_verified.district_code == Entity.district_code
            // && check_kyc_verified.state_code == Entity.state_code
            // && (check_kyc_verified.pincode || "") == (Entity.pincode || "")
            // && (check_kyc_verified.state_name || "") == (Entity.state_name || "")
            // && (check_kyc_verified.district_name || "") == (Entity.district_name || "")  anha change requested by matheshwari
          ) {
            await this.dynamicConnection.query(
              `update patients set patient_name = ?,faceId = ?,dob = ?,age = ?,email = ?,ABHA_number = ?,
    image = ?,blood_bank_product_id = ?,gender = ?,emergency_mobile_no = ?,address = ?,insurance_id = ?,
    insurance_validity = ?,abha_address = ?,salutation = ?,known_allergies = ?,state_name = ?,district_name = ?,district_code = ?,state_code = ? where id = ?`,
              [
                Entity.patient_name,
                faceID,
                Entity.dob,
                Entity.age,
                Entity.email,
                abha,
                Entity.image,
                Entity.blood_bank_product_id,
                Entity.gender,
                Entity.emergency_mobile_no,
                Entity.address,
                Entity.insurance_id,
                Entity.insurance_validity,
                Entity.abha_address,
                Entity.salutation,
                Entity.known_allergies,
                Entity.state_name,
                Entity.district_name,
                Entity.district_code,
                Entity.state_code,
                patientId,
              ],
            );
          } else {
            return {
              status: 'failed',
              message: 'cannot update kyc verified details',
            };
          }
        }
        let [patDet] = await this.dynamicConnection.query(
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
coalesce(patients.address,"") address,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.state_code,"") state_code,
coalesce(patients.district_code,"") district_code,
coalesce(patients.pincode,"") pincode,
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
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.id = ?`,
          [patientId],
        );

        return [
          {
            status: 'success',
            message: 'Patient Profile Updated successfully',
            updated_Patient_Profile: patDet,
          },
        ];
      } catch (error) {
        return [error];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to update the appointment ',
        },
      ];
    }
  }

  async updateOnlyAbhaNumber(aayush_unique_id: any, abhaNumber: any) {
    try {
      await this.dynamicConnection.query(
        `update patients set ABHA_number = '${abhaNumber}' where aayush_unique_id = '${aayush_unique_id}'`,
      );
      return {
        status: 'success',
        message: 'ABHA number updated successfully',
      };
    } catch (error) {
      return error;
    }
  }

  async updatePatientABHAaddress(
    patientId: number,
    Entity: Patientprofile,
    Hospital_id: number,
  ) {
    try {
      if (Hospital_id) {
        try {
          await this.dynamicConnection.query(
            `insert into patient_abha_address (abhaAddress,
        patient_id)`,
            [Entity.abha_address, patientId],
          );
          const [getHosPatientMobile] = await this.dynamicConnection.query(
            `select
coalesce(patients.id,"") id ,
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
coalesce(patients.address,"") address,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.state_name,"") state_code,
coalesce(patients.district_name,"") district_code,
coalesce(patients.pincode,"") pincode,
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
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`,
            [patientId],
          );
          let mobile = getHosPatientMobile.aayush_unique_id;
          const [getAdminPatientId] = await this.connection.query(
            `select
coalesce(patients.id,"") id ,
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
coalesce(patients.address,"") address,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.state_name,"") state_code,
coalesce(patients.district_name,"") district_code,
coalesce(patients.pincode,"") pincode,
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
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where aayush_unique_id = ?`,
            [mobile],
          );
          let pat_id = getAdminPatientId.id;

          await this.connection.query(
            `insert into patient_abha_address (abhaAddress,
        patient_id)`,
            [Entity.abha_address, pat_id],
          );

          let [patDet] = await this.dynamicConnection.query(
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
coalesce(patients.address,"") address,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.state_name,"") state_code,
coalesce(patients.district_name,"") district_code,
coalesce(patients.pincode,"") pincode,
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
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.id = ?`,
            [patientId],
          );

          return [
            {
              status: 'success',
              message: 'Patient Profile Updated successfully',
              updated_Patient_Profile: patDet,
            },
          ];
        } catch (error) {
          return [error];
        }
      } else {
        return [
          {
            status: 'failed',
            message: 'Enter hospital_id to update the appointment ',
          },
        ];
      }
    } catch (error) {
      return [error];
    }
  }

  async updatePatientABHANumber(
    patientId: number,
    Entity: ABHAProfile,
    Hospital_id: number,
  ) {
    try {
      if (Hospital_id) {
        try {
          const checkDuplicateAbhaNumber = await this.dynamicConnection.query(
            `select id from patients where ABHA_number = ? and id <> ?`,
            [Entity.ABHANumber, patientId],
          );
          if (checkDuplicateAbhaNumber.length > 0) {
            return {
              status: 'failed',
              message: 'ABHA Number already linked to another patient',
            };
          }
          if (Entity.dob) {
            try {
              const inputDate = Entity.dob;
              const parsedDate = parse(inputDate, 'dd-MM-yyyy', new Date());
              Entity.dob = format(parsedDate, 'yyyy-MM-dd');
            } catch (error) {
              Entity.dob = Entity.dob;
            }
          }

          if (
            Entity.gender == 'M' ||
            Entity.gender.toLocaleLowerCase() == 'male'
          ) {
            Entity.gender = 'Male';
            Entity.salutation = 'Mr';
          } else if (
            Entity.gender == 'F' ||
            Entity.gender.toLocaleLowerCase() == 'female'
          ) {
            Entity.gender = 'Female';
            Entity.salutation = 'Ms';
          } else if (
            Entity.gender == 'O' ||
            Entity.gender.toLocaleLowerCase() == 'others'
          ) {
            Entity.gender = 'Others';
            Entity.salutation = 'Ms';
          }

          if (!Entity.ABHANumber) {
            Entity.ABHANumber = null;
          }
          if (!Entity.firstName) {
            Entity.firstName = '';
          }
          if (!Entity.middleName) {
            Entity.middleName = '';
          }
          if (!Entity.lastName) {
            Entity.lastName = '';
          }
          if (!Entity.address) {
            Entity.address = '';
          }
          if (!Entity.pinCode) {
            Entity.pinCode = null;
          }
          if (!Entity.stateCode) {
            Entity.stateCode = null;
          }
          if (!Entity.districtCode) {
            Entity.districtCode = null;
          }
          if (!Entity.stateName) {
            Entity.stateName = '';
          }
          if (!Entity.districtName) {
            Entity.districtName = '';
          }
          let query = `update patients set ABHA_number = ?,
          patient_name = ?,
          dob = ?,
          image = ?,
          gender = ?,
          address = ?,
          pincode = ?,
          state_code = ?,
          district_code = ?,
          state_name = ?,
          district_name = ?,
          is_kyc_verified = 1,
          salutation = ?`;
          let values = [
            Entity.ABHANumber,
            Entity.firstName + ' ' + Entity.middleName + ' ' + Entity.lastName,
            Entity.dob,
            Entity.image,
            Entity.gender,
            Entity.address,
            Entity.pinCode,
            Entity.stateCode,
            Entity.districtCode,
            Entity.stateName,
            Entity.districtName,
            Entity.salutation,
          ];

          if (Entity.mobile) {
            query += `, emergency_mobile_no = ?`;
            values.push(Entity.mobile);
          }
          let where = `where id = ${patientId}`;

          let final_query = query + where;
          await this.dynamicConnection.query(final_query, values);

          const [getHosPatientMobile] = await this.dynamicConnection.query(
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
coalesce(patients.address,"") address,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.state_name,"") state_code,
coalesce(patients.district_name,"") district_code,
coalesce(patients.pincode,"") pincode,
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
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`,
            [patientId],
          );

          let mobile = getHosPatientMobile.aayush_unique_id;
          const [getAdminPatientId] = await this.connection.query(
            `select id from patients where aayush_unique_id = ?`,
            [mobile],
          );

          let pat_id = getAdminPatientId.id;
          let Adminwhere = `where id = ${pat_id}`;

          let finalAdminQuery = query + Adminwhere;
          await this.connection.query(finalAdminQuery, values);

          return [
            {
              status: 'success',
              message: 'Patient Profile Updated successfully',
              updated_Patient_Profile: getHosPatientMobile,
            },
          ];
        } catch (error) {
          return [error];
        }
      } else {
        return [
          {
            status: 'failed',
            message: 'Enter hospital_id to update the appointment ',
          },
        ];
      }
    } catch (error) {
      return [error];
    }
  }

  async updatePatientVerifyABHANumber(
    patientId: number,
    Entity: ABHAProfile,
    Hospital_id: number,
  ) {
    try {
      if (Hospital_id) {
        try {
          if (Entity.dob) {
            const inputDate = Entity.dob;
            const parsedDate = parse(inputDate, 'dd-MM-yyyy', new Date());
            Entity.dob = format(parsedDate, 'yyyy-MM-dd');
          }
          if (Entity.gender == 'M') {
            Entity.gender = 'Male';
          } else if (Entity.gender == 'F') {
            Entity.gender = 'Female';
          } else if (Entity.gender == 'O') {
            Entity.gender = 'Others';
          }
          await this.dynamicConnection.query(
            `update patients set ABHA_number = ?,
            patient_name = ?,
            image = ?            
            where id = ?`,
            [Entity.ABHANumber, Entity.name, Entity.image, patientId],
          );

          const [getHosPatientMobile] = await this.dynamicConnection.query(
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
  coalesce(patients.address,"") address,
  coalesce(patients.state_name,"") state_name,
  coalesce(patients.district_name,"") district_name,
  coalesce(patients.state_name,"") state_code,
  coalesce(patients.district_name,"") district_code,
  coalesce(patients.pincode,"") pincode,
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
  coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
  coalesce(blood_bank_products.name,"") patient_blood_group,
  patients.is_kyc_verified
  from patients 
              left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`,
            [patientId],
          );
          let mobile = getHosPatientMobile.aayush_unique_id;
          const [getAdminPatientId] = await this.connection.query(
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
  coalesce(patients.address,"") address,
  coalesce(patients.state_name,"") state_name,
  coalesce(patients.district_name,"") district_name,
  coalesce(patients.state_name,"") state_code,
  coalesce(patients.district_name,"") district_code,
  coalesce(patients.pincode,"") pincode,
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
  coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
  coalesce(blood_bank_products.name,"") patient_blood_group,
  patients.is_kyc_verified
  from patients 
              left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where aayush_unique_id = ?`,
            [mobile],
          );
          let pat_id = getAdminPatientId.id;

          await this.connection.query(
            `update patients set ABHA_number = ?,
            patient_name = ? ,
            image = ?          
            where id = ?`,
            [Entity.ABHANumber, Entity.name, Entity.image, pat_id],
          );

          let [patDet] = await this.dynamicConnection.query(
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
  coalesce(patients.address,"") address,
  coalesce(patients.state_name,"") state_name,
  coalesce(patients.district_name,"") district_name,
  coalesce(patients.state_name,"") state_code,
  coalesce(patients.district_name,"") district_code,
  coalesce(patients.pincode,"") pincode,
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
  coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
  coalesce(blood_bank_products.name,"") patient_blood_group,
    patients.is_kyc_verified

  from patients 
              left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id WHERE patients.id = ?`,
            [patientId],
          );

          return [
            {
              status: 'success',
              message: 'Patient Profile Updated successfully',
              updated_Patient_Profile: patDet,
            },
          ];
        } catch (error) {
          return [error];
        }
      } else {
        return [
          {
            status: 'failed',
            message: 'Enter hospital_id to update the appointment ',
          },
        ];
      }
    } catch (error) {
      return [error];
    }
  }

  async getRegistrationStatus(abhaDetails: any, hospital_id: number) {
    try {
      abhaDetails = abhaDetails.abhaDetails;

      let getMobileNo = abhaDetails[0].mobile;
      let data = abhaDetails[0];
      for (const patDetailsFromABHA of data.ABHA) {
        if (patDetailsFromABHA.gender.toUpperCase() == 'M') {
          patDetailsFromABHA.gender = 'Male';
        } else if (patDetailsFromABHA.gender.toUpperCase() == 'F') {
          patDetailsFromABHA.gender = 'Female';
        } else if (patDetailsFromABHA.gender.toUpperCase() == 'O') {
          patDetailsFromABHA.gender = 'Others';
        }
        const getPatientDetails = await this.dynamicConnection.query(
          `select id from patients where
         mobileno = ? and
          gender = ? and
           patient_name like ?`,
          [
            getMobileNo,
            patDetailsFromABHA.gender,
            '%' + patDetailsFromABHA.name + '%',
          ],
        );
        if (getPatientDetails.length > 0) {
          patDetailsFromABHA.RegistrationStatus = 'Registered';
        } else {
          patDetailsFromABHA.RegistrationStatus = 'Not Registered';
        }
      }
      return {
        status: 'success',
        data: await abhaDetails,
      };
    } catch (error) {
      return {
        status: 'failed',
        message: `Error in getRegistrationStatus: ${error}`,
      };
    }
  }
}
