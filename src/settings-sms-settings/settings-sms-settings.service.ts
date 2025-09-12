import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SettingsSmsSetting } from "./entities/settings-sms-setting.entity";

@Injectable()
export class SettingsSmsSettingsService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,) { }

  async create(sms_Entity: SettingsSmsSetting) {
    try {
      const [check] = await this.connection.query(`select id from sms_config where type = ?`, [sms_Entity.type])
      if (check) {
        await this.connection.query(`update sms_config SET type = ?, name = ?, api_id = ?, authkey = ?, senderid = ?,
          contact = ?, username = ?, url = ?, password = ?, is_active = ? where id = ?`, [
          sms_Entity.type,
          sms_Entity.name,
          sms_Entity.api_id,
          sms_Entity.authkey,
          sms_Entity.senderid,
          sms_Entity.contact,
          sms_Entity.username,
          sms_Entity.url,
          sms_Entity.password,
          sms_Entity.is_active,
          check.id
        ])
        await this.dynamicConnection.query(`update sms_config SET type = ?, name = ?,api_id = ?, authkey = ?, senderid = ?,
          contact = ?, username = ?, url = ?, password = ?, is_active = ? where hos_sms_config_id = ? `, [
          sms_Entity.type,
          sms_Entity.name,
          sms_Entity.api_id,
          sms_Entity.authkey,
          sms_Entity.senderid,
          sms_Entity.contact,
          sms_Entity.username,
          sms_Entity.url,
          sms_Entity.password,
          sms_Entity.is_active,
          check.id,
        ])
        return [{
          "data ": {
            status:  process.env.SUCCESS_STATUS_V2,
            "message": process.env.SMS_CONFIG_UPDATED,
            "updated_values": await this.connection.query('SELECT * FROM sms_config WHERE id = ?', [check.id])
          }
        }];
      }
      else {
        const result = await this.connection.query(
          `insert into sms_config(type,name,api_id,authkey,senderid,contact,username,url,password,is_active) 
  values (?,?,?,?,?,?,?,?,?,?)`, [
          sms_Entity.type,
          sms_Entity.name,
          sms_Entity.api_id,
          sms_Entity.authkey,
          sms_Entity.senderid,
          sms_Entity.contact,
          sms_Entity.username,
          sms_Entity.url,
          sms_Entity.password,
          sms_Entity.is_active
        ])
        await this.dynamicConnection.query(`insert into sms_config (type,
          name,api_id,authkey,senderid,contact,username,url,password,is_active,hos_sms_config_id,hospital_id)
  values (?,?,?,?,?,?,?,?,?,?,?,?)`, [
          sms_Entity.type,
          sms_Entity.name,
          sms_Entity.api_id,
          sms_Entity.authkey,
          sms_Entity.senderid,
          sms_Entity.contact,
          sms_Entity.username,
          sms_Entity.url,
          sms_Entity.password,
          sms_Entity.is_active,
          result.insertId,
          sms_Entity.hospital_id
        ])
        return [{
          "data ": {
            "id  ": result.insertId,
            "status": process.env.SUCCESS_STATUS_V2,
            "messege": process.env.SMS_CONFIG,
            "inserted_data": await this.connection.query('SELECT * FROM sms_config WHERE id = ?', [result.insertId])
          }
        }];
      }
    } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async find_one(id: number) {
    try {
       const sms = await this.connection.query(`select * from sms_config where id = ?`, [id])
    return sms;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }
}
