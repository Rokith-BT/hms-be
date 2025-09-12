/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupPatientNewPatient } from './entities/setup-patient-new_patient.entity';
import { v4 as uuidv4 } from 'uuid';
import { DoubleMetaphone } from 'natural';
import { CountDto, PatientInfoDto } from './setup-patient-new_patient.dto';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class SetupPatientNewPatientService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async create(new_patientEntity: SetupPatientNewPatient) {
    if (new_patientEntity.is_confirmed_to_create_new_patient == true) {
      let uuid = uuidv4();
      try {
        // const [check_duplicate] = await this.connection.query(`select * from patients where mobileno = ? and patient_name = ? and gender = ?`,
        //   [
        //   new_patientEntity.mobileno,
        //   new_patientEntity.patient_name,
        //   new_patientEntity.gender
        // ])

        // console.log("check_duplicate", check_duplicate);
        // if (!check_duplicate) {

        if (new_patientEntity.dob) {
          const date = new Date(new_patientEntity.dob);
          const DOByear = date.getFullYear();
          const DOBmonth = (date.getMonth() + 1).toString().padStart(2, '0');
          const DOBday = date.getDate().toString().padStart(2, '0');
          const formattedDate = `${DOByear}-${DOBmonth}-${DOBday}`;
          new_patientEntity.dob = formattedDate;
        }

        const checkAdmin = await this.connection.query(
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
          [new_patientEntity.mobileno],
        );

        const doubleMetaphone = new DoubleMetaphone();

        for (const a of checkAdmin) {
          const dateOnly = new Date(a.dob).toISOString().split('T')[0];
          if (
            a.gender == new_patientEntity.gender &&
            (dateOnly == new_patientEntity.dob ||
              a.age == new_patientEntity.age)
          ) {
            const [primary1, secondary1] = doubleMetaphone.process(
              a.patient_name,
            );
            const [primary2, secondary2] = doubleMetaphone.process(
              new_patientEntity.patient_name,
            );
            const phoneticMatch =
              primary1 === primary2 ||
              primary1 === secondary2 ||
              secondary1 === primary2 ||
              secondary1 === secondary2;
            if (phoneticMatch) {
              console.log('phonetich match true pols');

              return [
                {
                  status: process.env.ERROR_STATUS,
                  message: process.env.PATIETNT_EXIST,
                  existing_patient_details: a,
                },
              ];
            }
          }
        }

        let faceID = null;
        if (new_patientEntity.image && new_patientEntity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            new_patientEntity.image,
          );
          faceID = getFaceId?.faceID;
        }
        const admin = await this.dynamicConnection.query(
          `INSERT INTO patients ( lang_id,patient_name, dob, image,faceId,  mobileno, email, gender, marital_status,
  blood_bank_product_id,
     address,guardian_name,ABHA_number, known_allergies, note,insurance_id, insurance_validity,salutation,aayush_unique_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
          [
            new_patientEntity.lang_id,
            new_patientEntity.patient_name,
            new_patientEntity.dob,
            new_patientEntity.image,
            faceID,
            new_patientEntity.mobileno,
            new_patientEntity.email,
            new_patientEntity.gender,
            new_patientEntity.marital_status,
            new_patientEntity.blood_bank_product_id,
            new_patientEntity.address,
            new_patientEntity.guardian_name,
            new_patientEntity.ABHA_number,
            new_patientEntity.known_allergies,
            new_patientEntity.note,
            new_patientEntity.insurance_id,
            new_patientEntity.insurance_validity,
            new_patientEntity.salutation,
            uuid,
          ],
        );

        const result = await this.connection.query(
          `INSERT INTO patients ( lang_id,patient_name, dob, image, faceId, mobileno, email, gender, marital_status,
      blood_bank_product_id,
         address,guardian_name,ABHA_number, known_allergies, note,insurance_id, insurance_validity,salutation,aayush_unique_id
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
          [
            new_patientEntity.lang_id,
            new_patientEntity.patient_name,
            new_patientEntity.dob,
            new_patientEntity.image,
            faceID,
            new_patientEntity.mobileno,
            new_patientEntity.email,
            new_patientEntity.gender,
            new_patientEntity.marital_status,
            new_patientEntity.blood_bank_product_id,
            new_patientEntity.address,
            new_patientEntity.guardian_name,
            new_patientEntity.ABHA_number,
            new_patientEntity.known_allergies,
            new_patientEntity.note,
            new_patientEntity.insurance_id,
            new_patientEntity.insurance_validity,
            new_patientEntity.salutation,
            uuid,
          ],
        );

        const free = result.insertId;

        return [
          {
            'data ': {
              'id  ': free,
              status: process.env.SUCCESS_STATUS_V2,
              messege: process.env.PATIENT,
              inserted_data: await this.connection.query(
                'SELECT * FROM patients WHERE id = ?',
                [free],
              ),
            },
          },
        ];
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: process.env.ERROR_MESSAGE,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findAll(): Promise<SetupPatientNewPatient[]> {
    try {
      const patients = await this.connection.query(
        `select patients.id, patients.patient_name, patients.dob,patients.age,patients.note as remark,patients.email as email,
    patients.known_allergies, patients.ABHA_number, blood_bank_products.name as blood_group, patients.marital_status, patients.image,
    patients.gender,patients.mobileno,patients.guardian_name,patients.address,
    patients.is_dead,patients.insurance_id,patients.insurance_validity from patients
    left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id where is_active = ?`,
        ['yes'],
      );
      return patients;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const patients = await this.connection.query(
        `select patients.id,patients.patient_name,patients.guardian_name,patients.gender,blood_bank_products.is_blood_group,patients.marital_status,
      patients.age,patients.dob,
    patients.mobileno,patients.email,patients.address,patients.known_allergies,patients.note,
    patients.insurance_id,patients.insurance_validity,patients.ABHA_number from patients
    left join blood_bank_products on patients.blood_bank_product_id = blood_bank_products.id
     where patients.id = ?`,
        [id],
      );
      return patients;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    new_patientEntity: SetupPatientNewPatient,
  ): Promise<{ [key: string]: any }[]> {
    try {
      let faceID = null;
      if (new_patientEntity.image && new_patientEntity.image.trim() != '') {
        const getFaceId = await this.addAppointmentService.getfaceID(
          new_patientEntity.image,
        );
        faceID = getFaceId?.faceID;
      }
      await this.connection.query(
        'UPDATE patients SET patient_name =?,faceId = ?,  guardian_name =?,  gender =?,  dob =?,  blood_group =?, marital_status =?, image =?,   mobileno =?, email =?, address =?, note =?, known_allergies = ?, insurance_id=?, insurance_validity=?, ABHA_number =?, salutation = ?, blood_bank_product_id = ? WHERE id = ?',
        [
          new_patientEntity.patient_name,
          faceID,
          new_patientEntity.guardian_name,
          new_patientEntity.gender,
          new_patientEntity.dob,
          new_patientEntity.blood_group,
          new_patientEntity.marital_status,
          new_patientEntity.image,
          new_patientEntity.mobileno,
          new_patientEntity.email,
          new_patientEntity.address,
          new_patientEntity.note,
          new_patientEntity.known_allergies,
          new_patientEntity.insurance_id,
          new_patientEntity.insurance_validity,
          new_patientEntity.ABHA_number,
          new_patientEntity.salutation,
          new_patientEntity.blood_bank_product_id,
          id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PATIENT_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM patients WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<{ [key: string]: any }[]> {
    await this.connection.query('DELETE FROM patients WHERE id = ?', [id]);
    return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED,
      },
    ];
  }

  async setupNewPatient(search: string): Promise<SetupPatientNewPatient[]> {
    try {
      let query = ` select patients.id, patients.patient_name, patients.dob,patients.age,patients.note as remark,patients.email as email,
    patients.known_allergies, patients.ABHA_number, blood_bank_products.name as blood_group, patients.marital_status, patients.image,
    patients.gender,patients.mobileno,patients.guardian_name,patients.address,
    patients.is_dead,patients.insurance_id,patients.insurance_validity from patients
    left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id where is_active = 'yes' `;

      let values = [];
      if (search) {
        query += ` and ( patients.patient_name LIKE ? OR patients.age LIKE ? OR patients.gender LIKE ? OR patients.mobileno LIKE ? OR patients.guardian_name LIKE ? OR patients.address LIKE ? OR patients.is_dead LIKE ?)  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }

      let final = query;
      const setupNewPatientSearch = await this.connection.query(final, values);
      return setupNewPatientSearch;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async disablePatList(): Promise<SetupPatientNewPatient[]> {
    try {
      const Disabledpatients = await this.connection.query(
        `select patients.id, patients.patient_name, patients.dob,patients.age,patients.note as remark,patients.email as email,
    patients.known_allergies, patients.ABHA_number, blood_bank_products.name as blood_group, patients.marital_status, patients.image,
    patients.gender,patients.mobileno,patients.guardian_name,patients.address,
    patients.is_dead,patients.insurance_id,patients.insurance_validity from patients
    left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id where is_active = ?`,
        ['no'],
      );
      return Disabledpatients;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async SetupDisabledPatient(
    search: string,
  ): Promise<SetupPatientNewPatient[]> {
    try {
      let query = ` select patients.id, patients.patient_name, patients.dob,patients.age,patients.note as remark,patients.email as email,
    patients.known_allergies, patients.ABHA_number, blood_bank_products.name as blood_group, patients.marital_status, patients.image,
    patients.gender,patients.mobileno,patients.guardian_name,patients.address,
    patients.is_dead,patients.insurance_id,patients.insurance_validity from patients
    left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id where is_active = 'no' `;

      let values = [];
      if (search) {
        query += ` and ( patients.patient_name LIKE ? OR patients.age LIKE ? OR patients.gender LIKE ? OR patients.mobileno LIKE ? OR patients.guardian_name LIKE ? OR patients.address LIKE ? )  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }

      let final = query;
      const DisabledPatientSearch = await this.connection.query(final, values);
      return DisabledPatientSearch;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkOldPatient(mobile: string) {
    try {
      const checkDuplicate = await this.dynamicConnection.query(
        `select * from patients where mobileno = ?`,
        [mobile],
      );
      if (checkDuplicate.length > 0) {
        return {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.PATIENT_DATA,
          patients: await checkDuplicate,
        };
      } else {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.PATIENT_NOT_FOUND,
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPatientDetailsWithAayush(aayush_unique_id: string) {
    try {
      const [checkDuplicate] = await this.dynamicConnection.query(
        `select * from patients where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      const getHosPatients = await this.connection.query(
        `select * from patients where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      if (getHosPatients.length > 0) {
        return {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.PATIENT_DATA,
          patients: await getHosPatients,
        };
      } else {
        let faceID = null;
        if (checkDuplicate.image && checkDuplicate.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            checkDuplicate.image,
          );
          faceID = getFaceId?.faceID;
        }
        const result = await this.connection.query(
          `INSERT INTO patients ( lang_id,patient_name, dob, image,faceId,  mobileno, email, gender, marital_status,
    blood_bank_product_id,
       address,guardian_name,ABHA_number, known_allergies, note,insurance_id, insurance_validity,aayush_unique_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
          [
            checkDuplicate.lang_id,
            checkDuplicate.patient_name,
            checkDuplicate.dob,
            checkDuplicate.image,
            faceID,
            checkDuplicate.mobileno,
            checkDuplicate.email,
            checkDuplicate.gender,
            checkDuplicate.marital_status,
            checkDuplicate.blood_bank_product_id,
            checkDuplicate.address,
            checkDuplicate.guardian_name,
            checkDuplicate.ABHA_number,
            checkDuplicate.known_allergies,
            checkDuplicate.note,
            checkDuplicate.insurance_id,
            checkDuplicate.insurance_validity,
            checkDuplicate.aayush_unique_id,
          ],
        );
        return {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.PATIENT_DATA,
          patients: await this.connection.query(
            `select * from patients where id = ?`,
            [result.insertId],
          ),
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findallpatients(
    limit: number,
    page: number,
    search?: string,
    fromdate?: string,
    todate?: string,
  ): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);

      let whereCondition = ` WHERE 1=1 `;
      const queryParams: any[] = [];

      if (search) {
        whereCondition += `
        AND (
          patients.patient_name LIKE ?
          OR patients.age LIKE ?
          OR patients.mobileno LIKE ?
          OR patients.gender LIKE ?
        )
      `;
        queryParams.push(
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
        );
      }

      if (fromdate && todate) {
        whereCondition += ` AND DATE(patients.created_at) BETWEEN ? AND ? `;
        queryParams.push(fromdate, todate);
      } else if (fromdate) {
        whereCondition += ` AND DATE(patients.created_at) >= ? `;
        queryParams.push(fromdate);
      } else if (todate) {
        whereCondition += ` AND DATE(patients.created_at) <= ? `;
        queryParams.push(todate);
      }

      const listQueryParams = [...queryParams, Number(limit), Number(offset)];

      const patients = await this.dynamicConnection.query(
        `
      SELECT 
        patients.id, 
        patients.patient_name, 
        patients.age, 
        "years", 
        patients.gender,
        patients.mobileno AS phone, 
        patients.guardian_name, 
        DATE(patients.created_at) AS date, 
        patients.is_dead AS Dead,
        patients.aayush_unique_id
      FROM patients
      ${whereCondition}
      ORDER BY patients.id DESC
      LIMIT ? OFFSET ?
      `,
        listQueryParams,
      );

      const countResult = await this.dynamicConnection.query(
        `
      SELECT COUNT(*) AS total 
      FROM patients
      ${whereCondition}
      `,
        queryParams,
      );

      const total = countResult[0]?.total ?? 0;

      return {
        details: patients,
        total,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async patient_info(id: number): Promise<PatientInfoDto> {
    try {
      const patient_info = await this.connection.query(
        `select patients.id as id, patients.patient_name as name, patients.guardian_name as guardian_name, patients.gender as gender, 
blood_bank_products.name as blood_group, patients.marital_status as marital_Status, patients.age, "year", patients.mobileno as phone,
patients.email as email, patients.address as address, patients.known_allergies as any_known_allergies, patients.note as remark,
patients.insurance_id as TPA_ID, patients.insurance_validity as TPA_validity, patients.ABHA_number as National_identification_number,
patients.image as image
from patients
left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id
where patients.id = ? `,
        [id],
      );

      const opd_details = await this.connection.query(
        `select visit_details.opd_details_id as opd_no, opd_details.case_reference_id as case_id, 
visit_details.appointment_date as Date, visit_details.id as opd_checkup_id,
staff.name,staff.surname,staff.employee_id,visit_details.symptoms as symptoms
from visit_details
left join opd_details on visit_details.opd_details_id = opd_details.id
left join staff on visit_details.cons_doctor = staff.id
where patient_id = ? ORDER BY visit_details.opd_details_id desc `,
        [id],
      );

      const ipd_details = await this.connection.query(
        `select ipd_details.id as ipd_no, "IPDN", ipd_details.case_reference_id, date(ipd_details.date) as date,
staff.name,staff.surname,staff.employee_id, ipd_details.symptoms as symptoms
from ipd_details
left join staff on ipd_details.cons_doctor = staff.id
where patient_id = ? ORDER BY ipd_details.id desc`,
        [id],
      );

      return {
        patient_info,
        opd_details,
        ipd_details,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async V3findallpatients(
    limit: number,
    page: number,
    search: string,
    fromdate?: string,
    todate?: string,
  ) {
    try {
      const offset = limit * (page - 1);

      let query = ' WHERE is_active = "yes" ';
      if (search) {
        query += `and (patients.patient_name like '%${search}%' or patients.mobileno like '%${search}%' or patients.id like '%${search}%')`;
      }
      let queryParams = [];

      if (fromdate && todate) {
        query += ` AND DATE(patients.created_at) BETWEEN ? AND ?`;
        queryParams.push(fromdate, todate);
      } else if (fromdate) {
        query += ` AND DATE(patients.created_at) <= ?`;
        queryParams.push(fromdate);
      } else if (todate) {
        query += ` AND DATE(patients.created_at) >= ?`;
        queryParams.push(todate);
      }
      const getPatDetails = await this.connection.query(
        `select 
      patients.id, patients.patient_name, patients.age, "years", patients.gender,
      patients.mobileno AS phone, patients.guardian_name, DATE(patients.created_at) AS date, patients.is_dead AS Dead
      from patients ${query} limit ${limit} offset ${offset}`,
        [queryParams],
      );
      const getCount = await this.connection.query(
        `select count(id) as total_count from patients ${query}`,
        [queryParams],
      );

      let out = {
        status: 'success',
        message: 'patient details fetched successfully',
        details: getPatDetails,
        count: getCount[0].total_count,
      };
      return out;
    } catch (error) {
      console.log(error, ' error in V3findallpatients');

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPATIENT_ID(id: string): Promise<SetupPatientNewPatient[]> {
    try {
      const patients = await this.connection.query(
        `select patients.id from patients
     where aayush_unique_id = ?`,
        [id],
      );
      return patients;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  aayush_unique_id;
}
