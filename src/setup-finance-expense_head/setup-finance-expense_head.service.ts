import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupFinanceExpenseHead } from "./entities/setup-finance-expense_head.entity";
import { identity } from "rxjs";

@Injectable()
export class SetupFinanceExpenseHeadService {
  constructor(
    private readonly connection: DataSource,
        @InjectDataSource('AdminConnection')
        private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    expense_headEntity: SetupFinanceExpenseHead,
  ): Promise<{ [key: string]: any }[]> {
    
    try {

      const [existingExpense] = await this.connection.query(`
        SELECT id FROM expense_head WHERE exp_category = ? LIMIT 1`,
      [expense_headEntity.exp_category]);

      if(existingExpense) {
        return [
          {
            status: process.env.DUPLICATE_NAME,
            message: process.env.INCOME_HEAD_EXIST,
          },
        ]
      }

      const result = await this.connection.query(
        'INSERT INTO expense_head (exp_category,description,is_active,is_deleted) VALUES (?,?,?,?)',
        [
          expense_headEntity.exp_category,
          expense_headEntity.description,
          expense_headEntity.is_active,
          expense_headEntity.is_deleted,
        ],
      );

       await this.dynamicConnection.query(
        'INSERT INTO expense_head (exp_category,description,is_active,is_deleted,Hospital_id,hospital_expense_head_id) VALUES (?,?,?,?,?,?)',
        [
          expense_headEntity.exp_category,
          expense_headEntity.description,
          expense_headEntity.is_active,
          expense_headEntity.is_deleted,
          expense_headEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status:  process.env.SUCCESS_STATUS_V2,
            messege: process.env.EXPENSE_HEAD,
            inserted_data: await this.connection.query(
              'SELECT * FROM expense_head WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:  process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupFinanceExpenseHead[]> {
    try {
      const expense_head = await this.connection.query(
        'SELECT * FROM expense_head',
      );
      return expense_head;
    } catch (error) {
  throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message:  process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
  }

  async findOne(id: string): Promise<SetupFinanceExpenseHead | null> {

    const [existingExpense] = await this.connection.query(`SELECT id from expense_head where id = ?`,[id]);

    if (!existingExpense || existingExpense.length == 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND
      )
    }

    try {
      const expense_head = await this.connection.query(
        'SELECT * FROM expense_head WHERE id = ?',
        [id],
      );
        if (expense_head.length === 1) {
        return expense_head;
      } else {
        return null;
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);        }
    
  }

  async update(
    id: string,
    expense_headEntity: SetupFinanceExpenseHead,
  ): Promise<{ [key: string]: any }[]> {

    const [existingExpense] = await this.connection.query(`
      SELECT id FROM expense_head WHERE id = ?`,[id]);


    if (!existingExpense || existingExpense.length === 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

        try {
       await this.connection.query(
        'UPDATE expense_head SET exp_category = ?, description = ? WHERE id = ?',
        [expense_headEntity.exp_category, expense_headEntity.description, id],
      );
      
       await this.dynamicConnection.query(
        'update expense_head SET exp_category =?, description =? where hospital_expense_head_id = ? and Hospital_id = ?',
        [
          expense_headEntity.exp_category,
          expense_headEntity.description,
          id,
          expense_headEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.EXPENSE_HEAD_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM expense_head WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM expense_head WHERE id = ?', [id],
      );
  
      if (!existingRecord || existingRecord.length === 0) {
        throw new HttpException(
          {
            status: process.env.IDENTITY,
            message: process.env.EXISTING_RECORD,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      try {
       await this.connection.query(
        'DELETE FROM expense_head WHERE id = ?',
        [id],
      );
      const [expense_head] = await this.dynamicConnection.query(
        `select id from expense_head where hospital_expense_head_id = ?`,
        [id],
      );
      await this.dynamicConnection.query(
        `delete from expense_head where id = ? and Hospital_id = ?`,
        [expense_head.id, Hospital_id],
      );
    
    return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED
      },
    ];
  } catch (error) {

    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:  process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  async SetupExpensehead(search: string): Promise<SetupFinanceExpenseHead[]> {
    try {
      let query = ` SELECT * FROM expense_head `;
    let values = [];
    if (search) {
      query += ` WHERE ( expense_head.exp_category LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupExpensehead = await this.connection.query(final, values);
    return setupExpensehead;
    } catch (error) {
          throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR); 
    }
    
  }

  async findALLexpense_head(limit:number,page:number) {
    try {
      
      const offset = limit * (page - 1);

      const expense_headd = await this.connection.query(`SELECT * FROM expense_head LIMIT ? OFFSET ?`,[
        Number(limit),Number(offset)
      ]);

      let [totallist] = await this.connection.query(`select count(id) as total from expense_head`)

      let variable = {
        details: expense_headd,
        total:totallist.total,
        page:page,
        limit:limit
      }

      return variable;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
    }
  }

