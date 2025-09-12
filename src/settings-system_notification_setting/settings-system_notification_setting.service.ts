import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SettingsSystemNotificationSetting } from "./entities/settings-system_notification_setting.entity";

@Injectable()
export class SettingsSystemNotificationSettingService {
  constructor(private readonly connection: DataSource
  ) { }

  async findAll() {
    try {
       const system_notification = await this.connection.query(`select system_notification_setting.id,system_notification_setting.event,system_notification_setting.subject,system_notification_setting.is_staff,
    system_notification_setting.is_patient,system_notification_setting.is_active,system_notification_setting.staff_message,
    system_notification_setting.patient_message from system_notification_setting`);
    return system_notification;
    } catch (error) {
      throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async update(id: string, SettingsSystemNotificationSettingEntity: SettingsSystemNotificationSetting) {
    try {
      await this.connection.query(
        `update system_notification_setting SET subject = ?, staff_message = ?, patient_message =? where id = ?`,
        [
          SettingsSystemNotificationSettingEntity.subject,
          SettingsSystemNotificationSettingEntity.staff_message,
          SettingsSystemNotificationSettingEntity.patient_message,
          id
        ]
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.SYSTEM_NOTIFICATION,
          "updated_values": await this.connection.query('SELECT * FROM system_notification_setting WHERE id = ?', [id])
        }
      }];
    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
