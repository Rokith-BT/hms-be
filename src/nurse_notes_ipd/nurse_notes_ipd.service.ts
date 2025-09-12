import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NurseNotesIpd } from './entities/nurse_notes_ipd.entity';
import {CountDto} from './dto/nurse_notes_ipd.dto';

@Injectable()
export class NurseNotesIpdService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(NurseNotesIpd: NurseNotesIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [NurseNotesIpd.staff_id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(`${process.env.VALIDATION_STAFF} ${NurseNotesIpd.staff_id} ${process.env.VALIDATION_NOT_FOUND}`);
      }
      const docemail = staffId.email;
      const nurseNotee = await this.connection.query(
        `INSERT into nurse_note(
          date,
          ipd_id,
          staff_id,
          note,
          comment
        ) VALUES (?,?,?,?,?)`,
        [
          NurseNotesIpd.date,
          NurseNotesIpd.ipd_id,
          NurseNotesIpd.staff_id,
          NurseNotesIpd.note,
          NurseNotesIpd.comment,
        ],
      );
      const nursenoteId = nurseNotee.insertId;

      const dynnnipdd = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?',
        [NurseNotesIpd.ipd_id],
      );
      const Yourdynnnipdd = dynnnipdd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `INSERT into nurse_note(
          date,
          ipd_id,
          staff_id,
          note,
          comment,
          Hospital_id,
          hos_nurse_note_id
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          NurseNotesIpd.date,
          Yourdynnnipdd,
          dynamicUPTDStaffId,
          NurseNotesIpd.note,
          NurseNotesIpd.comment,
          NurseNotesIpd.Hospital_id,
          nursenoteId,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.NURSE_NOTES_MESSAGE,
            Added_Nurse_Notes_Values: await this.connection.query(
              'SELECT * FROM nurse_note WHERE id = ?',
              [nursenoteId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createNurseComment(NurseNotesIpd: NurseNotesIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [NurseNotesIpd.comment_staffid],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${NurseNotesIpd.comment_staffid} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const nurseCommentNotee = await this.connection.query(
        `INSERT into nurse_notes_comment(
          nurse_note_id,
          comment_staffid,
          comment_staff
        ) VALUES (?,?,?)`,
        [
          NurseNotesIpd.nurse_note_id,
          NurseNotesIpd.comment_staffid,
          NurseNotesIpd.comment_staff,
        ],
      );
      const nursenotecommentId = nurseCommentNotee.insertId;
      const dynnnnursenoteid = await this.dynamicConnection.query(
        'SELECT id FROM nurse_note WHERE hos_nurse_note_id = ?',
        [NurseNotesIpd.nurse_note_id],
      );
      const Yourdynnnnursenoteeee = dynnnnursenoteid[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `INSERT into nurse_notes_comment(
          nurse_note_id,
          comment_staffid,
          comment_staff,
          Hospital_id,
          hos_nurse_notes_comment_id
        ) VALUES (?,?,?,?,?)`,
        [
          Yourdynnnnursenoteeee,
          dynamicUPTDStaffId,
          NurseNotesIpd.comment_staff,
          NurseNotesIpd.Hospital_id,
          nursenotecommentId,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.NURSE_NOTES_COMMENT_MESSAGE,
            Added_Nurse_Notes_comment_Values: await this.connection.query(
              'SELECT * FROM nurse_notes_comment WHERE id = ?',
              [nursenotecommentId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM nurse_note WHERE id = ?', [id]);
      const dynamicDeletedNurseNote = await this.dynamicConnection.query(
        'SELECT id FROM nurse_note WHERE hos_nurse_note_id= ?',
        [id],
      );
      const dynamicDeletednursenoteeId = dynamicDeletedNurseNote[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM nurse_note WHERE id = ? AND Hospital_id = ?',
        [dynamicDeletednursenoteeId, Hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.NURSE_NOTE_RETURN_MESSAGE} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.VALIDATION_NOT_FOUND
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async removeComment(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM nurse_notes_comment WHERE id = ?',
        [id],
      );
      const dynamicDeletedNurseNoteComment = await this.dynamicConnection.query(
        'SELECT id FROM nurse_notes_comment WHERE hos_nurse_notes_comment_id= ?',
        [id],
      );
      const dynamicDeletednursenoteeCommentId =
        dynamicDeletedNurseNoteComment[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM nurse_notes_comment WHERE id = ? AND Hospital_id = ?',
        [dynamicDeletednursenoteeCommentId, Hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.NURSE_NOTE_COMMENT_RETURN_MESSAGE} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.VALIDATION_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOne(id: number): Promise<NurseNotesIpd | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try{
    const getNurseNotesByIPDID = await this.connection.query(
      `select nurse_note.id,nurse_note.date,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS NurseName,
    nurse_note.note,
    nurse_note.comment,
    nurse_notes_comment.comment_staff,
    nurse_note.ipd_id
    from nurse_note
    left join nurse_notes_comment on nurse_note.id = nurse_notes_comment.nurse_note_id
    left join staff on nurse_note.staff_id = staff.id
    WHERE nurse_note.ipd_id = ?`,
      [id],
    );
    return getNurseNotesByIPDID;
  }catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE_V2,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  }
  async update(id: number, NurseNotesIpd: NurseNotesIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [NurseNotesIpd.staff_id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(`${process.env.VALIDATION_STAFF} ${NurseNotesIpd.staff_id} ${process.env.VALIDATION_NOT_FOUND}`);
      }
      const docemail = staffId.email;
      const nursenoteeipdidd = await this.connection.query(
        `SELECT ipd_id from nurse_note WHERE id = ?`,
        [id],
      );
      const getnursenoteipdiddddd = nursenoteeipdidd[0].ipd_id;
      await this.connection.query(
        `UPDATE nurse_note SET
          date=?,
          ipd_id=?,
          staff_id=?,
          note=?,
          comment=?
          WHERE id = ?
        `,
        [
          NurseNotesIpd.date,
          getnursenoteipdiddddd,
          NurseNotesIpd.staff_id,
          NurseNotesIpd.note,
          NurseNotesIpd.comment,
          id,
        ],
      );
      const nursenoteedynipdidd = await this.dynamicConnection.query(
        `SELECT id from nurse_note WHERE hos_nurse_note_id = ? and Hospital_id = ?`,
        [id, NurseNotesIpd.Hospital_id],
      );
      const getnursenotedynnipdiddddd = nursenoteedynipdidd[0].id;
      const nursenoteedynnnnnipdidd = await this.dynamicConnection.query(
        `SELECT ipd_id from nurse_note WHERE id = ?`,
        [getnursenotedynnipdiddddd],
      );
      const getdynnursenoteipdiddddd = nursenoteedynnnnnipdidd[0].ipd_id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `UPDATE nurse_note SET
          date=?,
          ipd_id=?,
          staff_id=?,
          note=?,
          comment=?,
          Hospital_id=?
          WHERE id = ?
        `,
        [
          NurseNotesIpd.date,
          getdynnursenoteipdiddddd,
          dynamicUPTDStaffId,
          NurseNotesIpd.note,
          NurseNotesIpd.comment,
          NurseNotesIpd.Hospital_id,
          getnursenotedynnipdiddddd,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.NURSE_NOTE_UPDATE_MESSAGE,
            updated_values: await this.connection.query(
              'SELECT * FROM nurse_note WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.VALIDATION_NOT_FOUND
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findNurseNotesIpdDetails(
    ipd_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id];
    let searchValues: any[] = [];
  
    try {
      let baseQuery = `
        SELECT 
          nurse_note.id,
          nurse_note.date,
          CONCAT(staff.name, ' ', staff.surname, "(", staff.employee_id, ")") AS NurseName,
          nurse_note.note,
          nurse_note.comment,
          nurse_notes_comment.comment_staff,
          nurse_note.ipd_id
        FROM nurse_note
        LEFT JOIN nurse_notes_comment ON nurse_note.id = nurse_notes_comment.nurse_note_id
        LEFT JOIN staff ON nurse_note.staff_id = staff.id
        WHERE nurse_note.ipd_id = ?`;
  
      let countQuery = `
        SELECT COUNT(nurse_note.id) AS total
        FROM nurse_note
        LEFT JOIN nurse_notes_comment ON nurse_note.id = nurse_notes_comment.nurse_note_id
        LEFT JOIN staff ON nurse_note.staff_id = staff.id
        WHERE nurse_note.ipd_id = ?`;
  
      if (search) {
        const condition = `
          AND (
            nurse_note.id LIKE ? OR 
            nurse_note.date LIKE ? OR 
            CONCAT(staff.name, ' ', staff.surname, "(", staff.employee_id, ")") LIKE ? OR 
            nurse_note.note LIKE ? OR 
            nurse_note.comment LIKE ? OR 
            nurse_notes_comment.comment_staff LIKE ?
          )`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(6).fill(pattern);
        values = [ipd_id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY nurse_note.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdNurseNotes = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdNurseNotes,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      console.log(error,'err');
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  async findNurseNotesIpdDetail(
    ipd_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id];
    let searchValues: any[] = [];
  
    try {
      let baseQuery = `
        SELECT 
          nurse_note.id,
          nurse_note.date,
          CONCAT(staff.name, ' ', staff.surname, "(", staff.employee_id, ")") AS NurseName,
          nurse_note.note,
          nurse_note.comment,
          nurse_notes_comment.comment_staff,
          nurse_note.ipd_id
        FROM nurse_note
        LEFT JOIN nurse_notes_comment ON nurse_note.id = nurse_notes_comment.nurse_note_id
        LEFT JOIN staff ON nurse_note.staff_id = staff.id
        WHERE nurse_note.ipd_id = ?`;
  
      let countQuery = `
        SELECT COUNT(nurse_note.id) AS total
        FROM nurse_note
        LEFT JOIN nurse_notes_comment ON nurse_note.id = nurse_notes_comment.nurse_note_id
        LEFT JOIN staff ON nurse_note.staff_id = staff.id
        WHERE nurse_note.ipd_id = ?`;
  
      if (search) {
        const condition = `
          AND (
            nurse_note.id LIKE ? OR 
            nurse_note.date LIKE ? OR 
            CONCAT(staff.name, ' ', staff.surname, "(", staff.employee_id, ")") LIKE ? OR 
            nurse_note.note LIKE ? OR 
            nurse_note.comment LIKE ? OR 
            nurse_notes_comment.comment_staff LIKE ?
          )`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(6).fill(pattern);
        values = [ipd_id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY nurse_note.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdNurseNotes = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdNurseNotes,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      console.log(error,'err');
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
