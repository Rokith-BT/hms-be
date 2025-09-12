import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HumanResourcePayroll } from './entities/human_resource_payroll.entity';
import { CountDto } from './dto/human_resource_payroll.dto';

@Injectable()
export class HumanResourcePayrollService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}
  async create(createHumanResourcePayroll: HumanResourcePayroll) {
    try {
      let AdminStaffPayslipId;

      const currentdate = new Date();
      const formattedDate = currentdate.toISOString().split('T')[0];
      let Leave_Deduction;

      if (createHumanResourcePayroll.leave_deduction) {
        Leave_Deduction = createHumanResourcePayroll.leave_deduction;
      } else {
        Leave_Deduction = 0;
      }
      let Payment_Mode;
      if (createHumanResourcePayroll.payment_mode) {
        Payment_Mode = createHumanResourcePayroll.payment_mode;
      } else {
        Payment_Mode = 'NA';
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createHumanResourcePayroll.staff_id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourcePayroll.staff_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const [staffId1] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createHumanResourcePayroll.generated_by],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourcePayroll.generated_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail1 = staffId1.email;
      const dynamicUpdateStaff1 = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail1],
      );
      const dynamicUPTDStaffId1 = dynamicUpdateStaff1[0].id;
      const hosStaffPayslip = await this.connection.query(
        `INSERT INTO staff_payslip(
            staff_id,
            basic,
            total_allowance,
            total_deduction,
            leave_deduction,
            tax,
            net_salary,
            status,
            month,
            year,
            payment_date,
            payment_mode,
            generated_by
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createHumanResourcePayroll.staff_id,
          createHumanResourcePayroll.basic,
          createHumanResourcePayroll.total_allowance,
          createHumanResourcePayroll.total_deduction,
          Leave_Deduction,
          createHumanResourcePayroll.tax,
          createHumanResourcePayroll.net_salary,
          'generated',
          createHumanResourcePayroll.month,
          createHumanResourcePayroll.year,
          formattedDate,
          Payment_Mode,
          createHumanResourcePayroll.generated_by,
        ],
      );
      const HOSStaffPayslipId = hosStaffPayslip.insertId;
      const AdminStaffPayslip = await this.dynamicConnection.query(
        `INSERT INTO staff_payslip(
            staff_id,
            basic,
            total_allowance,
            total_deduction,
            leave_deduction,
            tax,
            net_salary,
            status,
            month,
            year,
            payment_date,
            payment_mode,
            generated_by,
            Hospital_id,
            hos_staff_payslip_id
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicUPTDStaffId,
          createHumanResourcePayroll.basic,
          createHumanResourcePayroll.total_allowance,
          createHumanResourcePayroll.total_deduction,
          Leave_Deduction,
          createHumanResourcePayroll.tax,
          createHumanResourcePayroll.net_salary,
          'generated',
          createHumanResourcePayroll.month,
          createHumanResourcePayroll.year,
          formattedDate,
          Payment_Mode,
          dynamicUPTDStaffId1,
          createHumanResourcePayroll.hospital_id,
          HOSStaffPayslipId,
        ],
      );
      AdminStaffPayslipId = AdminStaffPayslip.insertId;
      let hosStaffPayslipAllowanceDetailsID;
      const StaffPayslipAllowance =
        createHumanResourcePayroll.staff_payslip_allowance;
      for (const PayslipAllowance of StaffPayslipAllowance) {
        try {
          const hosStaffPayslipAllowanceDetails = await this.connection.query(
            `INSERT INTO payslip_allowance (staff_payslip_id,staff_id,allowance_type,amount,cal_type) VALUES (?,?,?,?,?)`,
            [
              HOSStaffPayslipId,
              createHumanResourcePayroll.staff_id,
              PayslipAllowance.allowance_type,
              PayslipAllowance.amount,
              PayslipAllowance.cal_type,
            ],
          );
          hosStaffPayslipAllowanceDetailsID =
            hosStaffPayslipAllowanceDetails.insertId;
          await this.dynamicConnection.query(
            `INSERT INTO payslip_allowance (staff_payslip_id, staff_id, allowance_type, amount, cal_type, Hospital_id, hos_payslip_allowance_id) VALUES (?,?,?,?,?,?,?)`,
            [
              AdminStaffPayslipId,
              dynamicUPTDStaffId,
              PayslipAllowance.allowance_type,
              PayslipAllowance.amount,
              PayslipAllowance.cal_type,
              createHumanResourcePayroll.hospital_id,
              hosStaffPayslipAllowanceDetailsID,
            ],
          );
        } catch (error) {
          console.error('Error inserting payslip allowance details:', error);
        }
      }

      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.STAFF_PAYSLIP_MESSAGE,
            Added_Staff_Payslip_details: await this.connection.query(
              'SELECT * FROM staff_payslip WHERE id = ?',
              [HOSStaffPayslipId],
            ),
          },
        },
      ];
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

  async getStaffPayrollList(filters: any) {
    const { role, month, year } = filters;
    let query = `
    SELECT 
    staff.employee_id AS StaffID,
    CONCAT(staff.name, ' ', staff.surname) AS StaffName,
    roles.name AS Role,
    department.department_name AS Department,
    staff_designation.designation AS Designation,
    staff.contact_no AS Phone,
    staff_payslip.status AS Status
FROM staff_roles
LEFT JOIN staff ON staff.id = staff_roles.staff_id
LEFT JOIN roles ON roles.id = staff_roles.role_id
LEFT JOIN staff_payslip ON staff.id = staff_payslip.staff_id
LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id
LEFT JOIN department ON department.id = staff.department_id
LEFT JOIN staff_designation ON staff_designation.id = staff.staff_designation_id
    `;
    const values = [];
    const conditions = [];
    if (role) {
      conditions.push('roles.name = ?');
      values.push(role);
    }
    if (month) {
      conditions.push('staff_payslip.month = ?');
      values.push(month);
    }
    if (year) {
      conditions.push('staff_payslip.year = ?');
      values.push(year);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' OR ');
    } else {
      return [];
    }

    const staffPayrollReport = await this.connection.query(query, values);
    return staffPayrollReport;
  }

  async update(id: number, createHumanResourcePayroll: HumanResourcePayroll) {
    try {
      const currentdate = new Date();
      const formattedDate = currentdate.toISOString().split('T')[0];
      const Leave_Deduction = createHumanResourcePayroll.leave_deduction || 0;
      const Payment_Mode = createHumanResourcePayroll.payment_mode || 'NA';

      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createHumanResourcePayroll.staff_id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourcePayroll.staff_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }

      const docemail = staffId.email;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const [staffId1] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createHumanResourcePayroll.generated_by],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourcePayroll.generated_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail1 = staffId1.email;
      const dynamicUpdateStaff1 = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail1],
      );
      const dynamicUPTDStaffId1 = dynamicUpdateStaff1[0].id;

      await this.connection.query(
        `UPDATE staff_payslip SET
              basic = ?,
              total_allowance = ?,
              total_deduction = ?,
              leave_deduction = ?,
              tax = ?,
              net_salary = ?,
              month = ?,
              year = ?,
              payment_date = ?,
              payment_mode = ?,
              generated_by = ?
              WHERE id = ?`,
        [
          createHumanResourcePayroll.basic,
          createHumanResourcePayroll.total_allowance,
          createHumanResourcePayroll.total_deduction,
          Leave_Deduction,
          createHumanResourcePayroll.tax,
          createHumanResourcePayroll.net_salary,
          createHumanResourcePayroll.month,
          createHumanResourcePayroll.year,
          formattedDate,
          Payment_Mode,
          createHumanResourcePayroll.generated_by,
          id,
        ],
      );

      const [adminstaffpayslip] = await this.dynamicConnection.query(
        `SELECT id FROM staff_payslip WHERE hos_staff_payslip_id = ? AND Hospital_id = ?`,
        [id, createHumanResourcePayroll.hospital_id],
      );
      const adminstaffpayslipId = adminstaffpayslip.id;

      await this.dynamicConnection.query(
        `UPDATE staff_payslip SET
              basic = ?,
              total_allowance = ?,
              total_deduction = ?,
              leave_deduction = ?,
              tax = ?,
              net_salary = ?,
              month = ?,
              year = ?,
              payment_date = ?,
              payment_mode = ?,
              generated_by = ?
              WHERE id = ?`,
        [
          createHumanResourcePayroll.basic,
          createHumanResourcePayroll.total_allowance,
          createHumanResourcePayroll.total_deduction,
          Leave_Deduction,
          createHumanResourcePayroll.tax,
          createHumanResourcePayroll.net_salary,
          createHumanResourcePayroll.month,
          createHumanResourcePayroll.year,
          formattedDate,
          Payment_Mode,
          dynamicUPTDStaffId1,
          adminstaffpayslipId,
        ],
      );

      const StaffPayslipAllowance =
        createHumanResourcePayroll.staff_payslip_allowance;
      for (const PayslipAllowance of StaffPayslipAllowance) {
        if (!PayslipAllowance.id) {
          const hosStaffPayslipAllowanceDetails = await this.connection.query(
            `INSERT INTO payslip_allowance (staff_payslip_id, staff_id, allowance_type, amount, cal_type) VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              createHumanResourcePayroll.staff_id,
              PayslipAllowance.allowance_type,
              PayslipAllowance.amount,
              PayslipAllowance.cal_type,
            ],
          );

          const HOSpayslipAllowanceID =
            hosStaffPayslipAllowanceDetails.insertId;

          await this.dynamicConnection.query(
            `INSERT INTO payslip_allowance (staff_payslip_id, staff_id, allowance_type, amount, cal_type, Hospital_id, hos_payslip_allowance_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              adminstaffpayslipId,
              dynamicUPTDStaffId,
              PayslipAllowance.allowance_type,
              PayslipAllowance.amount,
              PayslipAllowance.cal_type,
              createHumanResourcePayroll.hospital_id,
              HOSpayslipAllowanceID,
            ],
          );
        } else {
          await this.connection.query(
            `UPDATE payslip_allowance SET allowance_type = ?, amount = ?, cal_type = ? WHERE id = ?`,
            [
              PayslipAllowance.allowance_type,
              PayslipAllowance.amount,
              PayslipAllowance.cal_type,
              PayslipAllowance.id,
            ],
          );

          const [payslipAllowanceId] = await this.dynamicConnection.query(
            `SELECT id FROM payslip_allowance WHERE hos_payslip_allowance_id = ? AND Hospital_id = ?`,
            [PayslipAllowance.id, createHumanResourcePayroll.hospital_id],
          );
          const PaySlipAllowanceID = payslipAllowanceId
            ? payslipAllowanceId.id
            : null;

          if (PaySlipAllowanceID) {
            await this.dynamicConnection.query(
              `UPDATE payslip_allowance SET allowance_type = ?, amount = ?, cal_type = ? WHERE id = ?`,
              [
                PayslipAllowance.allowance_type,
                PayslipAllowance.amount,
                PayslipAllowance.cal_type,
                PaySlipAllowanceID,
              ],
            );
          }
        }
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.STAFF_PAYSLIP_UPDATE,
        updated_values: await this.connection.query(
          'SELECT * FROM staff_payslip WHERE id = ?',
          [id],
        ),
      };
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

  async revertPayslip(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM payslip_allowance WHERE staff_payslip_id = ?',
        [id],
      );
      await this.connection.query('DELETE FROM staff_payslip WHERE id = ?', [
        id,
      ]);
      const [Adminstaffpayslip] = await this.dynamicConnection.query(
        `select id from staff_payslip where hos_staff_payslip_id = ? and Hospital_id = ?`,
        [id, hospital_id],
      );
      const AdminStaffPayslipID = Adminstaffpayslip.id;
      await this.dynamicConnection.query(
        'DELETE FROM payslip_allowance WHERE staff_payslip_id = ?',
        [AdminStaffPayslipID],
      );
      await this.dynamicConnection.query(
        'DELETE FROM staff_payslip WHERE id = ?',
        [AdminStaffPayslipID],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.STAFF_PAYSLIP_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
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

  async updatePaidrevertStatus(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        `UPDATE staff_payslip SET
    status = ?
    where id = ?`,
        ['generated', id],
      );

      const [adminstaffpayslip] = await this.dynamicConnection.query(
        `select id from staff_payslip where hos_staff_payslip_id = ? and Hospital_id = ?`,
        [id, hospital_id],
      );
      const adminstaffpayslipId = adminstaffpayslip.id;

      await this.dynamicConnection.query(
        `UPDATE staff_payslip SET
    status = ?
    where id = ?`,
        ['generated', adminstaffpayslipId],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.STAFF_PAYSLIP_PAYMENT,
            updated_values: await this.connection.query(
              'SELECT * FROM staff_payslip WHERE id = ?',
              [id],
            ),
          },
        },
      ];
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

  async proceedToPay(
    id: number,
    createHumanResourcePayroll: HumanResourcePayroll,
  ) {
    try {
      const currentdate = new Date();
      const formattedDate = currentdate.toISOString().split('T')[0];

      if (createHumanResourcePayroll.payment_mode == 'Cheque') {
        await this.connection.query(
          `UPDATE staff_payslip SET
    status = ?,
    payment_date = ?,
    payment_mode = ?,
    cheque_no = ?,
    cheque_date = ?,
    attachment = ?,
    attachment_name = ?,
    remark = ?
    where id = ?`,
          [
            'paid',
            createHumanResourcePayroll.payment_date,
            createHumanResourcePayroll.payment_mode,
            createHumanResourcePayroll.cheque_no,
            createHumanResourcePayroll.cheque_date,
            createHumanResourcePayroll.attachment,
            createHumanResourcePayroll.attachment_name,
            createHumanResourcePayroll.remark,
            id,
          ],
        );

        const [adminstaffpayslip] = await this.dynamicConnection.query(
          `select id from staff_payslip where hos_staff_payslip_id = ? and Hospital_id = ?`,
          [id, createHumanResourcePayroll.hospital_id],
        );
        const adminstaffpayslipId = adminstaffpayslip.id;
        await this.dynamicConnection.query(
          `UPDATE staff_payslip SET
    status = ?,
    payment_date = ?,
    payment_mode = ?,
    cheque_no = ?,
    cheque_date = ?,
    attachment = ?,
    attachment_name = ?,
    remark = ?
    where id = ?`,
          [
            'paid',
            formattedDate,
            createHumanResourcePayroll.payment_mode,
            createHumanResourcePayroll.cheque_no,
            createHumanResourcePayroll.cheque_date,
            createHumanResourcePayroll.attachment,
            createHumanResourcePayroll.attachment_name,
            createHumanResourcePayroll.remark,
            adminstaffpayslipId,
          ],
        );
      } else {
        await this.connection.query(
          `UPDATE staff_payslip SET
      status = ?,
      payment_date = ?,
      payment_mode = ?,
      remark = ?
      where id = ?`,
          [
            'paid',
            createHumanResourcePayroll.payment_date,
            createHumanResourcePayroll.payment_mode,
            createHumanResourcePayroll.remark,
            id,
          ],
        );

        const [adminstaffpayslip] = await this.dynamicConnection.query(
          `select id from staff_payslip where hos_staff_payslip_id = ? and Hospital_id = ?`,
          [id, createHumanResourcePayroll.hospital_id],
        );
        const adminstaffpayslipId = adminstaffpayslip.id;

        await this.dynamicConnection.query(
          `UPDATE staff_payslip SET
      status = ?,
      payment_date = ?,
      payment_mode = ?,
      remark = ?
      where id = ?`,
          [
            'paid',
            formattedDate,
            createHumanResourcePayroll.payment_mode,
            createHumanResourcePayroll.remark,
            adminstaffpayslipId,
          ],
        );
      }
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.STAFF_PAYSLIP_PAYMENT_MESSAGE,
            updated_values: await this.connection.query(
              'SELECT * FROM staff_payslip WHERE id = ?',
              [id],
            ),
          },
        },
      ];
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

  async findOne(id: string): Promise<HumanResourcePayroll | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM staff_payslip WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getCalculatedStaffSalary = await this.connection.query(
        `SELECT
    id,
    staff_id,
    basic,
    total_allowance,
    total_deduction,
    tax,
    (basic + (total_allowance - total_deduction)) * (tax / 100) AS tax_amount,
    (basic + (total_allowance - total_deduction)) - ((basic + (total_allowance - total_deduction)) * (tax / 100)) AS calculated_net_salary
FROM staff_payslip WHERE id = ? `,
        [id],
      );
      return getCalculatedStaffSalary;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

