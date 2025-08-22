import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StaffAttendance } from './entities/staff_attendance.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {CountDto} from './dto/staff_attendance.dto';

@Injectable()
export class StaffAttendanceService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createStaffAttendanceArray: StaffAttendance[]) {
    try {
      const results = [];

      for (const createStaffAttendance of createStaffAttendanceArray) {
        const [staffId] = await this.connection.query(
          'SELECT email FROM staff WHERE id = ?',
          [createStaffAttendance.staff_id],
        );
        if (!staffId || staffId.length === 0) {
          throw new Error(
            `${process.env.VALIDATION_STAFF} ${createStaffAttendance.staff_id} ${process.env.VALIDATION_NOT_FOUND}`,
          );
        }
        const docemail = staffId.email;
        const dynamicUpdateStaff = await this.dynamicConnection.query(
          'SELECT id FROM staff WHERE email = ?',
          [docemail],
        );
        const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
        const hosStaffAttendance = await this.connection.query(
          `INSERT INTO staff_attendance(
            date,
            staff_id,
            staff_attendance_type_id,
            remark,
            is_active
          ) VALUES(?,?,?,?,?)`,
          [
            createStaffAttendance.date,
            createStaffAttendance.staff_id,
            createStaffAttendance.staff_attendance_type_id,
            createStaffAttendance.remark,
            1,
          ],
        );

        const HOSStaffAttendanceId = hosStaffAttendance.insertId;
        const addedStaffAttendanceDetails = await this.connection.query(
          'SELECT * FROM staff_attendance WHERE id = ?',
          [HOSStaffAttendanceId],
        );

        const [AdminStaffAttendanceType] = await this.dynamicConnection.query(
          'SELECT id FROM staff_attendance_type WHERE Hospital_id = ? and hos_staff_attendance_type_id = ?',
          [
            createStaffAttendance.hospital_id,
            createStaffAttendance.staff_attendance_type_id,
          ],
        );

        const ADMINstaffAttendanceTypeID = AdminStaffAttendanceType.id;

        await this.dynamicConnection.query(
          `INSERT INTO staff_attendance(
            date,
            staff_id,
            staff_attendance_type_id,
            remark,
            is_active,
            hospital_id,
            hos_staff_attendance_id
          ) VALUES(?,?,?,?,?,?,?)`,
          [
            createStaffAttendance.date,
            dynamicUPTDStaffId,
            ADMINstaffAttendanceTypeID,
            createStaffAttendance.remark,
            1,
            createStaffAttendance.hospital_id,
            HOSStaffAttendanceId,
          ],
        );
        results.push({
          status: process.env.SUCCESS_STATUS,
          message: process.env.STAFF_ATTENDANCE_MESSAGE,
          Added_Staff_attendance_details: addedStaffAttendanceDetails,
        });
      }
      return results;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStaffAttendance(
    createStaffAttendanceArray: {
      id: number;
      date: string;
      staff_id: number;
      staff_attendance_type_id: number;
      remark: string;
      hospital_id: number;
    }[],
  ) {
    const currentdate = new Date();
    const formattedDate = currentdate.toISOString().split('T')[0];
    try {
      const results = [];
      for (const createStaffAttendance of createStaffAttendanceArray) {
        const [staffId] = await this.connection.query(
          'SELECT email FROM staff WHERE id = ?',
          [createStaffAttendance.staff_id],
        );
        if (!staffId || staffId.length === 0) {
          throw new Error(
            `${process.env.VALIDATION_STAFF} ${createStaffAttendance.staff_id} ${process.env.VALIDATION_NOT_FOUND}`,
          );
        }
        const docemail = staffId.email;
        const dynamicUpdateStaff = await this.dynamicConnection.query(
          'SELECT id FROM staff WHERE email = ?',
          [docemail],
        );
        const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
        await this.connection.query(
          `UPDATE staff_attendance SET 
            date = ?,
            staff_id = ?,
            staff_attendance_type_id = ?,
            remark = ?,
            updated_at = ?
            WHERE id = ?`,
          [
            createStaffAttendance.date,
            createStaffAttendance.staff_id,
            createStaffAttendance.staff_attendance_type_id,
            createStaffAttendance.remark,
            formattedDate,
            createStaffAttendance.id,
          ],
        );
        const [updatedStaffAttendanceDetails] = await this.connection.query(
          'SELECT * FROM staff_attendance WHERE id = ?',
          [createStaffAttendance.id],
        );
        const [adminStaffAttendanceTypeResult] =
          await this.dynamicConnection.query(
            'SELECT id FROM staff_attendance_type WHERE hospital_id = ? AND hos_staff_attendance_type_id = ?',
            [
              createStaffAttendance.hospital_id,
              createStaffAttendance.staff_attendance_type_id,
            ],
          );
        const ADMINstaffAttendanceTypeID = adminStaffAttendanceTypeResult.id;
        await this.dynamicConnection.query(
          `UPDATE staff_attendance SET 
            date = ?,
            staff_id = ?,
            staff_attendance_type_id = ?,
            remark = ?,
            updated_at = ?
            WHERE hospital_id = ? AND hos_staff_attendance_id = ?`,
          [
            createStaffAttendance.date,
            dynamicUPTDStaffId,
            ADMINstaffAttendanceTypeID,
            createStaffAttendance.remark,
            formattedDate,
            createStaffAttendance.hospital_id,
            createStaffAttendance.id,
          ],
        );
        results.push({
          status: process.env.SUCCESS_STATUS,
          message: process.env.STAFF_ATTENDANCE_UPDATE_MESSAGE,
          Updated_Staff_attendance_details: updatedStaffAttendanceDetails,
        });
      }
      return results;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getStaffAttendanceList(filters: any) {
    const { role, date } = filters;

    let query = `
    SELECT 
    staff.employee_id AS StaffID,
    CONCAT(staff.name, ' ', staff.surname) AS StaffName,
    roles.name AS Role,
    staff_attendance_type.type
FROM staff_roles
LEFT JOIN staff ON staff.id = staff_roles.staff_id
LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id 
LEFT JOIN staff_attendance_type ON staff_attendance_type.id = staff_attendance.staff_attendance_type_id
LEFT JOIN roles ON staff_roles.role_id = roles.id
    `;

    const values = [];
    const conditions = [];

    if (role) {
      conditions.push('roles.name = ?');
      values.push(role);
    }
    if (date) {
      conditions.push('staff_attendance.date = ?');
      values.push(date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' OR ');
    } else {
      return [];
    }

    const staffattendanceReport = await this.connection.query(query, values);
    return staffattendanceReport;
  }


  async StaffAttendanceListByRoleDate(
    date: Date,
    roleId: number,
    search: string,
    limit: number,
    page: number
  ) {
    const offset = (page - 1) * limit;
  
    let baseQuery = `
      SELECT 
  staff.employee_id AS StaffID,
  CONCAT(staff.name, ' ', staff.surname) AS StaffName,
  roles.name AS Role,
  staff_attendance_type.type,
  staff_attendance.date AS AttendanceDate
FROM staff_roles
INNER JOIN staff ON staff.id = staff_roles.staff_id
INNER JOIN roles ON staff_roles.role_id = roles.id
LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id AND DATE(staff_attendance.date) = DATE(?)
LEFT JOIN staff_attendance_type ON staff_attendance_type.id = staff_attendance.staff_attendance_type_id
    `;
  
    let countQuery = `
      SELECT COUNT(DISTINCT staff.id) AS total
FROM staff_roles
INNER JOIN staff ON staff.id = staff_roles.staff_id
INNER JOIN roles ON staff_roles.role_id = roles.id
LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id AND DATE(staff_attendance.date) = DATE(?)
LEFT JOIN staff_attendance_type ON staff_attendance_type.id = staff_attendance.staff_attendance_type_id
    `;
  
    const conditions: string[] = [];
    const values: any[] = [];

    conditions.push(`staff.is_active = 1`);

if (roleId) {
  conditions.push(`roles.id = ?`);
  values.push(roleId);
}

if (search) {
  conditions.push(`
    (
      staff.employee_id LIKE ? OR 
      CONCAT(staff.name, ' ', staff.surname) LIKE ? OR 
      roles.name LIKE ? OR 
      staff_attendance_type.type LIKE ?
    )
  `);
  values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
}

if (date) {
  values.unshift(date);
}
    
  
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  
    const finalQuery = `${baseQuery} ${whereClause} GROUP BY staff.id ORDER BY StaffName ASC LIMIT ? OFFSET ?`;
    const finalValues = [...values, limit, offset];
  
    const finalCountQuery = `${countQuery} ${whereClause}`;
  
    const [details, totalResult] = await Promise.all([
      this.connection.query(finalQuery, finalValues),
      this.connection.query(finalCountQuery, values),
    ]);
  
    const total = totalResult[0]?.total || 0;
  
    return {
      details,
      total,
    };
  }
  
  
  



}
