import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsCaptchaSetting } from './entities/settings-captcha_setting.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsCaptchaSettingsService {
  constructor(private readonly connection: DataSource) { }
  async findall() {
    const captcha_settings = await this.connection.query(`select * from captcha`);
    return captcha_settings;
  }
  async update(id: string, SettingsCaptchaSettingEntity: SettingsCaptchaSetting) {
    try {
      await this.connection.query(
        `update captcha set name = ?, status = ? where id = ?`,
        [
          SettingsCaptchaSettingEntity.name,
          SettingsCaptchaSettingEntity.status,
          id
        ]
      )
      return [{
        "data": {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.CAPTCHA_UPDATED,
          "updated_values ": await this.connection.query(`select * from captcha where id = ?`, [id])
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
