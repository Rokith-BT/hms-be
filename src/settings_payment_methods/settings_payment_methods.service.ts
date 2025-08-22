import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SettingsPaymentMethod } from "./entities/settings_payment_method.entity";

@Injectable()
export class SettingsPaymentMethodsService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,) { }



  async create(SettingsPaymentMethodEntity: SettingsPaymentMethod) {

    try {
      const [check] = await this.connection.query(`select id from payment_settings where payment_type = ?`, [SettingsPaymentMethodEntity.payment_type])
      if (check) {
        await this.connection.query(`update payment_settings SET payment_type = ?, api_username = ?, api_secret_key = ?, salt = ?, api_publishable_key = ?, paytm_website = ?,
    paytm_industrytype = ?, api_password = ?, api_signature = ?, api_email = ?, paypal_demo = ?, account_no = ?, is_active = ? where id = ?`, [
          SettingsPaymentMethodEntity.payment_type,
          SettingsPaymentMethodEntity.api_username,
          SettingsPaymentMethodEntity.api_secret_key,
          SettingsPaymentMethodEntity.salt,
          SettingsPaymentMethodEntity.api_publishable_key,
          SettingsPaymentMethodEntity.paytm_website,
          SettingsPaymentMethodEntity.paytm_industrytype,
          SettingsPaymentMethodEntity.api_password,
          SettingsPaymentMethodEntity.api_signature,
          SettingsPaymentMethodEntity.api_email,
          SettingsPaymentMethodEntity.paypal_demo,
          SettingsPaymentMethodEntity.account_no,
          SettingsPaymentMethodEntity.is_active,
          check.id
        ])
         await this.dynamicConnection.query(`update payment_settings SET payment_type = ?, api_username = ?, api_secret_key = ?, salt = ?, api_publishable_key = ?, paytm_website = ?,
    paytm_industrytype = ?, api_password = ?, api_signature = ?, api_email = ?, paypal_demo = ?, account_no = ?, is_active = ? where hos_payment_settings_id = ?`, [
          SettingsPaymentMethodEntity.payment_type,
          SettingsPaymentMethodEntity.api_username,
          SettingsPaymentMethodEntity.api_secret_key,
          SettingsPaymentMethodEntity.salt,
          SettingsPaymentMethodEntity.api_publishable_key,
          SettingsPaymentMethodEntity.paytm_website,
          SettingsPaymentMethodEntity.paytm_industrytype,
          SettingsPaymentMethodEntity.api_password,
          SettingsPaymentMethodEntity.api_signature,
          SettingsPaymentMethodEntity.api_email,
          SettingsPaymentMethodEntity.paypal_demo,
          SettingsPaymentMethodEntity.account_no,
          SettingsPaymentMethodEntity.is_active,
          check.id
        ])
        return [{
          "data": {
            status: process.env.SUCCESS_STATUS_V2,
            "message": process.env.PAYMENT_METHOD,
            "updated_values": await this.connection.query('SELECT * FROM payment_settings WHERE id = ?', [check.id])
          }
        }];
      }
      else {
        const results = await this.connection.query(`insert into payment_settings(payment_type,api_username,api_secret_key,salt,api_publishable_key,
    paytm_website,paytm_industrytype,api_password,api_signature,api_email,paypal_demo,account_no,is_active)
    values (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
          SettingsPaymentMethodEntity.payment_type,
          SettingsPaymentMethodEntity.api_username,
          SettingsPaymentMethodEntity.api_secret_key,
          SettingsPaymentMethodEntity.salt,
          SettingsPaymentMethodEntity.api_publishable_key,
          SettingsPaymentMethodEntity.paytm_website,
          SettingsPaymentMethodEntity.paytm_industrytype,
          SettingsPaymentMethodEntity.api_password,
          SettingsPaymentMethodEntity.api_signature,
          SettingsPaymentMethodEntity.api_email,
          SettingsPaymentMethodEntity.paypal_demo,
          SettingsPaymentMethodEntity.account_no,
          SettingsPaymentMethodEntity.is_active
        ])
        const [payment] = await this.connection.query(`select id from payment_settings where payment_type = ?`, [
          SettingsPaymentMethodEntity.payment_type])
        await this.dynamicConnection.query(`insert into payment_settings(payment_type,api_username,api_secret_key,salt,api_publishable_key,
    paytm_website,paytm_industrytype,api_password,api_signature,api_email,paypal_demo,account_no,
    is_active,hos_payment_settings_id,hospital_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
          SettingsPaymentMethodEntity.payment_type,
          SettingsPaymentMethodEntity.api_username,
          SettingsPaymentMethodEntity.api_secret_key,
          SettingsPaymentMethodEntity.salt,
          SettingsPaymentMethodEntity.api_publishable_key,
          SettingsPaymentMethodEntity.paytm_website,
          SettingsPaymentMethodEntity.paytm_industrytype,
          SettingsPaymentMethodEntity.api_password,
          SettingsPaymentMethodEntity.api_signature,
          SettingsPaymentMethodEntity.api_email,
          SettingsPaymentMethodEntity.paypal_demo,
          SettingsPaymentMethodEntity.account_no,
          SettingsPaymentMethodEntity.is_active,
          payment.id,
          SettingsPaymentMethodEntity.hospital_id
        ])
        return [{
          "data": {
            "id ": results.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PAYMENT_SETTING,
            "inserted_data": await this.connection.query('SELECT * FROM payment_settings WHERE id = ?', [results.insertId])
          }
        }];
      }
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
}





