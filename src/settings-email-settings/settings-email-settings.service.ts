import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SettingsEmailSetting } from "./entities/settings-email-setting.entity";


@Injectable()
export class SettingsEmailSettingsService {
  constructor(private readonly connection: DataSource,
      @InjectDataSource('AdminConnection')
      private readonly dynamicConnection: DataSource,
){}

  async create(SettingsEmailSettingEntity: SettingsEmailSetting) {
      try{
    const email = await this.connection.query(`insert into email_config(email_type,smtp_server,smtp_port,smtp_username,smtp_password,
      ssl_tls,smtp_auth,is_active) values(?,?,?,?,?,?,?,?)`,[
        SettingsEmailSettingEntity.email_type,
        SettingsEmailSettingEntity.smtp_server,
        SettingsEmailSettingEntity.smtp_port,
        SettingsEmailSettingEntity.smtp_username,
        SettingsEmailSettingEntity.smtp_password,
        SettingsEmailSettingEntity.ssl_tls,
        SettingsEmailSettingEntity.smtp_auth,
        SettingsEmailSettingEntity.is_active
    ])
     await this.dynamicConnection.query(`insert into email_config(email_type,smtp_server,smtp_port,smtp_username,smtp_password,
      ssl_tls,smtp_auth,is_active,hos_email_config_id,hospital_id) values (?,?,?,?,?,?,?,?,?,?)`,[
        SettingsEmailSettingEntity.email_type,
        SettingsEmailSettingEntity.smtp_server,
        SettingsEmailSettingEntity.smtp_port,
        SettingsEmailSettingEntity.smtp_username,
        SettingsEmailSettingEntity.smtp_password,
        SettingsEmailSettingEntity.ssl_tls,
        SettingsEmailSettingEntity.smtp_auth,
        SettingsEmailSettingEntity.is_active,
        email.insertId,
        SettingsEmailSettingEntity.hospital_id
      ])
     
    return  [{"data ":{"id  ":email.insertId,
      "status":process.env.SUCCESS_STATUS_V2,
      "messege":process.env.EMAIL,
      "inserted_data": await this.connection.query('SELECT * FROM email_config WHERE id = ?', [email.insertId])
      }}];;
   } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);   }
    
  }
}
