import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ReferralPersonCommission } from "./entities/referral_person_commission.entity";

@Injectable()
export class ReferralPersonCommissionService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async create(createReferralPersonCommission: ReferralPersonCommission[]) {
    try {
      const results = [];
      for (const referral_person_commissionEntity of createReferralPersonCommission) {
        const result = await this.connection.query('INSERT INTO referral_person_commission(referral_person_id, referral_type_id, commission) VALUES (?, ?, ?)',
          [
            referral_person_commissionEntity.referral_person_id,
            referral_person_commissionEntity.referral_type_id,
            referral_person_commissionEntity.commission
          ]
        );
        const [referral_Person] = await this.dynamicConnection.query(`select id from referral_person where Hospital_id = ? and  hos_referral_person_id = ?`, [
          referral_person_commissionEntity.Hospital_id,
          referral_person_commissionEntity.referral_person_id
        ])
        const [referral_type] = await this.dynamicConnection.query(`select id from referral_type where Hospital_id = ? and hospital_referral_type_id = ?`, [
          referral_person_commissionEntity.Hospital_id,
          referral_person_commissionEntity.referral_type_id
        ])
        await this.dynamicConnection.query(`Insert into referral_person_commission (referral_person_id, referral_type_id, commission,hos_referral_person_commission_id,Hospital_id) values (?,?,?,?,?)`, [
          referral_Person.id,
          referral_type.id,
          referral_person_commissionEntity.commission,
          result.insertId,
          referral_person_commissionEntity.Hospital_id
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



  async update(updateReferralPersonCommission: ReferralPersonCommission[]) {

    try {
      const results = [];
      for (const referral_commissionEntity of updateReferralPersonCommission) {
        const existingRecord = await this.connection.query('SELECT id FROM referral_person_commission WHERE referral_person_id = ? AND referral_type_id = ?', [
          referral_commissionEntity.referral_person_id,
          referral_commissionEntity.referral_type_id
        ]);
        if (existingRecord.length > 0) {
          const result = await this.connection.query('UPDATE referral_person_commission SET commission = ? WHERE referral_person_id = ? AND referral_type_id = ?', [
            referral_commissionEntity.commission,
            referral_commissionEntity.referral_person_id,
            referral_commissionEntity.referral_type_id
          ]);
          results.push(result);
        } else {
          const result = await this.connection.query('INSERT INTO referral_person_commission (referral_person_id, referral_type_id, commission) VALUES (?, ?, ?)', [
            referral_commissionEntity.referral_person_id,
            referral_commissionEntity.referral_type_id,
            referral_commissionEntity.commission
          ]);
          results.push(result);
        }
        const [update_admin_referral_Person] = await this.dynamicConnection.query(`select id from referral_person where Hospital_id = ? and  hos_referral_person_id = ?`, [
          referral_commissionEntity.Hospital_id,
          referral_commissionEntity.referral_person_id
        ])
        const [update_admin_referral_type] = await this.dynamicConnection.query(`select id from referral_type where Hospital_id = ? and hospital_referral_type_id = ?`, [
          referral_commissionEntity.Hospital_id,
          referral_commissionEntity.referral_type_id
        ])
        const AdminexistingRecord = await this.dynamicConnection.query('SELECT id FROM referral_person_commission WHERE referral_person_id = ? AND referral_type_id = ?', [
          update_admin_referral_Person.id,
          update_admin_referral_type.id
        ]);

        if (AdminexistingRecord.length > 0) {
          const result = await this.dynamicConnection.query('UPDATE referral_person_commission SET commission = ? WHERE referral_person_id = ? AND referral_type_id = ?', [
            referral_commissionEntity.commission,
            update_admin_referral_Person.id,
            update_admin_referral_type.id
          ]);
          results.push(result);
        } else {
          const result = await this.dynamicConnection.query('INSERT INTO referral_person_commission (referral_person_id, referral_type_id, commission) VALUES (?, ?, ?)', [
            update_admin_referral_Person.id,
            update_admin_referral_type.id,
            referral_commissionEntity.commission
          ]);
          results.push(result);
        }
      }

      return results;
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
}