import { forwardRef, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class OpHubGetPatientDetailsByAayushUniqueIdService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async findAll(aayush_unique_id: string, hospital_id: number) {
    try {
      console.log('good friday!');

      const [PatientEntity] = await this.connection.query(
        `
        select
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
    coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.state_name,"")," ",coalesce(patients.pincode,"")),"") address,
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
    patients.blood_bank_product_id,
    patients.is_kyc_verified
    from patients
                left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
                where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      const [checkHos] = await this.dynamicConnection.query(
        `select
coalesce(patients.id,"") id ,
        concat("PT",patients.id) plenome_patient_id,
coalesce(patients.patient_name,"") patient_name,
coalesce(DATE(patients.dob) ,"") dob,
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      let resp: any;
      if (checkHos) {
        if (PatientEntity.insurance_validity == '') {
          PatientEntity.insurance_validity = null;
        }
        if (PatientEntity.dob == '') {
          PatientEntity.dob = null;
        }
        if (PatientEntity.ABHA_number == '') {
          PatientEntity.ABHA_number = null;
        }
        //   if (checkHos.is_kyc_verified == 0) {
        //     await this.dynamicConnection.query(`update patients set image = ?,patient_name = ?,dob = ?,
        //       email = ?,ABHA_number = ?,
        // blood_bank_product_id = ?,gender = ?,emergency_mobile_no = ?,emergency_dial_code = ?,address = ?,insurance_id = ?,
        // insurance_validity = ?,dial_code = ?,salutation = ?,state_name = ?,district_name = ?,pincode = ?,
        // state_code = ?,district_code = ?
        //  where id = ?`, [PatientEntity.image,
        //     PatientEntity.patient_name,
        //     PatientEntity.dob,
        //     PatientEntity.email,
        //     PatientEntity.ABHA_number,
        //     PatientEntity.blood_bank_product_id,
        //     PatientEntity.gender,
        //     PatientEntity.emergency_mobile_no,
        //     PatientEntity.emergency_dial_code,
        //     PatientEntity.address,
        //     PatientEntity.insurance_id,
        //     PatientEntity.insurance_validity,
        //     PatientEntity.dial_code,
        //     PatientEntity.salutation,
        //     PatientEntity.state_name,
        //     PatientEntity.district_name,
        //     PatientEntity.pincode,
        //     PatientEntity.state_code,
        //     PatientEntity.district_code,
        //     checkHos.id])
        //     if (PatientEntity.dob != "" && PatientEntity.dob != null) {
        //       await this.dynamicConnection.query(`update patients set dob = ? where aayush_unique_id = ?`, [
        //         PatientEntity.dob,
        //         aayush_unique_id
        //       ])
        //     }
        //     if (PatientEntity.age != "" && PatientEntity.age != null) {
        //       await this.dynamicConnection.query(`update patients set age = ? where aayush_unique_id = ?`, [
        //         PatientEntity.age,
        //         aayush_unique_id
        //       ])
        //     }
        //   }
        resp = await this.dynamicConnection.query(
          `select
          coalesce(patients.id,"") id ,
                  concat("PT",patients.id) plenome_patient_id,
          coalesce(patients.patient_name,"") patient_name,
          coalesce(DATE(patients.dob) ,"") dob,
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
                      left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
                      where aayush_unique_id = ?`,
          [aayush_unique_id],
        );
      } else {
        let formattedDate;
        let abha = await PatientEntity.ABHA_number;
        if (PatientEntity.dob) {
          const date = new Date(PatientEntity.dob);
          const DOByear = date.getFullYear();
          const DOBmonth = (date.getMonth() + 1).toString().padStart(2, '0');
          const DOBday = date.getDate().toString().padStart(2, '0');
          formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`;
        }
        if (abha == '' || abha == null) {
          abha = null;
        }
        let faceID = null;
        if (PatientEntity.image && PatientEntity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            PatientEntity.image,
          );
          faceID = getFaceId?.faceID;
        }
        await this.dynamicConnection.query(
          `INSERT INTO patients (patient_name,image,faceId,dob,age,
        email,gender,mobileno,blood_bank_product_id,emergency_mobile_no,
        address,state_code,district_code,pincode,ABHA_number,dial_code,
        salutation,emergency_dial_code,state_name,district_name,aayush_unique_id,abha_address)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
            aayush_unique_id,
            PatientEntity.abha_address,
          ],
        );
        resp = await this.dynamicConnection.query(
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
coalesce(patients.abha_address,"") abha_address,
coalesce(patients.dial_code,"91") dial_code,
coalesce(patients.salutation,"") salutation,
coalesce(patients.emergency_dial_code,"") emergency_dial_code,
coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
coalesce(patients.blood_bank_product_id,"") blood_bank_product_id,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where aayush_unique_id = ?`,
          [aayush_unique_id],
        );
      }
      const [getPat_id] = await this.dynamicConnection.query(
        `select id from patients where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      const [getAbhaAddress] = await this.dynamicConnection.query(
        `select abhaAddress from patient_abha_address where patient_id = ? order by created_at DESC limit 1`,
        [getPat_id.id],
      );
      console.log(getAbhaAddress, 'getAbhaAddress');

      resp[0].patient_abha_address = getAbhaAddress || '';
      return {
        status: 'success',
        message: 'patient details fetched successfully',
        details: await resp,
      };
    } catch (error) {
      console.log(error);

      return {
        status: 'failed',
        message: 'unable to fetch patient data',
        error: error,
      };
    }
  }
  async findAllAbhaAddress(
    aayush_unique_id: string,
    hospital_id: number,
    abhaAddress: string,
  ) {
    if (abhaAddress?.trim() == '') {
      return {
        status: 'failed',
        message: 'Abha address cannot be empty',
      };
    }
    try {
      const [PatientEntity] = await this.connection.query(
        `
        select
        patients.id id,
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
    coalesce(concat(coalesce(patients.address,"")," ",coalesce(patients.district_name,"")," ",coalesce(patients.state_name,""),coalesce(patients.pincode,"")),"") address,
    coalesce(patients.guardian_name,"") guardian_name,
    coalesce(patients.patient_type,"") patient_type,
    coalesce(patients.ABHA_number,"") ABHA_number,
    coalesce(patients.known_allergies,"") known_allergies,
    coalesce(patients.insurance_id,"") insurance_id,
    coalesce(patients.insurance_validity,"") insurance_validity,
    coalesce(patients.is_active,"") is_active,
    coalesce(patients.aayush_unique_id,"") aayush_unique_id,
    coalesce(patients.abha_address,"") abha_address,
    coalesce(patients.dial_code,"91") dial_code,
    coalesce(patients.salutation,"") salutation,
    coalesce(patients.emergency_dial_code,"") emergency_dial_code,
    coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
    coalesce(blood_bank_products.name,"") patient_blood_group,
    patients.is_kyc_verified
    from patients
                left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
                where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      if (!PatientEntity) {
        return {
          status: 'failed',
          message: 'Patient not found',
        };
      }

      const [checkHos] = await this.dynamicConnection.query(
        `select
coalesce(patients.id,"") id ,
        concat("PT",patients.id) plenome_patient_id,
coalesce(patients.patient_name,"") patient_name,
coalesce(DATE(patients.dob) ,"") dob,
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      let resp;
      if (checkHos) {
        resp = await checkHos;
      } else {
        let formattedDate;
        let abha = await PatientEntity.ABHA_number;
        if (PatientEntity.dob) {
          const date = new Date(PatientEntity.dob);

          const DOByear = date.getFullYear();
          const DOBmonth = (date.getMonth() + 1).toString().padStart(2, '0');
          const DOBday = date.getDate().toString().padStart(2, '0');
          formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`;
        }
        if (abha == '' || abha == null) {
          abha = null;
        }
        let faceID = null;
        if (PatientEntity.image && PatientEntity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            PatientEntity.image,
          );
          faceID = getFaceId?.faceID;
        }
        await this.dynamicConnection.query(
          `INSERT INTO patients (patient_name,image,faceId,dob,age,
        email,gender,mobileno,blood_bank_product_id,emergency_mobile_no,
        address,state_code,district_code,pincode,ABHA_number,dial_code,
        salutation,emergency_dial_code,state_name,district_name,aayush_unique_id,abha_address)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
            aayush_unique_id,
            PatientEntity.abha_address,
          ],
        );
        resp = await this.dynamicConnection.query(
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where aayush_unique_id = ?`,
          [aayush_unique_id],
        );
      }
      const [checkAddressHos] = await this.dynamicConnection.query(
        `select patient_id from patient_abha_address where abhaAddress = ?`,
        [abhaAddress],
      );
      console.log(checkAddressHos, 'checkAddressHos');
      if (checkAddressHos) {
        return {
          status: 'failed',
          message: 'Abha address already mapped to another patient',
          patientDetails: await this.dynamicConnection.query(
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
coalesce(patients.abha_address,"") abha_address,
coalesce(patients.dial_code,"91") dial_code,
coalesce(patients.salutation,"") salutation,
coalesce(patients.emergency_dial_code,"") emergency_dial_code,
coalesce(patients.emergency_mobile_no,"") emergency_mobile_no,
coalesce(blood_bank_products.name,"") patient_blood_group,
patients.is_kyc_verified
from patients 
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id where patients.id = ?`,
            [checkAddressHos.patient_id],
          ),
        };
      }
      const [getPatId] = await this.dynamicConnection.query(
        `select * from patients where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      const [getHosHipId] = await this.connection.query(
        `select * from hospitals where plenome_id = ?`,
        [hospital_id],
      );
      const checkForFirstAddress = await this.dynamicConnection.query(
        `select * from patient_abha_address where patient_id = ?`,
        [getPatId.id],
      );
      if (checkForFirstAddress.length == 0) {
        const apiBody = {
          hip_id: await getHosHipId.hip_id,
          abha_address: abhaAddress,
          patient_ref_no: aayush_unique_id,
        };
        await axios.post(
          'https://abha-api.plenome.com/link/update_abha_address',
          apiBody,
        );
      }
      await this.dynamicConnection.query(
        `insert into patient_abha_address (abhaAddress,
        patient_id) values (?,?)`,
        [abhaAddress, await resp.id],
      );
      return {
        status: 'success',
        message: 'patient details fetched successfully',
        details: await resp,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'failed',
        message: 'unable to fetch patient data',
        error: error,
      };
    }
  }
  async checkAbhaAddress(abhaAddress: string, hospital_id: number) {
    if (abhaAddress.trim() == '') {
      return {
        status: 'failed',
        message: 'Abha address cannot be empty',
      };
    }
    try {
      const [checkABHAAddress] = await this.dynamicConnection.query(
        `select patient_id from patient_abha_address where abhaAddress = ?`,
        [abhaAddress],
      );
      if (checkABHAAddress) {
        return {
          status: 'failed',
          message: 'Abha address already mapped to another patient',
          patientDetails: await this.dynamicConnection.query(
            `select
coalesce(patients.id,"") id ,
        concat("PT",patients.id) plenome_patient_id,
coalesce(patients.patient_name,"") patient_name,
coalesce(DATE(patients.dob) ,"") dob,
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where patients.id = ?`,
            [checkABHAAddress.patient_id],
          ),
        };
      } else {
        return {
          status: 'success',
          message: 'Abha address not mapped to any patient',
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        message: 'unable to check abha address',
        error: error,
      };
    }
  }

  async checkAbhaNumberAndAddress(
    abhaAddress: string,
    ABHANumber: string,
    hospital_id: number,
  ) {
    if (abhaAddress?.trim() == '') {
      return {
        status: 'failed',
        message: 'Abha address cannot be empty',
      };
    }
    try {
      const [checkABHAAddress] = await this.dynamicConnection.query(
        `select patient_id from patient_abha_address where abhaAddress = ?`,
        [abhaAddress],
      );
      if (ABHANumber) {
        const checkDuplicateAbhaNumber = await this.dynamicConnection.query(
          `select id from patients where ABHA_number = ?`,
          [ABHANumber],
        );
        if (checkDuplicateAbhaNumber.length > 0) {
          return {
            status: 'failed',
            message: 'ABHA Number already linked to another patient',
            patientDetails: await this.dynamicConnection.query(
              `select
            coalesce(patients.id,"") id ,
                    concat("PT",patients.id) plenome_patient_id,
            coalesce(patients.patient_name,"") patient_name,
            coalesce(DATE(patients.dob) ,"") dob,
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
                        left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
                        where patients.id = ?`,
              [checkDuplicateAbhaNumber[0].id],
            ),
          };
        }
      }
      console.log(checkABHAAddress, 'checkABHAAddress');

      if (checkABHAAddress) {
        return {
          status: 'failed',
          message: 'ABHA address already mapped to another patient',
          patientDetails: await this.dynamicConnection.query(
            `select
coalesce(patients.id,"") id ,
        concat("PT",patients.id) plenome_patient_id,
coalesce(patients.patient_name,"") patient_name,
coalesce(DATE(patients.dob) ,"") dob,
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id
            where patients.id = ?`,
            [checkABHAAddress.patient_id],
          ),
        };
      } else {
        return {
          status: 'success',
          message: 'Abha address not mapped to any patient',
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        message: 'unable to check abha address',
        error: error,
      };
    }
  }
}