//   async StaffPayrollListByRoleMonthYear(
//     date: Date,
//     roleId: number,
//     search: string,
//     limit: number,
//     page: number,
//   ) {
//     const offset = (page - 1) * limit;

//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const startDate = new Date(year, month, 1);
//     const endDate = new Date(year, month + 1, 0);

//     let baseQuery = `
//       SELECT DISTINCT 
//   staff.id AS StaffUniqueID,
//   staff.employee_id AS StaffID,
//   CONCAT(staff.name, ' ', staff.surname) AS StaffName,
//   staff.date_of_joining,
//   roles.name AS Role,
//   department.department_name AS Department,
//   staff_designation.designation AS Designation,
//   staff.contact_no AS Phone,
//   staff_payslip.status AS Status,
//   staff_payslip.id AS StaffPayslipID
// FROM staff_roles
// LEFT JOIN staff ON staff.id = staff_roles.staff_id
// LEFT JOIN roles ON roles.id = staff_roles.role_id
// LEFT JOIN staff_payslip ON staff.id = staff_payslip.staff_id
// LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id
// LEFT JOIN department ON department.id = staff.department_id
// LEFT JOIN staff_designation ON staff_designation.id = staff.staff_designation_id

//     `;

//     let countQuery = `
//       SELECT COUNT(DISTINCT staff.id) AS total
//       FROM staff_roles
// LEFT JOIN staff ON staff.id = staff_roles.staff_id
// LEFT JOIN roles ON roles.id = staff_roles.role_id
// LEFT JOIN staff_payslip ON staff.id = staff_payslip.staff_id
// LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id
// LEFT JOIN department ON department.id = staff.department_id
// LEFT JOIN staff_designation ON staff_designation.id = staff.staff_designation_id
//     `;

