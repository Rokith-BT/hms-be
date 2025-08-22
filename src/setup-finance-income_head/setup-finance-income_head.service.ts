import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupFinanceIncomeHead } from "./entities/setup-finance-income_head.entity";

@Injectable()
export class SetupFinanceIncomeHeadService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    income_headEntity: SetupFinanceIncomeHead,
  ): Promise<{ [key: string]: any }[]> {

    try {

      const [existingUnitType] = await this.connection.query(
        `SELECT id FROM income_head WHERE LOWER(TRIM(income_category)) = LOWER(TRIM(?)) LIMIT 1`,
        [income_headEntity.income_category]
      );

      if (existingUnitType) {
        return [
          {
            status:  process.env.DUPLICATE_NAME,
            message: process.env.INCOME_HEAD_EXIST,
          },
        ];
      }

      const result = await this.connection.query(
        'INSERT INTO income_head (income_category,description,is_active,is_deleted) VALUES (?,?,?,?)',
        [
          income_headEntity.income_category,
          income_headEntity.description,
          income_headEntity.is_active,
          income_headEntity.is_deleted,
        ],
      );
      await this.dynamicConnection.query(
        'insert into income_head (income_category,description,is_active,is_deleted,Hospital_id,hospital_income_head_id) values (?,?,?,?,?,?)',
        [
          income_headEntity.income_category,
          income_headEntity.description,
          income_headEntity.is_active,
          income_headEntity.is_deleted,
          income_headEntity.Hospital_id,
          result.insertId,
        ],
      );
      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.INCOME_HEAD,
            inserted_data: await this.connection.query(
              'SELECT * FROM income_head WHERE id = ?',
              [result.insertId],
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

  async findAll(): Promise<SetupFinanceIncomeHead[]> {
    try {
      const income_head = await this.connection.query(
        'SELECT * FROM income_head',
      );
      return income_head;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<SetupFinanceIncomeHead | null> {

    const [existingincome] = await this.connection.query(`select id from income_head where id = ?`, [id]);

    if (!existingincome || existingincome.length == 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,

      )
    }

    try {
      const income_head = await this.connection.query(
        'SELECT * FROM income_head WHERE id = ?',
        [id],
      );
      return income_head;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    id: string,
    income_headEntity: SetupFinanceIncomeHead,
  ): Promise<{ [key: string]: any }[]> {

    const [existingincome] = await this.connection.query(`select id from income_head where id = ?`, [id]);

    if (!existingincome || existingincome.length == 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,

      )
    }

    try {
      await this.connection.query(
        'UPDATE income_head SET income_category =?, description =? WHERE id = ?',
        [income_headEntity.income_category, income_headEntity.description, id],
      );
      await this.dynamicConnection.query(
        'update income_head SET  income_category =?, description =? where hospital_income_head_id = ? and Hospital_id = ? ',
        [
          income_headEntity.income_category,
          income_headEntity.description,
          id,
          income_headEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status:  process.env.SUCCESS_STATUS_V2,
            messege: process.env.INCOME_HEAD_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM income_head WHERE id = ?',
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

    const [existingincome] = await this.connection.query(`select id from income_head where id = ?`, [id]);

    if (!existingincome || existingincome.length == 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,

      )
    }


    try {
      await this.connection.query(
        'DELETE FROM income_head WHERE id = ?',
        [id],
      );
      const [expense_head] = await this.dynamicConnection.query(
        `select id from income_head where hospital_income_head_id = ?`,
        [id],
      );
      await this.dynamicConnection.query(
        `delete from income_head where id = ? and Hospital_id = ?`,
        [expense_head.id, Hospital_id],
      );
      return [
        {
          status:process.env.SUCCESS_STATUS_V2,
          message:process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async SetupIncomehead(search: string): Promise<SetupFinanceIncomeHead[]> {
    try {
       let query = ` SELECT * FROM income_head `;
    let values = [];
    if (search) {
      query += ` WHERE ( income_head.income_category LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupIncomehead = await this.connection.query(final, values);
    return setupIncomehead;
    } catch (error) {
        throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR); 
    }
   
  }

  async findALLincome_head(limit:number,page:number) {
    try {
      
      const offset = limit * (page - 1);

      const income_headd = await this.connection.query(`select * from income_head LIMIT ? OFFSET ?`,[
        Number(limit),Number(offset)
      ]);

      let [totallist] = await this.connection.query(`select count(id) as total from income_head`)

      let variable = {
        details: income_headd,
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

