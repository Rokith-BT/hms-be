import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FinanceIncome } from "./entities/finance_income.entity";
import { CountDto } from './dto/finance_income.dto';


@Injectable()
export class FinanceIncomeService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(Entity: FinanceIncome) {
    try {
      const income = await this.connection.query(
        `Insert into income(inc_head_id,name,invoice_no,date,amount,note,is_deleted,documents,generated_by,is_active) values(?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.inc_head_id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.note,
          Entity.is_deleted,
          Entity.documents,
          Entity.generated_by,
          Entity.is_active,
        ],
      );

      const [inc_head_id] = await this.dynamicConnection.query(
        `select id from income_head where Hospital_id = ? and hospital_income_head_id = ?`,
        [Entity.hospital_id, Entity.inc_head_id],
      );

      await this.dynamicConnection.query(
        `insert into income(inc_head_id,name,invoice_no,date,amount,note,is_deleted,documents,generated_by,is_active,hospital_id,hos_income_id) 
  values (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          inc_head_id.id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.note,
          Entity.is_deleted,
          Entity.documents,
          Entity.generated_by,
          Entity.is_active,
          Entity.hospital_id,
          income.insertId,
        ],
      );
      return [
        {
          data: {
            id: income.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.FINANCE_INCOME,
            inserted_data: await this.connection.query(
              `select income.name as Name,income.invoice_no as invoice_number, income.date as Date,income.note as Description,income.documents as documents,
income_head.income_category as income_head,income.amount as Amount from income
left join income_head ON income.inc_head_id = income_head.id where income.id = ?`,
              [income.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findall() {
    try {
      const getincomes = await this.connection
        .query(`select income.id,income.name as Name,income.invoice_no as invoice_number, income.date as Date,income.note as Description,income.documents as documents,
    income_head.income_category as Income_Head,income.amount as Amount from income
    left join income_head ON income.inc_head_id = income_head.id`);
      return getincomes;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findone(id: number) {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM income WHERE id = ?`, [id])

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
      const getincome = await this.connection.query(
        `select income.id,income.name as Name,income.invoice_no as invoice_number, income.date as Date,income.note as Description,income.documents as documents,
        income_head.income_category as income_head,income.amount as Amount from income
        left join income_head ON income.inc_head_id = income_head.id where income.id = ?`,
        [id],
      );
      return getincome;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, Entity: FinanceIncome) {
    try {
      await this.connection.query(
        `
      update income SET inc_head_id = ?, name = ?, invoice_no = ?, date = ?, amount = ?, note = ?, documents = ? where income.id = ?`,
        [
          Entity.inc_head_id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.note,
          Entity.documents,
          id,
        ],
      );

      const [inc_head_id] = await this.dynamicConnection.query(
        `select id from income_head where Hospital_id = ? and hospital_income_head_id = ?`,
        [Entity.hospital_id, Entity.inc_head_id],
      );

      await this.dynamicConnection.query(
        `update income SET inc_head_id = ?, name = ?, invoice_no = ?, date = ?, amount = ?, note = ?, documents = ? where hos_income_id = ? and hospital_id = ?`,
        [
          inc_head_id.id,
          Entity.name,
          Entity.invoice_no,
          Entity.date,
          Entity.amount,
          Entity.note,
          Entity.documents,
          id,
          Entity.hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.FINANCE_INCOME_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM income WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number, Entity: FinanceIncome) {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM income WHERE id = ?`, [id])

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
      await this.connection.query(
        `Delete  from income where id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `Delete  from income where hospital_id = ? and hos_income_id = ? `,
        [Entity.hospital_id, id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async finance_income(limit: number, page: number, search: string) {
    try {

      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';

      if (search) {
        searchClause = `(
      income.id LIKE '%${search}%' OR
      income.name LIKE '%${search}%' OR
      income.invoice_no LIKE '%${search}%' OR
      income.date LIKE '%${search}%' OR
      income.note LIKE '%${search}%' OR
      income_head.income_category LIKE '%${search}%' OR
      income.amount LIKE '%${search}%'
      )`
        dateCondition = ` AND ${searchClause}`;
      }

      const finance_incomes = await this.connection.query(`select income.id,income.name as Name,income.invoice_no as invoice_number, income.date as Date,income.note as Description,
    income.documents as documents,
    income_head.income_category as Income_Head,income.amount as Amount from income
    left join income_head ON income.inc_head_id = income_head.id WHERE income.id  ${dateCondition} order by income.id desc LIMIT ? OFFSET ? `, [
        Number(limit), Number(offset)
      ]);

      let [totalist] = await this.connection.query(`SELECT count(income.id) as total FROM income 
      left join income_head ON income.inc_head_id = income_head.id WHERE income.id ${dateCondition}`);

      let variable = {
        details: finance_incomes,
        total: totalist.total,
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
