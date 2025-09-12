import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConsultantRegisterIpd } from './entities/consultant_register_ipd.entity';
import {CountDto} from './dto/consultant_register_ipd.dto';

@Injectable()
export class ConsultantRegisterIpdService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createConsultantRegisterIpd: ConsultantRegisterIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createConsultantRegisterIpd.cons_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createConsultantRegisterIpd.cons_doctor} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const consultRegister = await this.connection.query(
        `INSERT into consultant_register(
          ipd_id,
          date,
          ins_date,
          instruction,
          cons_doctor
        ) VALUES (?,?,?,?,?)`,
        [
          createConsultantRegisterIpd.ipd_id,
          createConsultantRegisterIpd.date,
          createConsultantRegisterIpd.ins_date,
          createConsultantRegisterIpd.instruction,
          createConsultantRegisterIpd.cons_doctor,
        ],
      );
      const consultRegisterId = consultRegister.insertId;
      const dynnnipdd = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?',
        [createConsultantRegisterIpd.ipd_id],
      );
      const Yourdynnnipdd = dynnnipdd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `INSERT into consultant_register(
          ipd_id,
          date,
          ins_date,
          instruction,
          cons_doctor,
          Hospital_id,
          hos_consultant_register_id
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          Yourdynnnipdd,
          createConsultantRegisterIpd.date,
          createConsultantRegisterIpd.ins_date,
          createConsultantRegisterIpd.instruction,
          dynamicUPTDStaffId,
          createConsultantRegisterIpd.Hospital_id,
          consultRegisterId,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.CONSULTANT_REGISTER_MESSAGE,
            Added_consultant_register_Values: await this.connection.query(
              'SELECT * FROM consultant_register WHERE id = ?',
              [consultRegisterId],
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

  async update(id: number, createConsultantRegisterIpd: ConsultantRegisterIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createConsultantRegisterIpd.cons_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createConsultantRegisterIpd.cons_doctor} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const nursenoteeipdidd = await this.connection.query(
        `SELECT ipd_id from consultant_register WHERE id = ?`,
        [id],
      );
      const getconsultregipdiddddd = nursenoteeipdidd[0].ipd_id;
      await this.connection.query(
        `UPDATE consultant_register SET
        ipd_id=?,
        date=?,
        ins_date=?,
        instruction=?,
        cons_doctor=?
          WHERE id = ?
        `,
        [
          getconsultregipdiddddd,
          createConsultantRegisterIpd.date,
          createConsultantRegisterIpd.ins_date,
          createConsultantRegisterIpd.instruction,
          createConsultantRegisterIpd.cons_doctor,
          id,
        ],
      );

      const dynnnipdd = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?',
        [getconsultregipdiddddd],
      );
      const Yourdynnnipdd = dynnnipdd[0].id;

      const dynnnconsulregipdd = await this.dynamicConnection.query(
        'SELECT id FROM consultant_register WHERE hos_consultant_register_id = ? and Hospital_id = ?',
        [id, createConsultantRegisterIpd.Hospital_id],
      );
      const Yourdynnnconregipdd = dynnnconsulregipdd[0].id;

      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      await this.dynamicConnection.query(
        `UPDATE consultant_register SET
        ipd_id=?,
        date=?,
        ins_date=?,
        instruction=?,
        cons_doctor=?,
        Hospital_id=?
          WHERE id = ?
        `,
        [
          Yourdynnnipdd,
          createConsultantRegisterIpd.date,
          createConsultantRegisterIpd.ins_date,
          createConsultantRegisterIpd.instruction,
          dynamicUPTDStaffId,
          createConsultantRegisterIpd.Hospital_id,
          Yourdynnnconregipdd,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.CONSULTANT_REGISTER_UPDATE_MESSAGE,
            Added_consultant_register_Values: await this.connection.query(
              'SELECT * FROM consultant_register WHERE id = ?',
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

  async findConsRegSearch(
    id: number,
    search: string,
  ): Promise<ConsultantRegisterIpd | null> {
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

    try {
      let query = `SELECT consultant_register.id,consultant_register.date AS AppliedDate,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS ConsultantDoctor,
    consultant_register.instruction AS Instruction,
    consultant_register.ins_date AS InstructionDate,
    consultant_register.ipd_id
    FROM consultant_register
    LEFT JOIN staff ON consultant_register.cons_doctor = staff.id
    WHERE consultant_register.ipd_id = ?`;

      let values = [];
      values.push(id);

      if (search) {
        query += `  and (consultant_register.date like ? or staff.name like ? or consultant_register.instruction like ? or consultant_register.ins_date like ?)  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }

      const getConsulRegsch = await this.connection.query(query, values);

      return getConsulRegsch;
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

  async remove(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM consultant_register WHERE id = ?',
        [id],
      );

      const dynamicDeleteConsreg = await this.dynamicConnection.query(
        'SELECT id FROM consultant_register WHERE hos_consultant_register_id= ?',
        [id],
      );
      const dynamicDeletedconsregId = dynamicDeleteConsreg[0].id;

      await this.dynamicConnection.query(
        'DELETE FROM consultant_register WHERE id = ? AND Hospital_id = ?',
        [dynamicDeletedconsregId, Hospital_id],
      );

      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.CONSULTANT_REGISTER_DELETE_MESSAGE_FRONT} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
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

  async findConusltantRegisterIpdDetails(
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
        SELECT consultant_register.id,consultant_register.date AS AppliedDate,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS ConsultantDoctor,
    consultant_register.instruction AS Instruction,
    consultant_register.ins_date AS InstructionDate,
    consultant_register.ipd_id,
    ipd_details.discharged
    FROM consultant_register
    LEFT JOIN staff ON consultant_register.cons_doctor = staff.id
    LEFT JOIN ipd_details ON consultant_register.ipd_id = ipd_details.id
    WHERE consultant_register.ipd_id = ?`;
  
      let countQuery = `
        SELECT COUNT(consultant_register.id) AS total
        FROM consultant_register
    LEFT JOIN staff ON consultant_register.cons_doctor = staff.id
    LEFT JOIN ipd_details ON consultant_register.ipd_id = ipd_details.id
    WHERE consultant_register.ipd_id = ?`;
  
      if (search) {
        const condition = `
          AND (consultant_register.date like ? or staff.name like ? or consultant_register.instruction like ? or consultant_register.ins_date like ?)`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(4).fill(pattern);
        values = [ipd_id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY consultant_register.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdConsultantRegiter = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdConsultantRegiter,
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


  async findConusltantRegisterIpdDetail(
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
        SELECT consultant_register.id,consultant_register.date AS AppliedDate,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS ConsultantDoctor,
    consultant_register.instruction AS Instruction,
    consultant_register.ins_date AS InstructionDate,
    consultant_register.ipd_id,
    ipd_details.discharged
    FROM consultant_register
    LEFT JOIN staff ON consultant_register.cons_doctor = staff.id
    LEFT JOIN ipd_details ON consultant_register.ipd_id = ipd_details.id
    WHERE consultant_register.ipd_id = ?`;
  
      let countQuery = `
        SELECT COUNT(consultant_register.id) AS total
        FROM consultant_register
    LEFT JOIN staff ON consultant_register.cons_doctor = staff.id
    LEFT JOIN ipd_details ON consultant_register.ipd_id = ipd_details.id
    WHERE consultant_register.ipd_id = ?`;
  
      if (search) {
        const condition = `
          AND (consultant_register.date like ? or staff.name like ? or consultant_register.instruction like ? or consultant_register.ins_date like ?)`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(4).fill(pattern);
        values = [ipd_id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY consultant_register.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdConsultantRegiter = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdConsultantRegiter,
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
