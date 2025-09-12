import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { InternalOpdTimeline } from "./entities/internal-opd-timeline.entity";

@Injectable()
export class InternalOpdTimelineService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(opd_timeline: InternalOpdTimeline) {

    try {
      const HOSpatient = await this.connection.query('select * from patients where id =?', [opd_timeline.patient_id])
      const [AdminPatEmail] = await this.dynamicConnection.query(`select id from patients where aayush_unique_id = ?`, [HOSpatient[0].aayush_unique_id])
      let currentDate = new Date();
      let year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1;
      let day = currentDate.getDate();
      let formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;

      const result = await this.connection.query(`insert into patient_timeline
   (patient_id,
    title,
    timeline_date,
    description,
    document,
    status,
    date,
    generated_users_type,
    generated_users_id
    )
    values (?,?,?,?,?,?,?,?,?)`,
        [
          opd_timeline.patient_id,
          opd_timeline.title,
          opd_timeline.timeline_date,
          opd_timeline.description,
          opd_timeline.document,
          opd_timeline.status,
          formattedDate,
          opd_timeline.generated_users_type,
          opd_timeline.generated_users_id
        ]);

      await this.dynamicConnection.query(`insert into patient_timeline (patient_id,title,timeline_date,description,document,status,date,generated_users_type,generated_users_id,hospital_id,hospital_patient_timeline_id) values (?,?,?,?,?,?,?,?,?,?,?)`, [
        AdminPatEmail.id,
        opd_timeline.title,
        opd_timeline.timeline_date,
        opd_timeline.description,
        opd_timeline.document,
        opd_timeline.status,
        formattedDate,
        opd_timeline.generated_users_type,
        opd_timeline.generated_users_id,
        opd_timeline.hospital_id,
        result.insertId
      ])

      return [{
        "data": {
          "id ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.PATIENT_TIMELINE,
          "inserted_data": await this.connection.query('SELECT * FROM patient_timeline WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {

      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(patient_id: number) {
    try {
      const opd_timeline = await this.connection.query(`SELECT patient_timeline.id,patient_timeline.patient_id,patient_timeline.title,patient_timeline.timeline_date,
    patient_timeline.description,patient_timeline.document from patient_timeline
    where patient_id = ?`, [patient_id])
      return opd_timeline;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async update(id: string, opd_timeline: InternalOpdTimeline) {
    try {
      await this.connection.query(
        `update patient_timeline SET title = ?, timeline_date = ?, description =?, document= ?, status= ? where id = ?`,
        [
          opd_timeline.title,
          opd_timeline.timeline_date,
          opd_timeline.description,
          opd_timeline.document,
          opd_timeline.status,
          id
        ]
      )
      await this.dynamicConnection.query(
        'update patient_timeline SET  title = ?, timeline_date = ?, description =?, document= ?, status= ? where hospital_patient_timeline_id = ? and hospital_id = ?',
        [
          opd_timeline.title,
          opd_timeline.timeline_date,
          opd_timeline.description,
          opd_timeline.document,
          opd_timeline.status,
          id,
          opd_timeline.hospital_id
        ]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.PATIENT_TIMELINE_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM patient_timeline WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string, hosId: number) {

    try {
      await this.connection.query('delete from patient_timeline WHERE id = ?', [id]);

      await this.dynamicConnection.query(`select id from patient_timeline where
 hospital_id = ? and hospital_patient_timeline_id = ?`, [
        hosId,
        id
      ])
      await this.dynamicConnection.query(`delete from patient_timeline
     where hospital_patient_timeline_id = ?
      and hospital_id = ?`, [
        id,
        hosId

      ])
      return [{
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED
      }]
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}