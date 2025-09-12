import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class EmrInternalApiService {
  constructor(private readonly connection: DataSource) { }
  async findpriority() {
    const appoint_priority = await this.connection.query(`select appoint_priority.id as id, appoint_priority.priority_status as priority from appoint_priority`)
    return appoint_priority;
  }

  async findstatus() {
    const status = await this.connection.query(`select appointment_status.id as id, appointment_status.status, appointment_status.color_code from appointment_status`)
    return status;
  }

  async findcountry_code() {
    const country_code = await this.connection.query(`select countries.id as id, countries.name as country_name ,countries.dial_code as dial_code, countries.country_flag as flag
     from countries `)
    return country_code;
  }
  async find_Insurance_provider() {
    const insurance_provider = await this.connection.query(`select organisation.id, organisation.organisation_name, organisation.code, organisation.contact_no, organisation.address,
organisation.contact_person_name, organisation.contact_person_phone from organisation`)
    return insurance_provider;
  }
}
