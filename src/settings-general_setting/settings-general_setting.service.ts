import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SettingsGeneralSetting } from "./entities/settings-general_setting.entity";

@Injectable()
export class SettingsGeneralSettingService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(general_settingEntity: SettingsGeneralSetting) {
    try {
      const result = await this.connection.query(`insert into sch_settings (name,email,phone,address,start_month,
        session_id,lang_id,languages,dise_code,date_format,
        time_format,currency,currency_symbol,is_rtl,timezone,
        image,mini_logo,theme,credit_limit,opd_record_month,
        is_active,cron_secret_key, doctor_restriction,superadmin_restriction, patient_panel,
        mobile_api_url,app_primary_color_code,app_secondary_color_code,app_logo,zoom_api_key,
        zoom_api_secret) 
        values (?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?)`,
        [general_settingEntity.name,
        general_settingEntity.email,
        general_settingEntity.phone,
        general_settingEntity.address,
        general_settingEntity.start_month,
        general_settingEntity.session_id,
        general_settingEntity.lang_id,
        general_settingEntity.languages,
        general_settingEntity.dise_code,
        general_settingEntity.date_format,
        general_settingEntity.time_format,
        general_settingEntity.currency,
        general_settingEntity.currency_symbol,
        general_settingEntity.is_rtl,
        general_settingEntity.timezone,
        general_settingEntity.image,
        general_settingEntity.mini_logo,
        general_settingEntity.theme,
        general_settingEntity.credit_limit,
        general_settingEntity.opd_record_month,
        general_settingEntity.is_active,
        general_settingEntity.cron_secret_key,
        general_settingEntity.doctor_restriction,
        general_settingEntity.superadmin_restriction,
        general_settingEntity.patient_panel,
        general_settingEntity.mobile_api_url,
        general_settingEntity.app_primary_color_code,
        general_settingEntity.app_secondary_color_code,
        general_settingEntity.app_logo,
        general_settingEntity.zoom_api_key,
        general_settingEntity.zoom_api_secret
        ]);


      await this.dynamicConnection.query(`insert into sch_settings(name,email,phone,address,start_month,
  session_id,lang_id,languages,dise_code,date_format,
        time_format,currency,currency_symbol,is_rtl,timezone,
        image,mini_logo,theme,credit_limit,opd_record_month,
        is_active,cron_secret_key, doctor_restriction,superadmin_restriction, patient_panel,
        mobile_api_url,app_primary_color_code,app_secondary_color_code,app_logo,zoom_api_key,
        zoom_api_secret,hos_sch_settings_id,hospital_id) values (?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?,?,?,
          ?,?,?)`, [
        general_settingEntity.name,
        general_settingEntity.email,
        general_settingEntity.phone,
        general_settingEntity.address,
        general_settingEntity.start_month,
        general_settingEntity.session_id,
        general_settingEntity.lang_id,
        general_settingEntity.languages,
        general_settingEntity.dise_code,
        general_settingEntity.date_format,
        general_settingEntity.time_format,
        general_settingEntity.currency,
        general_settingEntity.currency_symbol,
        general_settingEntity.is_rtl,
        general_settingEntity.timezone,
        general_settingEntity.image,
        general_settingEntity.mini_logo,
        general_settingEntity.theme,
        general_settingEntity.credit_limit,
        general_settingEntity.opd_record_month,
        general_settingEntity.is_active,
        general_settingEntity.cron_secret_key,
        general_settingEntity.doctor_restriction,
        general_settingEntity.superadmin_restriction,
        general_settingEntity.patient_panel,
        general_settingEntity.mobile_api_url,
        general_settingEntity.app_primary_color_code,
        general_settingEntity.app_secondary_color_code,
        general_settingEntity.app_logo,
        general_settingEntity.zoom_api_key,
        general_settingEntity.zoom_api_secret,
        result.insertId,
        general_settingEntity.hospital_id
      ])
      return [{
        "data ": {
          "id  ": result.insertId,
          "status": "success",
          "messege": "sch_settings details added successfully inserted",
          "inserted_data": await this.connection.query('SELECT * FROM sch_settings WHERE id = ?', [result.insertId])
        }
      }];

    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
  async findall() {
    try {
       const general_setting = await this.connection.query(`select sch_settings.id,sch_settings.name,sch_settings.email,sch_settings.phone,
      sch_settings.address,sch_settings.start_month,sch_settings.session_id,sch_settings.lang_id,
languages.language,sch_settings.dise_code,sch_settings.date_format,sch_settings.time_format,sch_settings.currency,sch_settings.currency_symbol,
sch_settings.is_rtl,sch_settings.timezone,sch_settings.image,sch_settings.mini_logo,sch_settings.theme,sch_settings.credit_limit,
sch_settings.opd_record_month,sch_settings.is_active,
sch_settings.cron_secret_key,sch_settings.doctor_restriction,sch_settings.superadmin_restriction,
sch_settings.patient_panel,sch_settings.mobile_api_url,sch_settings.app_primary_color_code,sch_settings.app_secondary_color_code,
sch_settings.app_logo,
sch_settings.zoom_api_key,sch_settings.zoom_api_secret from sch_settings
left join languages on sch_settings.lang_id = languages.id;`);
    return general_setting;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

  async update(id: string, general_settingEntity: SettingsGeneralSetting) {
    try {
      await this.connection.query(
        `update sch_settings set name = ?,email =?,phone =?,address =?,start_month =?,
              session_id=?,lang_id=?, languages=?,dise_code=?,date_format=?,
              time_format=?, currency=?, currency_symbol=?,is_rtl=?,timezone=?,
             theme=?, credit_limit=?,opd_record_month=?,
              is_active=?,cron_secret_key=?,doctor_restriction=?, superadmin_restriction=?, patient_panel=?,
              mobile_api_url=?,app_primary_color_code=?, app_secondary_color_code=?,app_logo=?,zoom_api_key=?,
              zoom_api_secret=? 
              where id = ?`,
        [general_settingEntity.name,
        general_settingEntity.email,
        general_settingEntity.phone,
        general_settingEntity.address,
        general_settingEntity.start_month,
        general_settingEntity.session_id,
        general_settingEntity.lang_id,
        general_settingEntity.languages,
        general_settingEntity.dise_code,
        general_settingEntity.date_format,
        general_settingEntity.time_format,
        general_settingEntity.currency,
        general_settingEntity.currency_symbol,
        general_settingEntity.is_rtl,
        general_settingEntity.timezone,
        general_settingEntity.theme,
        general_settingEntity.credit_limit,
        general_settingEntity.opd_record_month,
        general_settingEntity.is_active,
        general_settingEntity.cron_secret_key,
        general_settingEntity.doctor_restriction,
        general_settingEntity.superadmin_restriction,
        general_settingEntity.patient_panel,
        general_settingEntity.mobile_api_url,
        general_settingEntity.app_primary_color_code,
        general_settingEntity.app_secondary_color_code,
        general_settingEntity.app_logo,
        general_settingEntity.zoom_api_key,
        general_settingEntity.zoom_api_secret,
          id

        ]
      )
      await this.dynamicConnection.query(`
              update sch_settings set name = ?,email =?,phone =?,address =?,start_month =?,
              session_id=?,lang_id=?, languages=?,dise_code=?,date_format=?,
              time_format=?, currency=?, currency_symbol=?,is_rtl=?,timezone=?,
             theme=?, credit_limit=?,opd_record_month=?,
              is_active=?,cron_secret_key=?,doctor_restriction=?, superadmin_restriction=?, patient_panel=?,
              mobile_api_url=?,app_primary_color_code=?, app_secondary_color_code=?,app_logo=?,zoom_api_key=?,
              zoom_api_secret=? 
              where  hos_sch_settings_id = ? and hospital_id = ? 
              `, [
        general_settingEntity.name,
        general_settingEntity.email,
        general_settingEntity.phone,
        general_settingEntity.address,
        general_settingEntity.start_month,
        general_settingEntity.session_id,
        general_settingEntity.lang_id,
        general_settingEntity.languages,
        general_settingEntity.dise_code,
        general_settingEntity.date_format,
        general_settingEntity.time_format,
        general_settingEntity.currency,
        general_settingEntity.currency_symbol,
        general_settingEntity.is_rtl,
        general_settingEntity.timezone,
        general_settingEntity.theme,
        general_settingEntity.credit_limit,
        general_settingEntity.opd_record_month,
        general_settingEntity.is_active,
        general_settingEntity.cron_secret_key,
        general_settingEntity.doctor_restriction,
        general_settingEntity.superadmin_restriction,
        general_settingEntity.patient_panel,
        general_settingEntity.mobile_api_url,
        general_settingEntity.app_primary_color_code,
        general_settingEntity.app_secondary_color_code,
        general_settingEntity.app_logo,
        general_settingEntity.zoom_api_key,
        general_settingEntity.zoom_api_secret,
        id,
        general_settingEntity.hospital_id
      ])

      let adminHosDetailsUpdateQuery = `update hospitals SET hospital_name = ?, contact_no = ?,
        address = ?, email = ?`
      let adminHosDetailsUpdateValues: any = [
        general_settingEntity.name,
        general_settingEntity.phone,
        general_settingEntity.address,
        general_settingEntity.email
      ]

      if (general_settingEntity.hospital_opening_timing) {
        adminHosDetailsUpdateQuery += `,hospital_opening_timing = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.hospital_opening_timing)
      }
      if (general_settingEntity.hospital_closing_timing) {
        adminHosDetailsUpdateQuery += `,hospital_closing_timing = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.hospital_closing_timing)

      }
      if (general_settingEntity.admin_address) {
        adminHosDetailsUpdateQuery += `,address = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.address)

      }
      if (general_settingEntity.state) {
        adminHosDetailsUpdateQuery += `,state = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.state)

      }
      if (general_settingEntity.district) {
        adminHosDetailsUpdateQuery += `,district = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.district)

      }
      if (general_settingEntity.pincode) {
        adminHosDetailsUpdateQuery += `,pincode = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.pincode)

      }
      if (general_settingEntity.website) {
        adminHosDetailsUpdateQuery += `,website = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.website)

      }
      if (general_settingEntity.overview) {
        adminHosDetailsUpdateQuery += `,overview = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.overview)

      }
      if (general_settingEntity.tax_percentage) {
        adminHosDetailsUpdateQuery += `,tax_percentage = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.tax_percentage)

      }
      if (general_settingEntity.tax_amount) {
        adminHosDetailsUpdateQuery += `,tax_amount = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.tax_amount)

      }
      if (general_settingEntity.lattitude) {
        adminHosDetailsUpdateQuery += `,lattitude = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.lattitude)

      }
      if (general_settingEntity.longitude) {
        adminHosDetailsUpdateQuery += `,longitude = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.longitude)

      }
      if (general_settingEntity.hospital_consulting_charge) {
        adminHosDetailsUpdateQuery += `,hospital_consulting_charge = ?`
        adminHosDetailsUpdateValues.push(general_settingEntity.hospital_consulting_charge)

      }
      let adminHosDetailsUpdateWhere = ` where plenome_id = ?`
      await adminHosDetailsUpdateValues.push(general_settingEntity.hospital_id)

      let final_query = adminHosDetailsUpdateQuery+adminHosDetailsUpdateWhere
      await this.dynamicConnection.query(final_query,adminHosDetailsUpdateValues)
      return [{
        "data": {
          status: process.env.SUCCESS_STATUS_V2,
          "message": process.env.GENERAL_SETTING_UPDATED,
          "updated_values": await this.connection.query(`select * from sch_settings where id = ?`, [id])
        }
      }];
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
  async getHospitalDetails(hospital_id: number) {
    try {
      const getHospitalDetails = await this.dynamicConnection.query(`select * from hospitals where plenome_id = ?`, [hospital_id])
      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.SUCCESS_MESSAGE,
        data: getHospitalDetails
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
  }

  async remove(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {

      await this.connection.query(`delete from sch_settings where id = ?`, [id]);
      await this.dynamicConnection.query(`delete from sch_settings where hos_sch_settings_id = ? and  hospital_id = ? `, [
        id, hospital_id
      ])
    } catch (error) {
      return error
    }
    return [{
      "status": process.env.SUCCESS_STATUS_V2,
      "message": process.env.DELETED
    }
    ];
  }

  async updates(id: string, general_settingEntity: SettingsGeneralSetting) {
    try {
      await this.connection.query(
        `update sch_settings set image = ?, mini_logo = ? where id = ?`, [
        general_settingEntity.image,
        general_settingEntity.mini_logo,
        id
      ]
      )
      await this.dynamicConnection.query(`update hospitals set image = ?, logo = ? where plenome_id = ?`, [
        general_settingEntity.image,
        general_settingEntity.mini_logo,
        general_settingEntity.hospital_id
      ])
    } catch (error) {
      return error
    }
    return [{
      "data": {
        status: process.env.SUCCESS_STATUS_V2,
        "message": process.env.GENERAL_SETTING_UPDATED,
        "updated_values": await this.connection.query(`select sch_settings.image, sch_settings.mini_logo from sch_settings where id = ?`, [id])
      }
    }];
  }
}