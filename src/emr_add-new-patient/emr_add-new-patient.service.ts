
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EmrAddNewPatient } from './entities/emr_add-new-patient.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class EmrAddNewPatientService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) { }



  async create(Entity: EmrAddNewPatient) {

    if (Entity.is_confirmed_to_create_new_patient == true) {
      let uuid = uuidv4();
      try {
        let faceID = null;
        if (Entity.image && Entity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(Entity.image)
          faceID = getFaceId?.faceID
        }
        await this.dynamicConnection.query(
          `INSERT INTO patients ( lang_id,patient_name, dob, image,faceId,  mobileno, email, gender, marital_status,
blood_bank_product_id,
   address,guardian_name,ABHA_number, known_allergies, note,insurance_id, insurance_validity,abha_address,aayush_unique_id
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
          [
            Entity.lang_id,
            Entity.patient_name,
            Entity.dob,
            Entity.image,
            faceID,
            Entity.mobileno,
            Entity.email,
            Entity.gender,
            Entity.marital_status,
            Entity.blood_bank_product_id,
            Entity.address,
            Entity.guardian_name,
            Entity.ABHA_number,
            Entity.known_allergies,
            Entity.note,
            Entity.insurance_id,
            Entity.insurance_validity,
            Entity.abha_address,
            uuid
          ]
        );

        const result = await this.connection.query(
          `INSERT INTO patients ( lang_id,patient_name, dob, image,faceId,  mobileno, email, gender, marital_status,
    blood_bank_product_id,
       address,guardian_name,ABHA_number, known_allergies, note,insurance_id, insurance_validity,abha_address,aayush_unique_id
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
          [
            Entity.lang_id,
            Entity.patient_name,
            Entity.dob,
            Entity.image,
            faceID,
            Entity.mobileno,
            Entity.email,
            Entity.gender,
            Entity.marital_status,
            Entity.blood_bank_product_id,
            Entity.address,
            Entity.guardian_name,
            Entity.ABHA_number,
            Entity.known_allergies,
            Entity.note,
            Entity.insurance_id,
            Entity.insurance_validity,
            Entity.abha_address,
            uuid
          ]
        );

        const free = result.insertId;

        return [{
          "data ": {
            "id  ": free,
            "status": "success",
            "messege": "patients details added successfully ",
            "inserted_data": await this.connection.query('SELECT * FROM patients WHERE id = ?', [free])
          }
        }];
      } catch (error) {
        return error
      }

    } else {
      return {
        "status": "failed",
        "message": "should verify for existing patient with mobile number"
      }
    }
  }
  async findall() {
    const find_patient = await this.connection.query(`select * from patients`)
    return find_patient;
  }

  async findone(id: number) {
    const find_patient_id = await this.connection.query(`select * from patients where id = ?`, [id])
    return find_patient_id;
  }

  async update(id: number, Entity: EmrAddNewPatient) {
    try {
            let faceID = null;
        if (Entity.image && Entity.image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(Entity.image)
          faceID = getFaceId?.faceID
        }
      await this.connection.query(`update patients SET mobileno = ?,faceId = ?, ABHA_number = ?, patient_name = ?, guardian_name = ? ,
  gender = ?, dob = ?, age = ?, blood_bank_product_id = ?, emergency_mobile_no = ?, 
  email = ?, address = ?,insurance_id = ?, insurance_validity = ?, abha_address = ? where id = ?`, [
        Entity.mobileno,
        faceID,
        Entity.ABHA_number,
        Entity.patient_name,
        Entity.guardian_name,
        Entity.gender,
        Entity.dob,
        Entity.age,
        Entity.blood_bank_product_id,
        Entity.emergency_mobile_no,
        Entity.email,
        Entity.address,
        Entity.insurance_id,
        Entity.insurance_validity,
        Entity.abha_address,
        id

      ])
      return [
        {
          'data ': {
            status: 'success',
            messege: 'patients details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM patients WHERE id = ?',
              [id],
            ),
          },
        },
      ];


    } catch (error) {
      return [
        {
          status: 'failed',
          messege: 'cannot update patients profile',
          error: error,
        },
      ];
    }
  }


  async remove(id: string) {
    await this.connection.query(`DELETE from patients where id = ?`, [id])
    return [
      {
        status: "success",
        message: ' id: ' + id + ' deleted successfully',
      }
    ]
  }
}
