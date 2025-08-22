import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { OpdOperation } from "./entities/opd-operation.entity";

@Injectable()
export class OpdOperationService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(operation_opd: OpdOperation) {
    try {
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [operation_opd.consultant_doctor]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${operation_opd.consultant_doctor} not found.`);
      }
      const docemail = staffId.email;
      const opdoperation = await this.connection.query(
        `INSERT into operation_theatre (
          opd_details_id,
          operation_id,
          date,
          consultant_doctor,
          ass_consultant_1,
          ass_consultant_2,
          anesthetist,
          anaethesia_type,
          ot_technician,
          ot_assistant,
          result,
          remark
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          operation_opd.opd_details_id,
          operation_opd.operation_id,
          operation_opd.date,
          operation_opd.consultant_doctor,
          operation_opd.ass_consultant_1,
          operation_opd.ass_consultant_2,
          operation_opd.anesthetist,
          operation_opd.anaethesia_type,
          operation_opd.ot_technician,
          operation_opd.ot_assistant,
          operation_opd.result,
          operation_opd.remark
        ]
      )

      const opdoperationid = opdoperation.insertId;
      const dynnnopdd = await this.dynamicConnection.query('SELECT id FROM opd_details WHERE hos_opd_id = ?', [operation_opd.opd_details_id]);
      const Yourdynnnopdd = dynnnopdd[0].id;
      const dynOperationidd = await this.dynamicConnection.query('SELECT id FROM operation WHERE hospital_operation_id = ?', [operation_opd.operation_id]);
      const Yourdynnnoperid = dynOperationidd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `INSERT into operation_theatre (
            opd_details_id,
          operation_id,
          date,
          consultant_doctor,
          ass_consultant_1,
          ass_consultant_2,
          anesthetist,
          anaethesia_type,
          ot_technician,
          ot_assistant,
          result,
          remark,
          Hospital_id,
          hos_operation_theatre_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Yourdynnnopdd,
          Yourdynnnoperid,
          operation_opd.date,
          dynamicUPTDStaffId,
          operation_opd.ass_consultant_1,
          operation_opd.ass_consultant_2,
          operation_opd.anesthetist,
          operation_opd.anaethesia_type,
          operation_opd.ot_technician,
          operation_opd.ot_assistant,
          operation_opd.result,
          operation_opd.remark,
          operation_opd.Hospital_id,
          opdoperationid
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.OPD_OPERATION,
          "Added_opd_operation_Values": await this.connection.query('SELECT * FROM operation_theatre WHERE id = ?', [opdoperationid])
        }
      }];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findALL() {
    try {
      const opd_operation = await this.connection.query(`select operation_theatre.id,concat("OTRN",operation_theatre.id) as reference_no, operation_theatre.date as date, staff.name as consultant_doctor,
        operation_theatre.ass_consultant_2 as Assistant_consultant_2,
       operation_theatre.anaethesia_type as anaethesia_type, operation_theatre.ot_assistant as OT_assistant, operation_theatre.result,
       operation.operation as operation_name,operation_category.category as Operation_category ,operation_theatre.ass_consultant_1 as ass_consultant_1,
       operation_theatre.anesthetist as anesthetist ,operation_theatre.ot_technician as OT_technician ,
       operation_theatre.remark from
        operation_theatre 
       left join operation on operation_theatre.operation_id = operation.id 
       left join operation_category on operation.category_id = operation_category.id
       left join staff on operation_theatre.consultant_doctor = staff.id`);
      return opd_operation;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findone(opd_details_id: number, operation_theatre_id: number) {
    try {
      const opd_operation = await this.connection.query(`select concat("OTRN",operation_theatre.id) as reference_no, operation_theatre.date as date, staff.name as consultant_doctor,
        operation_theatre.ass_consultant_2 as Assistant_consultant_2,
       operation_theatre.anaethesia_type as anaethesia_type, operation_theatre.ot_assistant as OT_assistant, operation_theatre.result,
       operation.operation as operation_name,operation_category.category as Operation_category ,operation_theatre.ass_consultant_1 as ass_consultant_1,
       operation_theatre.anesthetist as anesthetist ,operation_theatre.ot_technician as OT_technician ,
       operation_theatre.remark from
        operation_theatre 
       left join operation on operation_theatre.operation_id = operation.id 
       left join operation_category on operation.category_id = operation_category.id
       left join staff on operation_theatre.consultant_doctor = staff.id where opd_details_id = ? and operation_theatre.id = ?`, [opd_details_id, operation_theatre_id]);
      return opd_operation;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOPDOperSearch(id: number, search: string) {
    try {
      let query = `SELECT concat('OTRN',"",operation_theatre.id) AS ReferenceNo,
        operation_theatre.date AS OperationDate,
        operation.operation AS OperationName,
        operation_category.category AS OperationCategory,
        operation_theatre.ot_technician AS OTTechnician
        from operation_theatre
        LEFT JOIN operation ON operation_theatre.operation_id = operation.id
        LEFT JOIN operation_category ON operation.category_id = operation_category.id
        WHERE operation_theatre.opd_details_id = ?`

      let values = []
      values.push(id)
      if (search) {
        query += `  and (concat('OTRN',"",operation_theatre.id) like ? or operation_theatre.date like ? or operation.operation like ? or operation_category.category like ? or operation_theatre.ot_technician like ?)  `
        values.push("%" + search + "%")
        values.push("%" + search + "%")
        values.push("%" + search + "%")
        values.push("%" + search + "%")
        values.push("%" + search + "%")
      }
      const getOperationOPDsch = await this.connection.query(query, values)
      return getOperationOPDsch;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findopernamebycategory(id: number) {
    try {
      const getOperationname = await this.connection.query(`SELECT * from operation where category_id = ?`, [id]);
      if (getOperationname.length === 1) {
        return getOperationname;
      } else {
        return null;
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async update(id: number, createoperationopd: OpdOperation) {
    try {
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createoperationopd.consultant_doctor]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createoperationopd.consultant_doctor} not found.`);
      }
      const docemail = staffId.email;
      const opdoperationopdidd = await this.connection.query(`SELECT opd_details_id from operation_theatre WHERE id = ?`, [id])
      const operationopdiddddd = opdoperationopdidd[0].opd_details_id;
      await this.connection.query(
        `UPDATE operation_theatre SET
        opd_details_id =?,
          operation_id=?,
          date=?,
          consultant_doctor=?,
          ass_consultant_1=?,
          ass_consultant_2=?,
          anesthetist=?,
          anaethesia_type=?,
          ot_technician=?,
          ot_assistant=?,
          result=?,
          remark=?
          WHERE id = ?
        `,
        [
          operationopdiddddd,
          createoperationopd.operation_id,
          createoperationopd.date,
          createoperationopd.consultant_doctor,
          createoperationopd.ass_consultant_1,
          createoperationopd.ass_consultant_2,
          createoperationopd.anesthetist,
          createoperationopd.anaethesia_type,
          createoperationopd.ot_technician,
          createoperationopd.ot_assistant,
          createoperationopd.result,
          createoperationopd.remark,
          id
        ],
      )
      const dynnnopdd = await this.dynamicConnection.query('SELECT id FROM opd_details WHERE hos_opd_id = ?', [operationopdiddddd]);
      const Yourdynnnopdd = dynnnopdd[0].id;
      const operdynopdidd = await this.dynamicConnection.query(`SELECT id from operation_theatre WHERE hos_operation_theatre_id = ? and Hospital_id = ?`, [id, createoperationopd.Hospital_id])
      const operdynnipdoddddd = operdynopdidd[0].id;
      const dynOperationidd = await this.dynamicConnection.query('SELECT id FROM operation WHERE hospital_operation_id = ?', [createoperationopd.operation_id]);
      const Yourdynnnoperid = dynOperationidd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `UPDATE operation_theatre SET
        opd_details_id=?,
          operation_id=?,
          date=?,
          consultant_doctor=?,
          ass_consultant_1=?,
          ass_consultant_2=?,
          anesthetist=?,
          anaethesia_type=?,
          ot_technician=?,
          ot_assistant=?,
          result=?,
          remark=?,
          Hospital_id=?
          WHERE id = ?
        `,
        [
          Yourdynnnopdd,
          Yourdynnnoperid,
          createoperationopd.date,
          dynamicUPTDStaffId,
          createoperationopd.ass_consultant_1,
          createoperationopd.ass_consultant_2,
          createoperationopd.anesthetist,
          createoperationopd.anaethesia_type,
          createoperationopd.ot_technician,
          createoperationopd.ot_assistant,
          createoperationopd.result,
          createoperationopd.remark,
          createoperationopd.Hospital_id,
          operdynnipdoddddd
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.OPD_OPERATION_UPDATED,
          "Updated_opd_operation_Values": await this.connection.query('SELECT * FROM operation_theatre WHERE id = ?', [id])
        }
      }];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number, Hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM operation_theatre WHERE id = ?', [id]);
      const dynamicDeletedoperationn = await this.dynamicConnection.query('SELECT id FROM operation_theatre WHERE hos_operation_theatre_id= ?', [id]);
      const dynamicDeleteOperationId = dynamicDeletedoperationn[0].id;
      await this.dynamicConnection.query('DELETE FROM operation_theatre WHERE id = ? AND Hospital_id = ?', [dynamicDeleteOperationId, Hospital_id]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
