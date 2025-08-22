
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupReferralReferralCommission } from './entities/setup-referral-referral_commission.entity';
import {CountDto} from './dto/setup-referral-referral_commission.dto';


@Injectable()
export class SetupReferralReferralCommissionService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }



  async create(referral_commissionEntities: SetupReferralReferralCommission[]) {
    try {
      const results = [];
      for (const referral_commissionEntity of referral_commissionEntities) {
        const result = await this.connection.query('INSERT INTO referral_commission (referral_category_id, referral_type_id, commission, is_active) VALUES (?, ?, ?, 1)',
          [
            referral_commissionEntity.referral_category_id,
            referral_commissionEntity.referral_type_id,
            referral_commissionEntity.commission
          ]

        );

        const [referral_category] = await this.dynamicConnection.query(`select id from referral_category where Hospital_id = ? and  hospital_referral_category_id = ?`, [
          referral_commissionEntity.Hospital_id,
          referral_commissionEntity.referral_category_id
        ])

        const [referral_type] = await this.dynamicConnection.query(`select id from referral_type where Hospital_id = ? and hospital_referral_type_id = ?`, [
          referral_commissionEntity.Hospital_id,
          referral_commissionEntity.referral_type_id
        ])

        await this.dynamicConnection.query(`Insert into referral_commission (referral_category_id, referral_type_id, commission, is_active,hospital_referral_commission_id,Hospital_id) values (?,?,?,1,?,?)`, [
          referral_category.id,
          referral_type.id,
          referral_commissionEntity.commission,
          result.insertId,
          referral_commissionEntity.Hospital_id
        ])

        results.push(result);
      }


      return results;
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async update(referral_commissionEntities: SetupReferralReferralCommission[]) {

    try {
      const results = [];

      for (const referral_commissionEntity of referral_commissionEntities) {
        const existingRecord = await this.connection.query('SELECT id FROM referral_commission WHERE referral_category_id = ? AND referral_type_id = ?', [
          referral_commissionEntity.referral_category_id,
          referral_commissionEntity.referral_type_id
        ]);

        if (existingRecord.length > 0) {
          const result = await this.connection.query('UPDATE referral_commission SET commission = ? WHERE referral_category_id = ? AND referral_type_id = ?', [
            referral_commissionEntity.commission,
            referral_commissionEntity.referral_category_id,
            referral_commissionEntity.referral_type_id
          ]);
          results.push(result);
        } else {
          const result = await this.connection.query('INSERT INTO referral_commission (referral_category_id, referral_type_id, commission, is_active) VALUES (?, ?, ?, 1)', [
            referral_commissionEntity.referral_category_id,
            referral_commissionEntity.referral_type_id,
            referral_commissionEntity.commission
          ]);
          results.push(result);
        }




        for (const referral_commissionEntity of referral_commissionEntities) {

          const record = await this.dynamicConnection.query(`select id from referral_commission where hospital_referral_commission_id = ? and Hospital_id = ?`, [
            referral_commissionEntity.id,
            referral_commissionEntity.Hospital_id
          ])

          if (record.length > 0) {
            await this.dynamicConnection.query(`update referral_commission SET commission = ? where hospital_referral_commission_id = ? and Hospital_id = ?`, [
              referral_commissionEntity.commission,
              referral_commissionEntity.id,
              referral_commissionEntity.Hospital_id
            ])


          }
          else {
            const reso = await this.dynamicConnection.query('INSERT INTO referral_commission (referral_category_id, referral_type_id, commission, is_active,Hospital_id,hospital_referral_commission_id) VALUES (?, ?, ?, 1,?,?)', [
              referral_commissionEntity.referral_category_id,
              referral_commissionEntity.referral_type_id,
              referral_commissionEntity.commission,
              referral_commissionEntity.Hospital_id,
              referral_commissionEntity.id
            ]);
            results.push(reso);
          }
        }
      }
      return results;
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }


  async findAll(): Promise<SetupReferralReferralCommission[]> {
    try {
       const referral_commission = await this.connection.query(`select referral_commission.id, referral_category.name CATEGORY_NAME,referral_type.name TYPE_NAME,referral_commission.commission from referral_commission
    left join referral_category ON referral_commission.referral_category_id = referral_category.id
    left join referral_type ON referral_commission.referral_type_id = referral_type.id;`);
    return referral_commission;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

  async remove(referral_category_id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM referral_commission WHERE referral_category_id = ?', [referral_category_id]);

      const [ref] = await this.dynamicConnection.query(`select id from referral_category where hospital_referral_category_id = ? and Hospital_id = ?`, [referral_category_id, Hospital_id])
      await this.dynamicConnection.query(`delete from referral_commission where referral_category_id = ?`, [ref.id])

      return [{
        "status": process.env.SUCCESS_STATUS_V2,
        "message": " id: " + referral_category_id + " deleted successfully"
      }
      ];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }



  async findReferralCommissionSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select referral_commission.id, referral_category.name CATEGORY_NAME,referral_type.name TYPE_NAME,referral_commission.commission from referral_commission
    left join referral_category ON referral_commission.referral_category_id = referral_category.id
    left join referral_type ON referral_commission.referral_type_id = referral_type.id `;

    let countQuery = `
      SELECT COUNT(referral_commission.id) AS total from referral_commission
    left join referral_category ON referral_commission.referral_category_id = referral_category.id
    left join referral_type ON referral_commission.referral_type_id = referral_type.id `;

    if (search) {

      const condition = `
      WHERE referral_commission.id LIKE ? OR referral_category.name LIKE ? OR referral_type.name LIKE ? OR referral_commission.commission LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY referral_commission.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const ReferralCommissionSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: ReferralCommissionSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
      console.log(error,'errr')
      throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }

}
