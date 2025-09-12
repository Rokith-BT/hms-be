import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IpdDoctor } from './entities/ipd_doctor.entity';

@Injectable()
export class IpdDoctorsService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}
  async create(createIpdDoctor: IpdDoctor) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createIpdDoctor.consult_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createIpdDoctor.consult_doctor} not found.`,
        );
      }
      const docemail = staffId.email;
      const addIpdDoctors = await this.connection.query(
        `INSERT into ipd_doctors(
   ipd_id,
   consult_doctor
        ) VALUES (?,?)`,
        [createIpdDoctor.ipd_id, createIpdDoctor.consult_doctor],
      );
      const addIpdDoctorsID = addIpdDoctors.insertId;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const dynamicipd = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_id = ? and hospital_ipd_details_id = ?',
        [createIpdDoctor.hospital_id, createIpdDoctor.ipd_id],
      );
      const dynamicipdID = dynamicipd[0].id;
      await this.dynamicConnection.query(
        `INSERT into ipd_doctors(
    ipd_id,
    consult_doctor,
    hospital_id,
    hos_ipd_doctors_id
        ) VALUES (?,?,?,?)`,
        [
          dynamicipdID,
          dynamicUPTDStaffId,
          createIpdDoctor.hospital_id,
          addIpdDoctorsID,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'ipd doctors added successfully ',
            ipd_doctors_value: await this.connection.query(
              'SELECT * FROM ipd_doctors WHERE id = ?',
              [addIpdDoctorsID],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeipdDoctors(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM ipd_doctors WHERE id = ?', [id]);

      const dynamicDeleteipddoc = await this.dynamicConnection.query(
        'SELECT id FROM ipd_doctors WHERE hos_ipd_doctors_id= ? and hospital_id',
        [id, hospital_id],
      );
      const dynamicDeleteipddocId = dynamicDeleteipddoc[0].id;

      await this.dynamicConnection.query(
        'DELETE FROM ipd_doctors WHERE id = ? and hospital_id = ?',
        [dynamicDeleteipddocId, hospital_id],
      );
      return [
        {
          status: 'success',
          message: `Ipd doctors with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
