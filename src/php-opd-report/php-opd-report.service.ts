import { Injectable } from '@nestjs/common';
import { CreatePhpOpdReportDto, OpdReportResponseDto } from './dto/create-php-opd-report.dto';
import { UpdatePhpOpdReportDto } from './dto/update-php-opd-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpOpdReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createPhpAppointmentReportDto: CreatePhpOpdReportDto, limit: number, page: number, search: string): Promise<OpdReportResponseDto> {
    const offset = limit * (page - 1);

    let query = `
      SELECT 
    opd_details.id, 
    'opd_no' AS module_no, 
    visit_details.id AS visit_id, 
    visit_details.symptoms, 
    visit_details.appointment_date, 
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
FROM 
    opd_details 
LEFT JOIN visit_details 
    ON opd_details.id = visit_details.opd_details_id 
LEFT JOIN ipd_prescription_basic 
    ON ipd_prescription_basic.visit_details_id = visit_details.id 
LEFT JOIN patients 
    ON patients.id = opd_details.patient_id 
LEFT JOIN staff 
    ON staff.id = visit_details.cons_doctor 
WHERE 
  DATE(visit_details.appointment_date) BETWEEN DATE(?) AND DATE(?)

    `;

    let countQuery = `
      SELECT COUNT(opd_details.id) AS total 
      FROM 
    opd_details 
LEFT JOIN visit_details 
    ON opd_details.id = visit_details.opd_details_id 
LEFT JOIN ipd_prescription_basic 
    ON ipd_prescription_basic.visit_details_id = visit_details.id 
LEFT JOIN patients 
    ON patients.id = opd_details.patient_id 
LEFT JOIN staff 
    ON staff.id = visit_details.cons_doctor  where
       DATE(visit_details.appointment_date) BETWEEN DATE(?) AND DATE(?)

    `;

    const queryParams: any[] = [createPhpAppointmentReportDto.fromDate, createPhpAppointmentReportDto.toDate];

    if (createPhpAppointmentReportDto.doctorId) {
      query += ` AND staff.id = ? `;
      countQuery += ` AND staff.id = ? `;
      queryParams.push(createPhpAppointmentReportDto.doctorId);
    }

    if (createPhpAppointmentReportDto.symptoms) {
      query += ` AND visit_details.symptoms LIKE ? `;
      countQuery += ` AND visit_details.symptoms LIKE ?`;
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

    query += ` ORDER BY 
    visit_details.appointment_date DESC LIMIT ? OFFSET ?`;
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
    return `This action returns all phpOpdReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpOpdReport`;
  }

  update(id: number, updatePhpOpdReportDto: UpdatePhpOpdReportDto) {
    return `This action updates a #${id} phpOpdReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpOpdReport`;
  }
}
