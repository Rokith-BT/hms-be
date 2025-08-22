import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PatientIdCard } from "./entities/patient_id_card.entity";

@Injectable()
export class PatientIdCardService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createPatientIdCard: PatientIdCard) {
    try {
      let patient_ID_Card_id;
      const patient_ID_Card = await this.connection.query(
        `INSERT into patient_id_card (
     title,
     hospital_name,
     hospital_address,
     background,
     logo,
     sign_image,
     header_color,
     enable_patient_name,
     enable_guardian_name,
     enable_patient_unique_id,
     enable_address,
     enable_phone,
     enable_dob,
     enable_blood_group,
     status
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [createPatientIdCard.title,
        createPatientIdCard.hospital_name,
        createPatientIdCard.hospital_address,
        createPatientIdCard.background,
        createPatientIdCard.logo,
        createPatientIdCard.sign_image,
        createPatientIdCard.header_color,
        createPatientIdCard.enable_patient_name,
        createPatientIdCard.enable_guardian_name,
        createPatientIdCard.enable_patient_unique_id,
        createPatientIdCard.enable_address,
        createPatientIdCard.enable_phone,
        createPatientIdCard.enable_dob,
        createPatientIdCard.enable_blood_group,
        createPatientIdCard.status
        ],
      );

      patient_ID_Card_id = patient_ID_Card.insertId;
      // -------------------------------------//
      await this.dynamicConnection.query(
        `INSERT into patient_id_card (
     title,
     hospital_name,
     hospital_address,
     background,
     logo,
     sign_image,
     header_color,
     enable_patient_name,
     enable_guardian_name,
     enable_patient_unique_id,
     enable_address,
     enable_phone,
     enable_dob,
     enable_blood_group,
     status,
     hospital_id,
     hos_patient_id_card_id
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [createPatientIdCard.title,
        createPatientIdCard.hospital_name,
        createPatientIdCard.hospital_address,
        createPatientIdCard.background,
        createPatientIdCard.logo,
        createPatientIdCard.sign_image,
        createPatientIdCard.header_color,
        createPatientIdCard.enable_patient_name,
        createPatientIdCard.enable_guardian_name,
        createPatientIdCard.enable_patient_unique_id,
        createPatientIdCard.enable_address,
        createPatientIdCard.enable_phone,
        createPatientIdCard.enable_dob,
        createPatientIdCard.enable_blood_group,
        createPatientIdCard.status,
        createPatientIdCard.hospital_id,
          patient_ID_Card_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Patient ID Card details added successfully ",
          "Added_Patient_id_card_values": await this.connection.query('SELECT * FROM patient_id_card where id = ?', [patient_ID_Card_id])
        }
      }];


    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }




  async updatePatientIdCard(id: number, createPatientIdCard: PatientIdCard) {
    try {
      await this.connection.query(`update patient_id_card SET
     title=?,
     hospital_name=?,
     hospital_address=?,
     background=?,
     logo=?,
     sign_image=?,
     header_color=?,
     enable_patient_name=?,
     enable_guardian_name=?,
     enable_patient_unique_id=?,
     enable_address=?,
     enable_phone=?,
     enable_dob=?,
     enable_blood_group=?,
     status=?
     where id=?`,
        [
          createPatientIdCard.title,
          createPatientIdCard.hospital_name,
          createPatientIdCard.hospital_address,
          createPatientIdCard.background,
          createPatientIdCard.logo,
          createPatientIdCard.sign_image,
          createPatientIdCard.header_color,
          createPatientIdCard.enable_patient_name,
          createPatientIdCard.enable_guardian_name,
          createPatientIdCard.enable_patient_unique_id,
          createPatientIdCard.enable_address,
          createPatientIdCard.enable_phone,
          createPatientIdCard.enable_dob,
          createPatientIdCard.enable_blood_group,
          createPatientIdCard.status,
          id
        ],
      )
      const dynPatientIDCard = await this.dynamicConnection.query('SELECT id FROM patient_id_card WHERE hos_patient_id_card_id=? and hospital_id=?', [id, createPatientIdCard.hospital_id]);
      const dynPatientIDCardID = dynPatientIDCard[0].id;
      await this.dynamicConnection.query(
        `update patient_id_card SET
     title=?,
     hospital_name=?,
     hospital_address=?,
     background=?,
     logo=?,
     sign_image=?,
     header_color=?,
     enable_patient_name=?,
     enable_guardian_name=?,
     enable_patient_unique_id=?,
     enable_address=?,
     enable_phone=?,
     enable_dob=?,
     enable_blood_group=?,
     status=?,
     hospital_id=?
     where id=?`,
        [
          createPatientIdCard.title,
          createPatientIdCard.hospital_name,
          createPatientIdCard.hospital_address,
          createPatientIdCard.background,
          createPatientIdCard.logo,
          createPatientIdCard.sign_image,
          createPatientIdCard.header_color,
          createPatientIdCard.enable_patient_name,
          createPatientIdCard.enable_guardian_name,
          createPatientIdCard.enable_patient_unique_id,
          createPatientIdCard.enable_address,
          createPatientIdCard.enable_phone,
          createPatientIdCard.enable_dob,
          createPatientIdCard.enable_blood_group,
          createPatientIdCard.status,
          createPatientIdCard.hospital_id,
          dynPatientIDCardID
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.PATIENT_ID_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM patient_id_card WHERE id = ?', [id])
        }
      }];


    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }


  async removePatientIDcard(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM patient_id_card WHERE id = ?', [id]);
      const [GetDynPatientidcard] = await this.dynamicConnection.query(
        'SELECT id FROM patient_id_card WHERE hos_patient_id_card_id=? and hospital_id=?',
        [id, hospital_id]
      );
      const GetDynpatientidcardID = GetDynPatientidcard.id;
      await this.dynamicConnection.query('DELETE FROM patient_id_card WHERE id = ?', [GetDynpatientidcardID]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.PATIENT_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
        },
      ];

    }
    catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }

  }


}
