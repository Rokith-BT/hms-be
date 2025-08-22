import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingsFrontCmsSetting } from './entities/settings-front_cms_setting.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsFrontCmsSettingService {
  constructor(private readonly connection: DataSource) { }


  async findall() {
    try {
      const front_cms_settings = await this.connection.query(`select front_cms_settings.id, front_cms_settings.is_active_front_cms,front_cms_settings.is_active_online_appointment,front_cms_settings.is_active_sidebar,
    front_cms_settings.is_active_rtl,front_cms_settings.sidebar_options,front_cms_settings.logo,front_cms_settings.fav_icon,
    front_cms_settings.footer_text,front_cms_settings.google_analytics,
    front_cms_settings.fb_url,front_cms_settings.twitter_url,front_cms_settings.youtube_url,front_cms_settings.google_plus,
    front_cms_settings.linkedin_url,front_cms_settings.instagram_url,front_cms_settings.pinterest_url,front_cms_settings.theme from front_cms_settings`);
    return front_cms_settings;
    } catch (error) {
       throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  async update(id: string, SettingsFrontCmsSettingEntity: SettingsFrontCmsSetting) {
    try {
      await this.connection.query(
        `update front_cms_settings set theme =?, is_active_rtl = ?, is_active_front_cms = ?,
        is_active_online_appointment=?, is_active_sidebar=?, logo=?,contact_us_email=?,
        complain_form_email=?, sidebar_options=?, fb_url=?,twitter_url=?,youtube_url=?,
        google_plus=?, instagram_url=?,pinterest_url=?, linkedin_url=?,google_analytics=?,
        footer_text=?,fav_icon=? where id = ?`,
        [
          SettingsFrontCmsSettingEntity.theme,
          SettingsFrontCmsSettingEntity.is_active_rtl,
          SettingsFrontCmsSettingEntity.is_active_front_cms,
          SettingsFrontCmsSettingEntity.is_active_online_appointment,
          SettingsFrontCmsSettingEntity.is_active_sidebar,
          SettingsFrontCmsSettingEntity.logo,
          SettingsFrontCmsSettingEntity.contact_us_email,
          SettingsFrontCmsSettingEntity.complain_form_email,
          SettingsFrontCmsSettingEntity.sidebar_options,
          SettingsFrontCmsSettingEntity.fb_url,
          SettingsFrontCmsSettingEntity.twitter_url,
          SettingsFrontCmsSettingEntity.youtube_url,
          SettingsFrontCmsSettingEntity.google_plus,
          SettingsFrontCmsSettingEntity.instagram_url,
          SettingsFrontCmsSettingEntity.pinterest_url,
          SettingsFrontCmsSettingEntity.linkedin_url,
          SettingsFrontCmsSettingEntity.google_analytics,
          SettingsFrontCmsSettingEntity.footer_text,
          SettingsFrontCmsSettingEntity.fav_icon,
          id
        ]
      )
      return [{
        "data": {
          status: process.env.SUCCESS_STATUS_V2,
          "message": process.env.FRONT_CMS_SETTING_UPDATED,
          "updated_values": await this.connection.query(`select * from front_cms_settings where id = ?`, [id])
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
