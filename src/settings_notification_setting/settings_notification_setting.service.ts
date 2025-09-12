import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsNotificationSetting } from './entities/settings_notification_setting.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsNotificationSettingService {
  constructor(private readonly connection: DataSource) { }

  async findAll() {
    try {
       const notification_setting = await this.connection.query(`select notification_setting.id, notification_setting.type,notification_setting.is_mail,notification_setting.is_sms,notification_setting.is_mobileapp,
  notification_setting.template_id,notification_setting.template from notification_setting`);
    return notification_setting;
    } catch (error) {
       throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }


  async update(id: string, SettingsNotificationSettingEntity: SettingsNotificationSetting) {
    try {
      await this.connection.query(
        `update notification_setting SET type = ?, template_id = ?, template = ?, is_mail = ?, is_sms = ?, is_mobileapp =?, subject=? where id = ?`,
        [
          SettingsNotificationSettingEntity.type,
          SettingsNotificationSettingEntity.template_id,
          SettingsNotificationSettingEntity.template,
          SettingsNotificationSettingEntity.is_mail,
          SettingsNotificationSettingEntity.is_sms,
          SettingsNotificationSettingEntity.is_mobileapp,
          SettingsNotificationSettingEntity.subject,
          id
        ]
      )
      return [{
        "data": {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SETTING_NOTIFICATION_UPDATED,
          "updated_values": await this.connection.query('select * from notification_setting where id = ?', [id])
        }
      }]

    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
