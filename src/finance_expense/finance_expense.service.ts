import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { FinanceExpense } from "./entities/finance_expense.entity"
import { CountDto } from './dto/finance_expense.dto';



@Injectable()
export class FinanceExpenseService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(Entity: FinanceExpense) {
    try {
      const expense = await this.connection.query(`insert into expenses(exp_head_id,name,invoice_no,date,amount,documents,note,is_active,is_deleted,generated_by) values(?,?,?,?,?,?,?,?,?,?)`, [
        Entity.exp_head_id,
        Entity.name,
        Entity.invoice_no,
        Entity.date,
        Entity.amount,
        Entity.documents,
        Entity.note,
        Entity.is_active,
        Entity.is_deleted,
        Entity.generated_by,
      ])
      const [exp_head_id] = await this.dynamicConnection.query(`select id from expense_head where Hospital_id = ? and hospital_expense_head_id = ?`,
        [
          Entity.hospital_id,
          Entity.exp_head_id
        ]
      )

      await this.dynamicConnection.query(`insert into expenses (exp_head_id,name,invoice_no,date,amount,documents,note,is_active,is_deleted,generated_by,hospital_id,hos_expenses_id) 
  values(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          exp_head_id.id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.documents,
          Entity.note,
          Entity.is_active,
          Entity.is_deleted,
          Entity.generated_by,
          Entity.hospital_id,
          expense.insertId
        ])
      return [{
        "data": {
          id: expense.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "message": process.env.FINANCE_EXPENSE,
          "inserted_data": await this.connection.query(`select expenses.id,expenses.name as Name,expenses.invoice_no as invoice_number,expenses.date as Date,
            expenses.documents as documents,
expenses.note as Description,expense_head.exp_category as Expense_head,expenses.amount as amount from expenses
left join expense_head on expenses.exp_head_id = expense_head.id where expenses.id = ?`, [expense.insertId])
        }
      }]
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findall() {
    try {
      const expenses = await this.connection.query(`select expenses.id,expenses.name as Name,expenses.invoice_no as invoice_number,expenses.date as Date,
expenses.note as Description,expenses.documents as documents,expense_head.id as expense_head_id,expense_head.exp_category as expense_head,expenses.amount as Amount from expenses
left join expense_head on expenses.exp_head_id = expense_head.id `)
      return expenses;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findone(id: number) {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM expenses WHERE id = ?`, [id])

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.ERROR,
          message: process.env.EXISTING_RECORD
        },
        HttpStatus.NOT_FOUND
      )
    }

    try {
      const expense = await this.connection.query(`select expenses.id,expenses.name as Name,expenses.invoice_no as invoice_number,expenses.date as Date,
expenses.note as Description,expenses.documents as documents,expense_head.id as expense_head_id,expense_head.exp_category as expense_head,expenses.amount as Amount from expenses
left join expense_head on expenses.exp_head_id = expense_head.id where expenses.id = ?`, [id])
      return expense;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async update(id: number, Entity: FinanceExpense) {
    try {
      await this.connection.query(`update expenses set exp_head_id = ?, name = ?, invoice_no = ?, date = ?,
        amount  = ?, documents = ?, note = ? where expenses.id = ?`,
        [
          Entity.exp_head_id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.documents,
          Entity.note,
          id
        ])
      const [exp_head_id] = await this.dynamicConnection.query(`select id from expense_head where Hospital_id = ? and hospital_expense_head_id = ?`,
        [
          Entity.hospital_id,
          Entity.exp_head_id
        ]
      )
      await this.dynamicConnection.query(`update expenses set exp_head_id = ?, name = ?, invoice_no = ?, date = ?,
        amount  = ?, documents = ?, note = ? where hos_expenses_id = ? and  hospital_id = ? `,
        [
          exp_head_id.id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.documents,
          Entity.note,
          id,
          Entity.hospital_id
        ])
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.FINANCE_EXPENSE_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM expenses WHERE id = ?', [id])
        }
      }];

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async remove(id: number, Entity: FinanceExpense) {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM expenses WHERE id = ?`, [id])

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.ERROR,
          message: process.env.EXISTING_RECORD
        },
        HttpStatus.NOT_FOUND
      )
    }

    try {
      await this.connection.query(`delete from expenses where id = ?`, [id])
      await this.dynamicConnection.query(`delete from expenses where hospital_id = ? and hos_expenses_id = ?`,
        [
          Entity.hospital_id,
          id
        ]
      )

      return [{
        "status": process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
      }]

    }
    catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async finance_expense(limit: number, page: number, search: string) {
    try {

      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';

      if (search) {
        searchClause = `(
    expenses.id LIKE '%${search}%' OR
    expenses.name LIKE '%${search}%' OR 
    expenses.invoice_no LIKE '%${search}%' OR
    expenses.date LIKE '%${search}%' OR
     expenses.note LIKE '%${search}% ' OR
     expense_head.exp_category LIKE '%${search}%' OR
     expenses.amount LIKE '%${search}%'
     )`;
        dateCondition = ` AND ${searchClause}`;
      }

      const finance_expenses = await this.connection.query(`select expenses.id,expenses.name as Name,expenses.invoice_no as invoice_number,expenses.date as Date,
expenses.note as Description,expenses.documents as documents,expense_head.id as expense_head_id,expense_head.exp_category as expense_head,expenses.amount as Amount from expenses
left join expense_head on expenses.exp_head_id = expense_head.id WHERE expenses.id ${dateCondition} order by expenses.id desc LIMIT ? OFFSET ?`, [
        Number(limit), Number(offset)])

      let [totalist] = await this.connection.query(`select count(expenses.id) as total from expenses
    left join expense_head on expenses.exp_head_id = expense_head.id WHERE expenses.id ${dateCondition}`);

      let variable = {
        details: finance_expenses,
        total: totalist.total,
        page: page,
        limit: limit,

      }
      return variable;

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }


  }
}