import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OperationIpd } from './entities/operation_ipd.entity';

@Injectable()
export class OperationIpdService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createOperationIpd: OperationIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createOperationIpd.consultant_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createOperationIpd.consultant_doctor} not found.`,
        );
      }
      const docemail = staffId.email;
      const ipdOperation = await this.connection.query(
        `INSERT into operation_theatre (
          ipd_details_id,
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
          createOperationIpd.ipd_details_id,
          createOperationIpd.operation_id,
          createOperationIpd.date,
          createOperationIpd.consultant_doctor,
          createOperationIpd.ass_consultant_1,
          createOperationIpd.ass_consultant_2,
          createOperationIpd.anesthetist,
          createOperationIpd.anaethesia_type,
          createOperationIpd.ot_technician,
          createOperationIpd.ot_assistant,
          createOperationIpd.result,
          createOperationIpd.remark,
        ],
      );
      const ipdOperationIId = ipdOperation.insertId;
      const dynnnipdd = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?',
        [createOperationIpd.ipd_details_id],
      );
      const Yourdynnnipdd = dynnnipdd[0].id;
      const dynOperationidd = await this.dynamicConnection.query(
        'SELECT id FROM operation WHERE hospital_operation_id = ?',
        [createOperationIpd.operation_id],
      );
      const Yourdynnnoperid = dynOperationidd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `INSERT into operation_theatre (
          ipd_details_id,
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
          Yourdynnnipdd,
          Yourdynnnoperid,
          createOperationIpd.date,
          dynamicUPTDStaffId,
          createOperationIpd.ass_consultant_1,
          createOperationIpd.ass_consultant_2,
          createOperationIpd.anesthetist,
          createOperationIpd.anaethesia_type,
          createOperationIpd.ot_technician,
          createOperationIpd.ot_assistant,
          createOperationIpd.result,
          createOperationIpd.remark,
          createOperationIpd.Hospital_id,
          ipdOperationIId,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Ipd Operation notes added successfully ',
            Added_ipd_operation_Values: await this.connection.query(
              'SELECT * FROM operation_theatre WHERE id = ?',
              [ipdOperationIId],
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

  async update(id: number, createOperationIpd: OperationIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createOperationIpd.consultant_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createOperationIpd.consultant_doctor} not found.`,
        );
      }
      const docemail = staffId.email;
      const ipdoperationipdidd = await this.connection.query(
        `SELECT ipd_details_id from operation_theatre WHERE id = ?`,
        [id],
      );
      const operationipdiddddd = ipdoperationipdidd[0].ipd_details_id;
      await this.connection.query(
        `UPDATE operation_theatre SET
          ipd_details_id=?,
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
          operationipdiddddd,
          createOperationIpd.operation_id,
          createOperationIpd.date,
          createOperationIpd.consultant_doctor,
          createOperationIpd.ass_consultant_1,
          createOperationIpd.ass_consultant_2,
          createOperationIpd.anesthetist,
          createOperationIpd.anaethesia_type,
          createOperationIpd.ot_technician,
          createOperationIpd.ot_assistant,
          createOperationIpd.result,
          createOperationIpd.remark,
          id,
        ],
      );

      const dynnnipdd = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?',
        [operationipdiddddd],
      );
      const Yourdynnnipdd = dynnnipdd[0].id;
      const operdynipdidd = await this.dynamicConnection.query(
        `SELECT id from operation_theatre WHERE hos_operation_theatre_id = ? and Hospital_id = ?`,
        [id, createOperationIpd.Hospital_id],
      );
      const operdynnipdiddddd = operdynipdidd[0].id;
      const dynOperationidd = await this.dynamicConnection.query(
        'SELECT id FROM operation WHERE hospital_operation_id = ?',
        [createOperationIpd.operation_id],
      );
      const Yourdynnnoperid = dynOperationidd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        `UPDATE operation_theatre SET
          ipd_details_id=?,
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
          Yourdynnnipdd,
          Yourdynnnoperid,
          createOperationIpd.date,
          dynamicUPTDStaffId,
          createOperationIpd.ass_consultant_1,
          createOperationIpd.ass_consultant_2,
          createOperationIpd.anesthetist,
          createOperationIpd.anaethesia_type,
          createOperationIpd.ot_technician,
          createOperationIpd.ot_assistant,
          createOperationIpd.result,
          createOperationIpd.remark,
          createOperationIpd.Hospital_id,
          operdynnipdiddddd,
        ],
      );
      return [
        {
          data: {
            status: 'success',
            messege: 'Ipd Operation notes updated successfully ',
            Updated_ipd_operation_Values: await this.connection.query(
              'SELECT * FROM operation_theatre WHERE id = ?',
              [id],
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

  async remove(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM operation_theatre WHERE id = ?',
        [id],
      );
      const dynamicDeletedoperationn = await this.dynamicConnection.query(
        'SELECT id FROM operation_theatre WHERE hos_operation_theatre_id= ?',
        [id],
      );
      const dynamicDeleteOperationId = dynamicDeletedoperationn[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM operation_theatre WHERE id = ? AND Hospital_id = ?',
        [dynamicDeleteOperationId, Hospital_id],
      );
      return [
        {
          status: 'success',
          message: `Operation with id: ${id} and associated entries in the dynamic database have been deleted.`,
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

  async findIPDOperSearch(
    id: number,
    search: string,
  ): Promise<OperationIpd | null> {
    let query = `SELECT operation_theatre.id,concat('OTRN',"",operation_theatre.id) AS ReferenceNo,
    operation_theatre.date AS OperationDate,
    operation.operation AS OperationName,
    operation_category.category AS OperationCategory,
    operation_theatre.ot_technician AS OTTechnician
    from operation_theatre
    LEFT JOIN operation ON operation_theatre.operation_id = operation.id
    LEFT JOIN operation_category ON operation.category_id = operation_category.id
    WHERE operation_theatre.ipd_details_id = ?`;

    let values = [];
    values.push(id);

    if (search) {
      query += ` and ( concat('OTRN',"",operation_theatre.id) like ? or operation_theatre.date like ? or operation.operation like ? or operation_category.category like ? or operation_theatre.ot_technician like ? ) `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    const getOperationIPDsch = await this.connection.query(query, values);
    return getOperationIPDsch;
  }

  async findopernamebycategory(id: number): Promise<OperationIpd | null> {
    const getOperationname = await this.connection.query(
      `SELECT * from operation where category_id = ?`,
      [id],
    );
    return getOperationname;
  }
}
