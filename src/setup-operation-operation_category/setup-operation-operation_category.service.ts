import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupOperationOperationCategory } from "./entities/setup-operation-operation_category.entity";


@Injectable()
export class SetupOperationOperationCategoryService {
  constructor(private readonly connection: DataSource,
      @InjectDataSource('AdminConnection')
      private readonly  dynamicConnection: DataSource,
  ) { }

  async create(operation_categoryrEntity: SetupOperationOperationCategory): Promise<{ [key: string]: any }[]> {

    try {

      const [existingExpense] = await this.connection.query(`
        SELECT id FROM operation_category WHERE category = ? LIMIT 1`,
      [operation_categoryrEntity.category]);

      if (existingExpense) {
        
        return [{
          status: process.env.DUPLICATE_NAME,
          message: process.env.OPERATION_CATEGORY_EXIST,
        }];
      }

      const result = await this.connection.query(
        'INSERT INTO operation_category (category,is_active) VALUES (?,?)',
        [operation_categoryrEntity.category,
        operation_categoryrEntity.is_active

        ]
      );



      await this.dynamicConnection.query(`INSERT INTO operation_category(category,is_active,Hospital_id,hospital_operation_category_id) values (?,?,?,?)`, [
        operation_categoryrEntity.category,
        operation_categoryrEntity.is_active,
        operation_categoryrEntity.Hospital_id,
        result.insertId
      ])
      return [{
        "data": {
          "id": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "message": process.env.OPERATION_CATEGORY,
          "inserted_data": await this.connection.query('SELECT * FROM operation_category WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
  throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }


  async findAll(): Promise<SetupOperationOperationCategory[]> {
    try {
       const operation_category = await this.connection.query('SELECT * FROM operation_category');
    return operation_category;
    } catch (error) {
          throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:  process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }




  async findOne(id: string): Promise<SetupOperationOperationCategory[]> {

    const [existingRecord] = await this.connection.query(`
      SELECT id from operation_category WHERE id = ?`,
    [id]);

    if(!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.ERROR,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }


    try {
         const unit = await this.connection.query('SELECT * FROM operation_category WHERE id = ?', [id]);
      return unit;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);  
    }
 
   
  }

  async update(id: string, operation_categoryEntity: SetupOperationOperationCategory): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM operation_category WHERE id = ?`,[id]);

      if(!existingRecord) {
        return [{status: process.env.ERROR, 
          message: process.env.EXISTING_RECORD}];

      }

    try {
      await this.connection.query(
        'UPDATE operation_category SET category =? WHERE id = ?',
        [operation_categoryEntity.category,
          id
        ]
      );

      await this.dynamicConnection.query(
        'update operation_category SET category = ? where hospital_operation_category_id =? and Hospital_id = ?',

        [operation_categoryEntity.category,
          id,
        operation_categoryEntity.Hospital_id

        ]
      );

      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege:process.env.OPERATION_CATEGORY_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM operation_category WHERE id = ?', [id])
        }
      }];
    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM operation_category WHERE id = ?`,[id]);

      if(!existingRecord) {
        return [{status: process.env.ERROR,
           message: process.env.EXISTING_RECORD}];

      }
      

try {
  
    await this.connection.query('DELETE FROM operation_category WHERE id = ?', [id]);

    
      const operation_category = await this.dynamicConnection.query(`select id from operation_category where hospital_operation_category_id = ?`, [id]);
      const oper_cat = operation_category[0].id;

      await this.dynamicConnection.query(`delete from operation_category where id = ? and Hospital_id = ?`, [oper_cat, Hospital_id])
      return [{
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED
      }
      ];
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
  }




  async setupOperationcategory(search: string): Promise<SetupOperationOperationCategory[]> {
    let query = ` SELECT * FROM operation_category `
    let values = []
    if (search) {
      query += ` WHERE ( operation_category.category LIKE ? )  `
      values.push("%" + search + "%")
    }
    let final = query;
    const OperationCategorySearch = await this.connection.query(final, values);
    return OperationCategorySearch;


  }


// async findalloperation_category(limit: number,
//   page: number,
//   search: string): Promise<{ details: SetupOperationOperationCategory[], total: number, limit: number }> {
//     try {
//       const offset = limit * (page - 1);
//       let dateCondition = '';
//       let searchClause = '';
// console.log("aa");

//       if(search) {
//          searchClause = `(operation_category.category LIKE '%${search}%' )`;
//       }
//       console.log("bb");
      
//       dateCondition = ` AND ${searchClause}`;
// console.log("ddd",);

//       const operation_category = await this.connection.query(`select operation_category.id,operation_category.category,operation_category.is_active from operation_category
//          WHERE operation_category.id ${dateCondition} LIMIT ? OFFSET ?`, [
//         Number(limit), Number(offset)
//       ])
// console.log("ccc",operation_category);

//       let [totalist] = await this.connection.query(`SELECT count(operation_category.id) as total from operation_category where operation_category.id ${dateCondition}`);

//       let variable = {
//         details: operation_category,
//         total: totalist.total,
//         page:page,
//         limit:limit
//       }

//       return variable;

//     } catch(error) {
//       throw new HttpException({
//         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//         message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
//       }, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
  
//   }

async findalloperation_category(
  limit: number,
  page: number,
  search: string
)
{
  try {
    const offset = limit * (page - 1);
    let searchClause = '';


    if (search) {
      searchClause = `operation_category.category LIKE '%${search}%'`;
    }


    const baseWhereClause = `WHERE 1=1 ${searchClause ? `AND ${searchClause}` : ''}`;


    const operation_category = await this.connection.query(`
      SELECT operation_category.id, operation_category.category, operation_category.is_active 
      FROM operation_category
      ${baseWhereClause}
      LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]
    );


    const [totalList] = await this.connection.query(`
      SELECT COUNT(operation_category.id) AS total 
      FROM operation_category
      ${baseWhereClause}
    `);

    let variable = {
      details:operation_category,
      total:totalList.total,
      page: page,
      limit: limit
    }

    return variable;
  } catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


}