//     const conditions: string[] = [];
//     const values: any[] = [];

//     if (roleId) {
//       conditions.push(`roles.id = ?`);
//       values.push(roleId);
//     }

//     if (search) {
//       conditions.push(`
//         (
//           staff.employee_id LIKE ? OR
//           CONCAT(staff.name, ' ', staff.surname) LIKE ? OR
//           staff.name LIKE ? OR
//           staff.surname LIKE ? OR
//           roles.name LIKE ? OR
//           staff_designation.designation LIKE ? OR
//           staff.contact_no LIKE ? OR
//           department.department_name LIKE ? OR
//           staff_payslip.status LIKE ?
//         )
//       `);
//       values.push(
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//         `%${search}%`,
//       );
//     }

//     if (date) {
//       conditions.push(`staff_attendance.date BETWEEN ? AND ?`);
//       values.push(startDate, endDate);

//       conditions.push(`staff.date_of_joining <= ?`);
//   values.push(date);
//     }

//     const whereClause = conditions.length
//       ? `WHERE ${conditions.join(' AND ')}`
//       : '';

//     const finalQuery = `${baseQuery} ${whereClause} GROUP BY staff.id ORDER BY StaffName ASC LIMIT ? OFFSET ?`;
//     const finalValues = [...values, limit, offset];

