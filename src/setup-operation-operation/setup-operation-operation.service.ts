import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupOperationOperation } from "./entities/setup-operation-operation.entity";


@Injectable()
export class SetupOperationOperationService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(operationEntity: SetupOperationOperation) {

    try {

      const [existingExpense] = await this.connection.query(`
        SELECT id FROM operation WHERE operation = ? LIMIT 1`,
        [operationEntity.operation]);

      if (existingExpense) {
        return [{
          status: process.env.DUPLICATE_NAME,
          message: process.env.OPERATION_EXIST,
        }]
      }


      const result = await this.connection.query(
        'INSERT INTO operation (operation,category_id,is_active) VALUES (?,?,?)',
        [operationEntity.operation,
        operationEntity.category_id,
        operationEntity.is_active
        ]
      );
      const [operation_category] = await this.dynamicConnection.query(`select id from operation_category where Hospital_id = ? and hospital_operation_category_id = ?`, [
        operationEntity.Hospital_id,
        operationEntity.category_id
      ])
      const opcatid = operation_category.id
      await this.dynamicConnection.query(`Insert into operation
  (
    operation,
    category_id,
    is_active,
    hospital_operation_id,
    Hospital_id) values (?,?,?,?,?)`, [
        operationEntity.operation,
        opcatid,
        operationEntity.is_active,
        result.insertId,
        operationEntity.Hospital_id
      ])


      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.OPERATION,
          "inserted_data": await this.connection.query('SELECT * FROM operation WHERE id = ?', [result.insertId])
        }
      }];

    } catch (error) {
    throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findAll(): Promise<SetupOperationOperation[]> {
    try {
       const operation = await this.connection.query(`select operation.id,operation.operation,operation_category.category,operation.category_id,operation_category.is_active from operation
    join operation_category ON operation.category_id = operation_category.id`);
    return operation;
    } catch (error) {
        throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE
    }, HttpStatus.INTERNAL_SERVER_ERROR);    }
    }
   
  

  async findOne(id: string): Promise<SetupOperationOperation | null> {

    const [existingRecord] = await this.connection.query(
      `SELECT id FROM operation WHERE id = ?`,[id]
    )

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.ERROR,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND
      )
    }

    try {
      const operation = await this.connection.query(`select operation.id,operation.operation,operation_category.category,operation_category.is_active from operation
    join operation_category ON operation.category_id = operation_category.id WHERE operation.id = ?`, [id]);

      return operation;
   
    } catch (error) {
       throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);   
   }
    }
    
  


  async update(id: string, operationEntity: SetupOperationOperation): Promise<{ [key: string]: any }[]> {

      const [existingRecord] = await this.connection.query(
      `SELECT id FROM operation WHERE id = ?`,[id]
    )

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.ERROR, 
          message:process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND
      )
    }

    try {

      await this.connection.query(
        'UPDATE operation SET operation =?,category_id =? WHERE id = ?',
        [operationEntity.operation,
        operationEntity.category_id,
          id
        ]
      );
      const [cate] = await this.dynamicConnection.query(`select id from operation_category where Hospital_id = ? and
    hospital_operation_category_id = ?`, [
        operationEntity.Hospital_id,
        operationEntity.category_id

      ])

      await this.dynamicConnection.query(
        'update operation SET operation =?,category_id =? where hospital_operation_id = ? and Hospital_id = ?',
        [
          operationEntity.operation,
          cate.id,
          id,
          operationEntity.Hospital_id
        ]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.OPERATION_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM operation WHERE id = ?', [id])
        }
      }];
    } catch (error) {

       throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);   
    }
  }

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

      const [existingRecord] = await this.connection.query(
      `SELECT id FROM operation WHERE id = ?`,[id]
    )

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.ERROR,
          message:process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND
      )
    }

    try {

      await this.connection.query('DELETE FROM operation WHERE id = ?', [id]);

      const operation = await this.dynamicConnection.query(`select id from operation where hospital_operation_id = ?`, [id]);
      const operations = operation[0].id;

      await this.dynamicConnection.query(`delete from operation where id = ? and Hospital_id = ?`, [operations, Hospital_id])
      return [{
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED
      }
      ];
    } catch (error) {
   throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);      }
  }


  async setupOperation(search: string): Promise<SetupOperationOperation[]> {

    let query = ` select operation.id,operation.operation,operation_category.category,operation.category_id,operation_category.is_active from operation
    join operation_category ON operation.category_id = operation_category.id `
    let values = []
    if (search) {
      query += ` WHERE ( operation.operation LIKE ? OR operation_category.category LIKE ? )  `
      values.push("%" + search + "%")
      values.push("%" + search + "%")
    }
    let final = query;
    const OperationSearch = await this.connection.query(final, values);
    return OperationSearch;


  }


  async getoperation(limit: number, page: number, search: string) {
    try {
      const offset = limit * (page - 1);
      let searchClause = '';
      let dateCondition = '';

      if (search) {
        searchClause = `(
          operation.operation LIKE '%${search}%' OR
          operation_category.category LIKE '%${search}%'
        )`;
        dateCondition = ` AND ${searchClause}`;
      }

      const operation = await this.connection.query(
        `select operation.id,operation.operation,operation_category.category,operation.category_id,operation_category.is_active from operation
        join operation_category ON operation.category_id = operation_category.id where operation_category.id ${dateCondition} LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );

      let [totalist] = await this.connection.query(
        `SELECT count(operation.id) as total FROM operation 
        join operation_category ON operation.category_id = operation_category.id where operation_category.id ${dateCondition}`
      );

      let variable = {
        details: operation,
        total: totalist.total,
        page: page,
        limit: limit
      };

      return variable;

    } catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




}
