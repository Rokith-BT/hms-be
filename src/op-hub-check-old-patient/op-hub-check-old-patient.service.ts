import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CheckOldPatient } from './entities/op-hub-check-old-patient.entity';

@Injectable()
export class OpHubCheckOldPatientService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(Entity: CheckOldPatient) {
    if (Entity.hospital_id) {
      try {
        let query;
        let values = [];
        let getStatus;
        if (Entity.search_by == 'ABHA') {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.ABHA_number = ?`;
          values.push(Entity.value);
          getStatus = await this.dynamicConnection.query(query, values);
        } else if (Entity.search_by == 'mobile') {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.mobileno = ? or patients.mobileno = ?`;
          let HosPatientMobileNo = Entity.value;
          let HosTrimmedMobileno;
          if (HosPatientMobileNo.length > 10) {
            HosTrimmedMobileno = HosPatientMobileNo.startsWith('91')
              ? HosPatientMobileNo.slice(2)
              : HosPatientMobileNo;
          } else {
            HosTrimmedMobileno = '91' + HosPatientMobileNo;
          }
          values.push(HosPatientMobileNo, HosTrimmedMobileno);
          getStatus = await this.connection.query(query, values);
        } else if (Entity.search_by == 'patientId') {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.id = ?`;
          values.push(Entity.value);
          getStatus = await this.dynamicConnection.query(query, values);
        } else {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.mobileno like ? or 
            patients.id like ? or patients.patient_name like ? or patients.abha_address like ? or patients.ABHA_number like ? `;
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');

          getStatus = await this.connection.query(query, values);
        }
        if (getStatus[0]) {
          return {
            status: 'success',
            message: 'patient details fetched successfully',
            details: getStatus,
          };
        } else {
          return {
            status: 'failed',
            message: 'no patient details found create new patient',
            details: [],
          };
        }
      } catch (error) {
        return {
          status: 'failed',
          message: 'no patient details found create new patient',
          error: error,
        };
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get appointment status',
        },
      ];
    }
  }

  async findAllV2(Entity: CheckOldPatient, limit: number, page: number) {
    const offset = limit * (page - 1);

    if (Entity.hospital_id) {
      try {
        let query;
        let values = [];
        let getStatus;
        if (Entity.search_by == 'ABHA') {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.ABHA_number = ?`;
          values.push(Entity.value);
          getStatus = await this.dynamicConnection.query(query, values);
        } else if (Entity.search_by == 'mobile') {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.mobileno = ? or patients.mobileno = ?`;
          let HosPatientMobileNo = Entity.value;
          let HosTrimmedMobileno;
          if (HosPatientMobileNo.length > 10) {
            HosTrimmedMobileno = HosPatientMobileNo.startsWith('91')
              ? HosPatientMobileNo.slice(2)
              : HosPatientMobileNo;
          } else {
            HosTrimmedMobileno = '91' + HosPatientMobileNo;
          }
          values.push(HosPatientMobileNo, HosTrimmedMobileno);
          getStatus = await this.connection.query(query, values);
        } else if (Entity.search_by == 'patientId') {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.id = ?`;
          values.push(Entity.value);
          getStatus = await this.dynamicConnection.query(query, values);
        } else {
          query = `select
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.mobileno like ? or 
            patients.id like ? or patients.patient_name like ? or patients.abha_address like ? or patients.ABHA_number like ?
             order by patients.created_at DESC
            limit ${limit} offset ${offset}`;
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');
          values.push('%' + Entity.value + '%');

          getStatus = await this.connection.query(query, values);
          for (const a of getStatus) {
            const [getHosPat_id] = await this.dynamicConnection.query(
              `select id,ABHA_number from patients where aayush_unique_id = ?`,
              [a.aayush_unique_id],
            );
            a.hos_patient_id = (await getHosPat_id?.id) || '';
            a.ABHA_number = (await getHosPat_id?.ABHA_number) || '';
          }
        }
        const searchValue = `%${Entity.value}%`;

        const [getCount] = await this.connection.query(
          `SELECT COUNT(*) AS total_count 
           FROM patients 
           WHERE patients.mobileno LIKE ? 
              OR patients.id LIKE ? 
              OR patients.patient_name LIKE ? 
              OR patients.abha_address LIKE ? 
              OR patients.ABHA_number LIKE ?`,
          [searchValue, searchValue, searchValue, searchValue, searchValue],
        );
        if (getStatus[0]) {
          return {
            status: 'success',
            message: 'patient details fetched successfully',
            details: getStatus,
            count: getCount.total_count,
          };
        } else {
          return {
            status: 'failed',
            message: 'no patient details found create new patient',
            details: [],
          };
        }
      } catch (error) {
        return {
          status: 'failed',
          message: 'no patient details found create new patient',
          error: error,
        };
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get appointment status',
        },
      ];
    }
  }

  async findAllV3(Entity: CheckOldPatient, limit: number, page: number) {
    const offset = limit * (page - 1);

    if (!Entity.hospital_id) {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get appointment status',
        },
      ];
    }
    let query = '';
    if (Entity.value) {
      query = `where patients.patient_name like '%${Entity.value}%' or patients.mobileno like '%${Entity.value}%' or patients.id like '%${Entity.value}%'`;
    }
    const getCount = await this.connection.query(
      `select count(id) as total_count from patients ${query}`,
    );
    const getPatDetails = await this.connection.query(`select 
      id,patient_name,coalesce(dob,"") dob,coalesce(age,"") age,
      coalesce(image,"") image,mobileno,gender,dial_code,
      aayush_unique_id,is_kyc_verified
      from patients ${query} limit ${limit} offset ${offset}`);

    let out = {
      status: 'success',
      message: 'patient details fetched successfully',
      details: getPatDetails,
      count: getCount[0].total_count,
    };
    return out;
  }

  async hosfindAllV2(Entity: CheckOldPatient, limit: number, page: number) {
    const offset = limit * (page - 1);

    if (Entity.hospital_id) {
      try {
        let query;
        let values = [];
        let getStatus;

        query = `select
coalesce(patients.id,"") id ,
concat('PT',patients.id,"") plenome_patient_id ,
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
coalesce(patients.guardian_name,"") guardian_name,
coalesce(patients.state_name,"") state_name,
coalesce(patients.district_name,"") district_name,
coalesce(patients.pincode,"") pincode,
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
            left join blood_bank_products on blood_bank_products.id = patients.blood_bank_product_id  where patients.mobileno like ? or 
            patients.id like ? or patients.patient_name like ? or patients.abha_address like ? or patients.ABHA_number like ? 
            order by patients.created_at desc
            limit ${limit} offset ${offset}
            `;
        values.push('%' + Entity.value + '%');
        values.push('%' + Entity.value + '%');
        values.push('%' + Entity.value + '%');
        values.push('%' + Entity.value + '%');
        values.push('%' + Entity.value + '%');

        getStatus = await this.dynamicConnection.query(query, values);
        console.log(getStatus);

        for (const list of getStatus) {
          // const [getPat_id] = await this.connection.query(
          //   `select id from patients where aayush_unique_id = ? `,
          //   [list.aayush_unique_id],
          // );
          // list.plenome_patient_id = 'PT' + getPat_id?.id || '';

          const [abha_address] = await this.dynamicConnection.query(
            `SELECT abhaAddress
FROM patient_abha_address
WHERE patient_id = ?
ORDER BY created_at DESC
LIMIT 1`,
            [list.id],
          );
          console.log(abha_address, 'abha_address');

          list.patient_abha_address = abha_address?.abhaAddress || '';
        }
        const searchValue = `%${Entity.value}%`;

        const [getCount] = await this.dynamicConnection.query(
          `SELECT COUNT(*) AS total_count 
           FROM patients 
           WHERE patients.mobileno LIKE ? 
              OR patients.id LIKE ? 
              OR patients.patient_name LIKE ? 
              OR patients.abha_address LIKE ? 
              OR patients.ABHA_number LIKE ?`,
          [searchValue, searchValue, searchValue, searchValue, searchValue],
        );
        if (getStatus[0]) {
          return {
            status: 'success',
            message: 'patient details fetched successfully',
            details: getStatus,
            count: getCount.total_count,
          };
        } else {
          return {
            status: 'failed',
            message: 'no patient details found create new patient',
            details: [],
          };
        }
      } catch (error) {
        console.log(error, 'err');

        return {
          status: 'failed',
          message: 'no patient details found create new patient',
          error: error,
        };
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get appointment status',
        },
      ];
    }
  }

  async hosfindAllV3(Entity: CheckOldPatient, limit: number, page: number) {
    const offset = limit * (page - 1);

    if (!Entity.hospital_id) {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get appointment status',
        },
      ];
    }
    let query = '';
    if (Entity.value) {
      query = `where patients.patient_name like '%${Entity.value}%' or patients.mobileno like '%${Entity.value}%' or patients.id like '%${Entity.value}%'`;
    }
    const getCount = await this.dynamicConnection.query(
      `select count(id) as total_count from patients ${query}`,
    );
    const getPatDetails = await this.dynamicConnection.query(`select 
      id,patient_name,coalesce(dob,"") dob,coalesce(age,"") age,
      coalesce(image,"") image,mobileno,gender,dial_code,
      aayush_unique_id,is_kyc_verified
      from patients ${query} limit ${limit} offset ${offset}`);

    for (const list of getPatDetails) {
      const [abha_address] = await this.dynamicConnection.query(
        `SELECT abhaAddress
FROM patient_abha_address
WHERE patient_id = ?
ORDER BY created_at DESC
LIMIT 1`,
        [list.id],
      );
      list.patient_abha_address = abha_address || '';
    }

    let out = {
      status: 'success',
      message: 'patient details fetched successfully',
      details: getPatDetails,
      count: getCount[0].total_count,
    };
    return out;
  }
}
