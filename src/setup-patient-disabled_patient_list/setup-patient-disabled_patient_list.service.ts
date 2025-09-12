/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SetupPatientDisabledPatientList } from './entities/setup-patient-disabled_patient_list.entity';
import { DataSource } from 'typeorm';
import { CountDto } from "./dto/setup-patient-disabled_patient_list.dto";

 
@Injectable()
export class SetupPatientDisabledPatientListService {
 
  constructor(private readonly connection: DataSource) {}
 
  async findAll(): Promise<SetupPatientDisabledPatientList[]> {
    try {
       const patients = await this.connection.query(`select patients.id, patients.patient_name,concat(patients.age,"year",
      patients.month,"month",patients.day,"day") AS dob,patients.age,patients.gender,patients.mobileno,patients.guardian_name,
      patients.address,patients.is_dead,patients.insurance_id,patients.insurance_validity from patients where is_active = ?`, ['no']);
    
    return patients ;
    } catch (error) {
         throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }
  async update(id:number,data:any):Promise<any>{
    try {
       const { is_active, ...otherData } = data; // Extract is_active from data
   console.log(otherData,is_active,"dd");
   
    const updateQuery = `UPDATE patients
                         SET is_active = ?,  
                             ${Object.keys(otherData).map(key => `${key} = ?`).join(', ')}
                         WHERE id = ?`;
 
    const updateValues = [is_active, ...Object.values(otherData), id];  
    const result = await this.connection.query(updateQuery, updateValues);
    return result;
    } catch (error) {
       throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }


  async findDisablePatientSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select patients.id, patients.patient_name,patients.age,patients.gender,patients.mobileno,patients.guardian_name,patients.address,patients.is_dead,patients.insurance_id,patients.insurance_validity from patients where is_active = 'no' `;

    let countQuery = `
      SELECT COUNT(patients.id) AS total from patients where is_active = 'no' `;

    if (search) {

      const condition = `
      and ( patients.id LIKE ? OR patients.patient_name LIKE ? OR patients.age LIKE ? OR patients.gender LIKE ? OR patients.mobileno LIKE ? OR patients.guardian_name LIKE ? OR patients.address LIKE ? ) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY patients.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const DisabledPatientSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: DisabledPatientSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
      throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: process.env.ERROR_MESSAGE,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }



  async findDisablePatientsSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select patients.id, patients.patient_name,patients.age,patients.gender,patients.mobileno,patients.guardian_name,patients.address,patients.is_dead,patients.insurance_id,patients.insurance_validity from patients where is_active = 'no' `;

    let countQuery = `
      SELECT COUNT(patients.id) AS total from patients where is_active = 'no' `;

    if (search) {

      const condition = `
      and ( patients.id LIKE ? OR patients.patient_name LIKE ? OR patients.age LIKE ? OR patients.gender LIKE ? OR patients.mobileno LIKE ? OR patients.guardian_name LIKE ? OR patients.address LIKE ? ) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY patients.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const DisabledPatientSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: DisabledPatientSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
      throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: process.env.ERROR_MESSAGE,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }


}
 