import { Injectable } from '@nestjs/common';
import {
  CountResponseDto,
  CreatePhpAppointmentReportDto,
} from './dto/create-php-appointment-report.dto';
import { UpdatePhpAppointmentReportDto } from './dto/update-php-appointment-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpAppointmentReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async create(
    createPhpAppointmentReportDto: CreatePhpAppointmentReportDto,
    limit: number,
    page: number,
    search: string,
  ): Promise<CountResponseDto> {
    const offset = limit * (page - 1);

    let query = `
      SELECT 
        appointment.*, 
        patients.mobileno, 
        patients.email, 
        patients.gender, 
        appointment_payment.paid_amount, 
        patients.patient_name, 
        patients.id AS patient_id, 
        staff.name, 
        staff.surname, 
        staff.employee_id
      FROM appointment
      JOIN appointment_payment 
        ON appointment_payment.appointment_id = appointment.id
      JOIN patients 
        ON patients.id = appointment.patient_id
      LEFT JOIN staff 
        ON staff.id = appointment.doctor
      WHERE DATE(appointment.date) >= DATE(?) 
        AND DATE(appointment.date) <= DATE(?)
    `;

    let countQuery = `
      SELECT COUNT(appointment.id) AS total 
      FROM appointment 
            LEFT JOIN staff 
        ON staff.id = appointment.doctor
         JOIN patients 
        ON patients.id = appointment.patient_id
      WHERE DATE(appointment.date) >= DATE(?) 
        AND DATE(appointment.date) <= DATE(?)
    `;

    const queryParams: any[] = [
      createPhpAppointmentReportDto.fromDate,
      createPhpAppointmentReportDto.toDate,
    ];

    if (createPhpAppointmentReportDto.doctorId) {
      query += ` AND appointment.doctor = ?`;
      countQuery += ` AND appointment.doctor = ?`;
      queryParams.push(createPhpAppointmentReportDto.doctorId);
    }

    if (createPhpAppointmentReportDto.shiftId) {
      query += ` AND appointment.global_shift_id = ?`;
      countQuery += ` AND appointment.global_shift_id = ?`;
      queryParams.push(createPhpAppointmentReportDto.shiftId);
    }

    if (createPhpAppointmentReportDto.priority) {
      query += ` AND appointment.priority = ?`;
      countQuery += ` AND appointment.priority = ?`;
      queryParams.push(createPhpAppointmentReportDto.priority);
    }

    if (createPhpAppointmentReportDto.source) {
      query += ` AND appointment.source = ?`;
      countQuery += ` AND appointment.source = ?`;
      queryParams.push(createPhpAppointmentReportDto.source);
    }
    if (search) {
      const likeSearch = [
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      ];

      query += ` AND (patients.patient_name LIKE ? OR patients.mobileno LIKE ? OR staff.name LIKE ? OR staff.surname LIKE ?)`;
      countQuery += ` AND (patients.patient_name LIKE ? OR patients.mobileno LIKE ? OR staff.name LIKE ? OR staff.surname LIKE ?)`;
      queryParams.push(...likeSearch);
    }

    query += ` ORDER BY appointment.date DESC, appointment.time DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    try {
      const data = await this.connection.query(query, queryParams);
      const [countData] = await this.connection.query(countQuery, queryParams);

      return {
        details: data,
        count: countData?.total ?? 0,
      };
    } catch (error) {
      // console.error("SQL Error:", error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all phpAppointmentReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpAppointmentReport`;
  }

  update(
    id: number,
    updatePhpAppointmentReportDto: UpdatePhpAppointmentReportDto,
  ) {
    return `This action updates a #${id} phpAppointmentReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpAppointmentReport`;
  }
}
