import { Injectable } from '@nestjs/common';
import { CreatePhpIpdReportDto } from './dto/create-php-ipd-report.dto';
import { UpdatePhpIpdReportDto } from './dto/update-php-ipd-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpIpdReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createPhpAppointmentReportDto: CreatePhpIpdReportDto, limit: number, page: number, search: string)
  // : Promise<OpdReportResponseDto> 
  {
    const offset = limit * (page - 1);

    let query = `
  SELECT 
    ipd_details.id,
    'ipd_no' AS module_no,
    ipd_details.symptoms,
    ipd_details.date,
    ipd_prescription_basic.finding_description,
    patients.patient_name,
    patients.dob,
    patients.age,
    patients.month,
    patients.day,
    patients.gender,
    patients.mobileno,
    patients.guardian_name,
    patients.address,
    patients.id AS patientid,
    staff.name,
    staff.surname,
    staff.employee_id

FROM ipd_details
LEFT JOIN ipd_prescription_basic 
    ON ipd_prescription_basic.ipd_id = ipd_details.id
LEFT JOIN patients 
    ON patients.id = ipd_details.patient_id
LEFT JOIN staff 
    ON staff.id = ipd_details.cons_doctor

WHERE DATE(ipd_details.date) BETWEEN DATE(?) AND DATE(?)
    `;

    let countQuery = `
      SELECT COUNT(ipd_details.id) AS total 
     
FROM ipd_details
LEFT JOIN ipd_prescription_basic 
    ON ipd_prescription_basic.ipd_id = ipd_details.id
LEFT JOIN patients 
    ON patients.id = ipd_details.patient_id
LEFT JOIN staff 
    ON staff.id = ipd_details.cons_doctor
  where
  DATE(ipd_details.date) BETWEEN DATE(?) AND DATE(?)
    `;

    const queryParams: any[] = [createPhpAppointmentReportDto.fromDate, createPhpAppointmentReportDto.toDate];

    if (createPhpAppointmentReportDto.doctorId) {
      query += ` AND staff.id = ? `;
      countQuery += ` AND staff.id = ? `;
      queryParams.push(createPhpAppointmentReportDto.doctorId);
    }

    if (createPhpAppointmentReportDto.symptoms) {
      query += ` AND ipd_details.symptoms LIKE ? `;
      countQuery += ` AND ipd_details.symptoms LIKE ?`;
      queryParams.push(createPhpAppointmentReportDto.symptoms);
    }

    if (createPhpAppointmentReportDto.gender) {
      query += `     AND LOWER(patients.gender) = ? `;
      countQuery += `     AND LOWER(patients.gender) = ? `;
      queryParams.push(createPhpAppointmentReportDto.gender.toLocaleLowerCase());
    }

    if (createPhpAppointmentReportDto.findings) {
      query += `  AND ipd_prescription_basic.finding_description LIKE ? `;
      countQuery += `  AND ipd_prescription_basic.finding_description LIKE ? `;
      queryParams.push(createPhpAppointmentReportDto.findings);
    }

    if (createPhpAppointmentReportDto.fromAge || createPhpAppointmentReportDto.toAge) {
      query += `  AND patients.age BETWEEN ? AND ? `;
      countQuery += `  AND patients.age BETWEEN ? AND ? `;
      queryParams.push(createPhpAppointmentReportDto.fromAge || 0, createPhpAppointmentReportDto.toAge || 200);
    }

    if (search) {
      const likeSearch = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];

      query += ` AND (patients.patient_name LIKE ? OR patients.mobileno LIKE ? OR staff.name LIKE ? OR staff.surname LIKE ?)`;
      countQuery += ` AND (patients.patient_name LIKE ? OR patients.mobileno LIKE ? OR staff.name LIKE ? OR staff.surname LIKE ?)`;
      queryParams.push(...likeSearch);
    }

    query += ` ORDER BY ipd_details.date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    try {
      const data = await this.connection.query(query, queryParams);
      const [countData] = await this.connection.query(countQuery, queryParams);


      return {
        details: data,
        count: countData?.total ?? 0
      };
    } catch (error) {
      console.error("SQL Error:", error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all phpIpdReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpIpdReport`;
  }

  update(id: number, updatePhpIpdReportDto: UpdatePhpIpdReportDto) {
    return `This action updates a #${id} phpIpdReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpIpdReport`;
  }
}
