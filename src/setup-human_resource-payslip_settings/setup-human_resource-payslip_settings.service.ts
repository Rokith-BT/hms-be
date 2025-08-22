import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupHumanResourcePayslipSetting } from './entities/setup-human_resource-payslip_setting.entity';
import {CountDto} from './dto/setup-human_resource-payslip_settings.dto';

@Injectable()
export class SetupHumanResourcePayslipSettingsService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(payslip_setting_entity: SetupHumanResourcePayslipSetting) {
    try {
      const [{ total_percentage }] = await this.connection.query(
        `SELECT COALESCE(SUM(default_percentage), 0) as total_percentage 
       FROM payslip_settings WHERE payslip_category_id = ? AND payslip_setting_name != 'Other Pay'`,
        [payslip_setting_entity.payslip_category_id],
      );

      const newTotalPercentage =
        Number(total_percentage) +
        Number(payslip_setting_entity.default_percentage);

      if (newTotalPercentage > 100) {
        throw new Error('Total Earning percentage cannot exceed 100%.');
      }

      const result = await this.connection.query(
        `INSERT INTO payslip_settings (payslip_category_id, payslip_setting_name, default_amount, default_percentage) 
       VALUES (?,?,?,?)`,
        [
          payslip_setting_entity.payslip_category_id,
          payslip_setting_entity.payslip_setting_name,
          payslip_setting_entity.default_amount,
          payslip_setting_entity.default_percentage,
        ],
      );


      const [payslip_category] = await this.dynamicConnection.query(
        `SELECT id FROM payslip_category WHERE hospital_id = ? AND hos_payslip_category_id = ?`,
        [
          payslip_setting_entity.hospital_id,
          payslip_setting_entity.payslip_category_id,
        ],
      );

      console.log(
        'payslip_category',
        payslip_category.id,
        payslip_setting_entity.hospital_id,
        payslip_setting_entity.payslip_category_id,
      );

      await this.dynamicConnection.query(
        `INSERT INTO payslip_settings (payslip_category_id, payslip_setting_name, default_amount, default_percentage, hospital_id, hos_payslip_settings_id) 
       VALUES (?,?,?,?,?,?)`,
        [
          payslip_category.id,
          payslip_setting_entity.payslip_setting_name,
          payslip_setting_entity.default_amount,
          payslip_setting_entity.default_percentage,
          payslip_setting_entity.hospital_id,
          result.insertId,
        ],
      );

      console.log(
        'admin inserted',
        payslip_category.id,
        payslip_setting_entity.payslip_setting_name,
        payslip_setting_entity.default_amount,
        payslip_setting_entity.default_percentage,
        payslip_setting_entity.hospital_id,
        result.insertId,
      );

      return [
        {
          data: {
            id: result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.PAYSLIP_SETTING,
            'inserted data': await this.connection.query(
              `SELECT * FROM payslip_settings WHERE id = ?`,
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

  async findAll() {
    try {
       const payslip_settings = await this.connection
      .query(`select payslip_settings.id,payslip_category.category_name as payslip_category_name,payslip_settings.payslip_setting_name,
payslip_settings.default_amount,payslip_settings.default_percentage 
from payslip_settings
left join payslip_category on payslip_settings.payslip_category_id = payslip_category.id`);
    return payslip_settings;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async findOne(id: number) {
    try {
       const payslip_settings_id = await this.connection.query(
      `select payslip_settings.id,payslip_category.category_name as payslip_category_name,payslip_settings.payslip_setting_name,
      payslip_settings.default_amount,payslip_settings.default_percentage 
      from payslip_settings
      left join payslip_category on payslip_settings.payslip_category_id = payslip_category.id where payslip_settings.id = ?`,
      [id],
    );
    return payslip_settings_id;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async update(
    id: number,
    payslip_setting_entity: SetupHumanResourcePayslipSetting,
  ) {
    try {
      const [{ total_percentage }] = await this.connection.query(
        `SELECT COALESCE(SUM(default_percentage), 0) as total_percentage 
       FROM payslip_settings 
       WHERE payslip_category_id = ? AND payslip_setting_name != 'Other Pay' AND id != ?`,
        [payslip_setting_entity.payslip_category_id, id],
      );

      const newTotalPercentage =
        Number(total_percentage) +
        Number(payslip_setting_entity.default_percentage);

      if (newTotalPercentage > 100) {
        throw new Error('Total Earning percentage cannot exceed 100%.');
      }

      await this.connection.query(
        `UPDATE payslip_settings 
       SET payslip_category_id = ?, payslip_setting_name = ?, default_amount = ?, default_percentage = ? 
       WHERE id = ?`,
        [
          payslip_setting_entity.payslip_category_id,
          payslip_setting_entity.payslip_setting_name,
          payslip_setting_entity.default_amount,
          payslip_setting_entity.default_percentage,
          id,
        ],
      );

      const [payslip_category_id] = await this.dynamicConnection.query(
        `select id from payslip_category where hospital_id = ? and hos_payslip_category_id = ?`,
        [
          payslip_setting_entity.hospital_id,
          payslip_setting_entity.payslip_category_id,
        ],
      );
      await this.dynamicConnection.query(
        `UPDATE payslip_settings 
       SET payslip_category_id = ?, payslip_setting_name = ?, default_amount = ?, default_percentage = ? 
       WHERE hos_payslip_settings_id = ? and hospital_id = ?`,
        [
          payslip_category_id.id,
          payslip_setting_entity.payslip_setting_name,
          payslip_setting_entity.default_amount,
          payslip_setting_entity.default_percentage,
          id,
          payslip_setting_entity.hospital_id,
        ],
      );

      return {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.PAYSLIP_SETTING_UPDATED,
        'updated data': await this.connection.query(
          `SELECT * FROM payslip_settings WHERE id = ?`,
          [id],
        ),
      };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number, hospital_id: number) {
    try {
      await this.connection.query(`DELETE from payslip_settings where id = ?`, [
        id,
      ]);
      await this.dynamicConnection.query(
        `DELETE FROM payslip_settings where hos_payslip_settings_id = ? and hospital_id = ?`,
        [id, hospital_id],
      );
      return [
        {
         "status":  process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
        },
      ];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }



  async findAllPayrollSettings(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const payslip_setting = await this.connection.query(
            `SELECT * FROM payslip_settings LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM payslip_settings`,
            );
 
      let out = {
        details: payslip_setting,
        total: total_list.total,
      };
      return out;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findPayrollSettingsSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select payslip_settings.id,payslip_category.category_name as payslip_category_name,payslip_settings.payslip_setting_name,
payslip_settings.default_amount,payslip_settings.default_percentage 
from payslip_settings
left join payslip_category on payslip_settings.payslip_category_id = payslip_category.id `;

    let countQuery = `
      SELECT COUNT(payslip_settings.id) AS total 
      FROM payslip_settings 
      left join payslip_category on payslip_settings.payslip_category_id = payslip_category.id`;

    if (search) {

      const condition = `
      WHERE payslip_category.category_name LIKE ? or payslip_settings.payslip_setting_name LIKE ? or payslip_settings.default_percentage LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY payslip_settings.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const PayslipSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PayslipSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}
