import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TimelineIpd } from './entities/timeline_ipd.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {CountDto} from './dto/timeline_ipd.dto';

@Injectable()
export class TimelineIpdService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createTimelineIpd: TimelineIpd) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createTimelineIpd.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(` ${process.env.VALIDATION_CHECK} ${createTimelineIpd.patient_id} ${process.env.VALIDATION_NOT_FOUND}`);
      }

      const email = patientId.aayush_unique_id;

      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

      const ipdTimeline = await this.connection.query(
        `INSERT into patient_timeline(
              patient_id,
              title,
              timeline_date,
              description,
              document,
              status,
              date,
              generated_users_type
            ) VALUES (?,?,?,?,?,?,?,?)`,
        [
          createTimelineIpd.patient_id,
          createTimelineIpd.title,
          createTimelineIpd.timeline_date,
          createTimelineIpd.description,
          createTimelineIpd.document,
          createTimelineIpd.status,
          timestamp,
          createTimelineIpd.generated_users_type,
        ],
      );
      const ipdPatientTimelineId = ipdTimeline.insertId;
      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;

      await this.dynamicConnection.query(
        `INSERT into patient_timeline(
              patient_id,
              title,
              timeline_date,
              description,
              document,
              status,
              date,
              generated_users_type,
              hospital_id,
              hospital_patient_timeline_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicIPDPatientId,
          createTimelineIpd.title,
          createTimelineIpd.timeline_date,
          createTimelineIpd.description,
          createTimelineIpd.document,
          createTimelineIpd.status,
          timestamp,
          createTimelineIpd.generated_users_type,
          createTimelineIpd.hospital_id,
          ipdPatientTimelineId,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.IPD_TIMELINE_MESSAGE,
            Added_ipd_timeline_Values: await this.connection.query(
              'SELECT * FROM patient_timeline WHERE id = ?',
              [ipdPatientTimelineId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findOne(patient_id: number): Promise<TimelineIpd | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM patients WHERE id = ?',
      [patient_id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${patient_id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getTimelineByPatientID = await this.connection.query(
        `select patient_timeline.id,patient_timeline.timeline_date AS TimelineDate,
    patient_timeline.title AS Title,
    patient_timeline.description AS Description,
    patient_timeline.patient_id
    from patient_timeline
    WHERE patient_timeline.patient_id = ?`,
        [patient_id],
      );

      return getTimelineByPatientID;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, createTimelineIpd: TimelineIpd) {
    try {
      const UpdtpatientTimeline = await this.connection.query(
        `SELECT patient_id from patient_timeline WHERE id = ?`,
        [id],
      );
      const UPDTpatientTimeline = UpdtpatientTimeline[0].patient_id;
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [UPDTpatientTimeline],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(` ${process.env.VALIDATION_CHECK} ${createTimelineIpd.patient_id} ${process.env.VALIDATION_NOT_FOUND}`);
      }
      const email = patientId.aayush_unique_id;
      await this.connection.query(
        `UPDATE patient_timeline SET
              patient_id=?,
              title=?,
              timeline_date=?,
              description=?,
              document=?,
              status=?,
              generated_users_type=?
              WHERE id = ?
            `,
        [
          UPDTpatientTimeline,
          createTimelineIpd.title,
          createTimelineIpd.timeline_date,
          createTimelineIpd.description,
          createTimelineIpd.document,
          createTimelineIpd.status,
          createTimelineIpd.generated_users_type,
          id,
        ],
      );

      const dynpatienttimeline = await this.dynamicConnection.query(
        `SELECT id from patient_timeline WHERE hospital_patient_timeline_id = ? and hospital_id = ?`,
        [id, createTimelineIpd.hospital_id],
      );
      const getdynpatienttimeline = dynpatienttimeline[0].id;
      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;
      await this.dynamicConnection.query(
        `UPDATE patient_timeline SET
              patient_id=?,
              title=?,
              timeline_date=?,
              description=?,
              document=?,
              status=?,
              generated_users_type=?,
              hospital_id=?
              WHERE id = ?
            `,
        [
          dynamicIPDPatientId,
          createTimelineIpd.title,
          createTimelineIpd.timeline_date,
          createTimelineIpd.description,
          createTimelineIpd.document,
          createTimelineIpd.status,
          createTimelineIpd.generated_users_type,
          createTimelineIpd.hospital_id,
          getdynpatienttimeline,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.IPD_TIMELINE_UPDATE_MESSAGE,
            Updated_ipd_timeline_Values: await this.connection.query(
              'SELECT * FROM patient_timeline WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async remove(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM patient_timeline WHERE id = ?', [
        id,
      ]);
      const dynamicDeletedPattimeline = await this.dynamicConnection.query(
        'SELECT id FROM patient_timeline WHERE hospital_patient_timeline_id= ? and hospital_id=?',
        [id, hospital_id],
      );
      const dynamicDeletedtimelineId = dynamicDeletedPattimeline[0].id;

      await this.dynamicConnection.query(
        'DELETE FROM patient_timeline WHERE id = ? and hospital_id=?',
        [dynamicDeletedtimelineId, hospital_id],
      );

      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.IPD_PATIENT_TIMELINE_ID}: ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }


  async findIpdTimelineDetails(
    patient_id:number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [patient_id];
    let searchValues: any[] = [];
  
    try {
      let baseQuery = `
        select patient_timeline.id,patient_timeline.timeline_date AS TimelineDate,
    patient_timeline.title AS Title,
    patient_timeline.description AS Description,
    patient_timeline.patient_id
    from patient_timeline
    WHERE patient_timeline.patient_id = ?`;
  
      let countQuery = `
        SELECT COUNT(patient_timeline.id) AS total
        from patient_timeline
    WHERE patient_timeline.patient_id = ?`;
  
      if (search) {
        const condition = `
          AND (patient_timeline.timeline_date LIKE ?
                      OR patient_timeline.title LIKE ?
                      OR patient_timeline.description LIKE ?
                       )`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(3).fill(pattern);
        values = [patient_id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY patient_timeline.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdTimeline = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdTimeline,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



}