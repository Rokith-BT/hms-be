import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VisitorBook } from './entities/visitor_book.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class VisitorBookService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createVisitorBook: VisitorBook) {
    try {
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createVisitorBook.ipd_opd_staff_id]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createVisitorBook.ipd_opd_staff_id} not found.`);
      }
      const docemail = staffId.email;
      const addVisitors = await this.connection.query(
        `INSERT into visitors_book(
       source,
       purpose,
       name,
       email,
       contact,
       id_proof,
       visit_to,
       ipd_opd_staff_id,
       related_to,
       no_of_pepple,
       date,
       in_time,
       out_time,
       note,
       image
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createVisitorBook.source,
          createVisitorBook.purpose,
          createVisitorBook.name,
          createVisitorBook.email,
          createVisitorBook.contact,
          createVisitorBook.id_proof,
          createVisitorBook.visit_to,
          createVisitorBook.ipd_opd_staff_id,
          createVisitorBook.related_to,
          createVisitorBook.no_of_pepple,
          createVisitorBook.date,
          createVisitorBook.in_time,
          createVisitorBook.out_time,
          createVisitorBook.note,
          createVisitorBook.image
        ],
      )
      const addVisitorsID = addVisitors.insertId;

      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
       await this.dynamicConnection.query(
        `INSERT into visitors_book(
         source,
       purpose,
       name,
       email,
       contact,
       id_proof,
       visit_to,
       ipd_opd_staff_id,
       related_to,
       no_of_pepple,
       date,
       in_time,
       out_time,
       note,
       image,
       hospital_id,
       hos_visitors_book_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createVisitorBook.source,
          createVisitorBook.purpose,
          createVisitorBook.name,
          createVisitorBook.email,
          createVisitorBook.contact,
          createVisitorBook.id_proof,
          createVisitorBook.visit_to,
          dynamicUPTDStaffId,
          createVisitorBook.related_to,
          createVisitorBook.no_of_pepple,
          createVisitorBook.date,
          createVisitorBook.in_time,
          createVisitorBook.out_time,
          createVisitorBook.note,
          createVisitorBook.image,
          createVisitorBook.hospital_id,
          addVisitorsID
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.VISITOR_BOOK,
          "Visitors_Values": await this.connection.query('SELECT * FROM visitors_book WHERE id = ?', [addVisitorsID])
        }
      }];
    }
    catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }



  async update(id: number, createVisitorBook: VisitorBook) {

    try {

      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createVisitorBook.ipd_opd_staff_id]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createVisitorBook.ipd_opd_staff_id} not found.`);
      }
      const docemail = staffId.email;
    await this.connection.query(`update visitors_book SET
      source=?,
       purpose=?,
       name=?,
       email=?,
       contact=?,
       id_proof=?,
       visit_to=?,
       ipd_opd_staff_id=?,
       related_to=?,
       no_of_pepple=?,
       date=?,
       in_time=?,
       out_time=?,
       note=?,
       image=?
       where id=?`,
        [
          createVisitorBook.source,
          createVisitorBook.purpose,
          createVisitorBook.name,
          createVisitorBook.email,
          createVisitorBook.contact,
          createVisitorBook.id_proof,
          createVisitorBook.visit_to,
          createVisitorBook.ipd_opd_staff_id,
          createVisitorBook.related_to,
          createVisitorBook.no_of_pepple,
          createVisitorBook.date,
          createVisitorBook.in_time,
          createVisitorBook.out_time,
          createVisitorBook.note,
          createVisitorBook.image,
          id
        ],
      )

      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const [dynVisitor] = await this.dynamicConnection.query(`select id from visitors_book where hospital_id = ? and  hos_visitors_book_id = ?`, [createVisitorBook.hospital_id, id])
      const dynVisitorID = dynVisitor.id;

       await this.dynamicConnection.query(`update visitors_book SET
       source=?,
       purpose=?,
       name=?,
       email=?,
       contact=?,
       id_proof=?,
       visit_to=?,
       ipd_opd_staff_id=?,
       related_to=?,
       no_of_pepple=?,
       date=?,
       in_time=?,
       out_time=?,
       note=?,
       image=?,
       hospital_id=?
       where id=?`,
        [
          createVisitorBook.source,
          createVisitorBook.purpose,
          createVisitorBook.name,
          createVisitorBook.email,
          createVisitorBook.contact,
          createVisitorBook.id_proof,
          createVisitorBook.visit_to,
          dynamicUPTDStaffId,
          createVisitorBook.related_to,
          createVisitorBook.no_of_pepple,
          createVisitorBook.date,
          createVisitorBook.in_time,
          createVisitorBook.out_time,
          createVisitorBook.note,
          createVisitorBook.image,
          createVisitorBook.hospital_id,
          dynVisitorID
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege":process.env.VISITOR_BOOK_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM visitors_book WHERE id = ?', [id])
        }
      }];

    } catch (error) {

throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
  }



  async removeFrontofficeVisitors(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM visitors_book WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM visitors_book WHERE hos_visitors_book_id = ? and hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.VISITOR_BOOK_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
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