//     const finalCountQuery = `${countQuery} ${whereClause}`;

//     const [details, totalResult] = await Promise.all([
//       this.connection.query(finalQuery, finalValues),
//       this.connection.query(finalCountQuery, values),
//     ]);

//     const total = totalResult[0]?.total || 0;

//     return {
//       details,
//       total,
//     };
//   }



async StaffPayrollListByRoleMonthYear(
  date: Date,
  roleId: number,
  search: string,
  limit: number,
  page: number,
) {
  const offset = (page - 1) * limit;

  const year = date.getFullYear();
  const month = date.getMonth(); // already 0-based
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const baseQuery = `
    SELECT 
      staff.id AS StaffUniqueID,
      staff.employee_id AS StaffID,
      CONCAT(staff.name, ' ', staff.surname) AS StaffName,
      staff.date_of_joining,
      roles.name AS Role,
      department.department_name AS Department,
      staff_designation.designation AS Designation,
      staff.contact_no AS Phone,
      staff_payslip.status AS Status,
      staff_payslip.id AS StaffPayslipID
    FROM staff
    LEFT JOIN staff_roles ON staff_roles.staff_id = staff.id
    LEFT JOIN roles ON roles.id = staff_roles.role_id
    LEFT JOIN department ON department.id = staff.department_id
    LEFT JOIN staff_designation ON staff_designation.id = staff.staff_designation_id
    LEFT JOIN staff_payslip ON staff_payslip.staff_id = staff.id AND staff_payslip.month = ? AND staff_payslip.year = ?
    WHERE staff.is_active = 1
      AND staff.date_of_joining <= ?
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT staff.id) AS total
    FROM staff
    LEFT JOIN staff_roles ON staff_roles.staff_id = staff.id
    LEFT JOIN roles ON roles.id = staff_roles.role_id
    LEFT JOIN department ON department.id = staff.department_id
    LEFT JOIN staff_designation ON staff_designation.id = staff.staff_designation_id
    LEFT JOIN staff_payslip ON staff_payslip.staff_id = staff.id AND staff_payslip.month = ? AND staff_payslip.year = ?
    WHERE staff.is_active = 1
      AND staff.date_of_joining <= ?
  `;

  const conditions: string[] = [];
  const params = [month + 1, year, date];
  const countParams = [month + 1, year, date];

  if (roleId) {
    conditions.push('roles.id = ?');
    params.push(roleId);
    countParams.push(roleId);
  }

  if (search) {
    const searchClause = `
      (
        staff.employee_id LIKE ? OR
        CONCAT(staff.name, ' ', staff.surname) LIKE ? OR
        staff.name LIKE ? OR
        staff.surname LIKE ? OR
        roles.name LIKE ? OR
        staff_designation.designation LIKE ? OR
        staff.contact_no LIKE ? OR
        department.department_name LIKE ? OR
        staff_payslip.status LIKE ?
      )
    `;
    conditions.push(searchClause);
    const searchTerm = `%${search}%`;
    const searchParams = Array(9).fill(searchTerm);
    params.push(...searchParams);
    countParams.push(...searchParams);
  }

  const whereClause = conditions.length ? ` AND ${conditions.join(' AND ')}` : '';

  const finalQuery = `${baseQuery} ${whereClause} GROUP BY staff.id ORDER BY StaffName ASC LIMIT ? OFFSET ?`;
  const finalValues = [...params, limit, offset];

  const finalCountQuery = `${countQuery} ${whereClause}`;

  const [details, totalResult] = await Promise.all([
    this.connection.query(finalQuery, finalValues),
    this.connection.query(finalCountQuery, countParams),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    details,
    total,
  };
}




  async removePayslipAllowance(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
     
      
      
      await this.connection.query(
        'DELETE FROM payslip_allowance WHERE id = ?',
        [id],
      );


      await this.dynamicConnection.query(
        'DELETE FROM payslip_allowance WHERE hos_payslip_allowance_id = ? AND Hospital_id = ?',
        [id, Hospital_id],
      );
      
      
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.VALIDATE_PAYSLIP_ALLOWANCE} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      return error;
    }
  }







}
