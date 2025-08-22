import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HumanResourceApplyLeave } from './entities/human_resource_apply_leave.entity';
import { CountDto } from './dto/human_resource_apply_leave.dto';

@Injectable()
export class HumanResourceApplyLeaveService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createHumanResourceApplyLeave: HumanResourceApplyLeave) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createHumanResourceApplyLeave.staff_id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourceApplyLeave.staff_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const leaveFrom = new Date(createHumanResourceApplyLeave.leave_from);
      const leaveTo = new Date(createHumanResourceApplyLeave.leave_to);
      const leaveDays =
        Math.ceil(
          (leaveTo.getTime() - leaveFrom.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
      let applyLeaveRequestId;
      const applyLeave = await this.connection.query(
        `INSERT into staff_leave_request(
  staff_id,
  leave_type_id,
  leave_from,
  leave_to,
  leave_days,
  employee_remark,
  status,
  applied_by,
  document_file,
  date
)VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [
          createHumanResourceApplyLeave.staff_id,
          createHumanResourceApplyLeave.leave_type_id,
          createHumanResourceApplyLeave.leave_from,
          createHumanResourceApplyLeave.leave_to,
          leaveDays,
          createHumanResourceApplyLeave.employee_remark,
          'pending',
          createHumanResourceApplyLeave.staff_id,
          createHumanResourceApplyLeave.document_file,
          createHumanResourceApplyLeave.date,
        ],
      );

      applyLeaveRequestId = applyLeave.insertId;

      let adminLeaveTypeId;
      const AdminLeaveType = await this.dynamicConnection.query(
        'select id from leave_types where Hospital_id = ? AND hospital_leave_types_id = ?',
        [
          createHumanResourceApplyLeave.hospital_id,
          createHumanResourceApplyLeave.leave_type_id,
        ],
      );
      adminLeaveTypeId = AdminLeaveType[0].id;
      await this.dynamicConnection.query(
        `INSERT into staff_leave_request(
  staff_id,
  leave_type_id,
  leave_from,
  leave_to,
  leave_days,
  employee_remark,
  status,
  applied_by,
  document_file,
  date,
  hospital_id,
  hos_staff_leave_request_id
)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicUPTDStaffId,
          adminLeaveTypeId,
          createHumanResourceApplyLeave.leave_from,
          createHumanResourceApplyLeave.leave_to,
          leaveDays,
          createHumanResourceApplyLeave.employee_remark,
          'pending',
          dynamicUPTDStaffId,
          createHumanResourceApplyLeave.document_file,
          createHumanResourceApplyLeave.date,
          createHumanResourceApplyLeave.hospital_id,
          applyLeaveRequestId,
        ],
      );
      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.STAFF_REQUEST_DETAILS,
            Added_Staff_leave_details: await this.connection.query(
              'SELECT * FROM staff_leave_request WHERE id = ?',
              [applyLeaveRequestId],
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

  async findAll(): Promise<HumanResourceApplyLeave[]> {
    const getStaffLeaveDetails = await this.connection.query(
      `select concat(staff.name," ",staff.surname,"(",staff.employee_id,")") as Staff,leave_types.type as LeaveType,
concat(staff_leave_request.leave_from," - ",staff_leave_request.leave_to)as LeaveDate,
staff_leave_request.leave_days as Days,staff_leave_request.date as ApplyDate,staff_leave_request.status as Status
from staff_leave_request
left join staff on staff.id = staff_leave_request.staff_id left join leave_types on leave_types.id =  staff_leave_request.leave_type_id
where staff_leave_request.staff_id = staff_leave_request.applied_by`,
    );
    return getStaffLeaveDetails;
  }

  async remove(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const hosLeavetype = await this.connection.query(
        'select leave_type_id from staff_leave_request where id = ?',
        [id],
      );
      let HOSleavetypeid;
      HOSleavetypeid = hosLeavetype[0].leave_type_id;
      await this.dynamicConnection.query(
        'select id from leave_types where Hospital_id = ? AND hospital_leave_types_id = ?',
        [hospital_id, HOSleavetypeid],
      );
      const result = await this.connection.query(
        `DELETE FROM staff_leave_request WHERE id = ? AND status = 'pending'`,
        [id],
      );
      await this.dynamicConnection.query(
        `DELETE FROM staff_leave_request WHERE hospital_id = ? AND hos_staff_leave_request_id = ? AND status = 'pending'`,
        [hospital_id, id],
      );
      if (result.affectedRows === 0) {
        return [
          {
            status: process.env.FAILURE_LEAVE,
            message: `${process.env.NO_PENDING_LEAVE} ${id}.`,
          },
        ];
      }

      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.STAFF_LEAVE_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
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

  async createLeaveRequest(
    createHumanResourceApplyLeaveRequest: HumanResourceApplyLeave,
  ) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createHumanResourceApplyLeaveRequest.staff_id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourceApplyLeaveRequest.staff_id} ${process.env.VALIDATION_NOT_FOUND}`,
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
        [createHumanResourceApplyLeaveRequest.applied_by],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createHumanResourceApplyLeaveRequest.applied_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail1 = staffId1.email;
      const dynamicUpdateStaff1 = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail1],
      );
      const dynamicUPTDStaffId1 = dynamicUpdateStaff1[0].id;

      const leaveFrom = new Date(
        createHumanResourceApplyLeaveRequest.leave_from,
      );
      const leaveTo = new Date(createHumanResourceApplyLeaveRequest.leave_to);
      const leaveDays =
        Math.ceil(
          (leaveTo.getTime() - leaveFrom.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      let ApplyLeaveRequestId;
      const applyLeaveRequest = await this.connection.query(
        `INSERT into staff_leave_request(
  staff_id,
  leave_type_id,
  leave_from,
  leave_to,
  leave_days,
  employee_remark,
  admin_remark,
  status,
  applied_by,
  document_file,
  date
)VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createHumanResourceApplyLeaveRequest.staff_id,
          createHumanResourceApplyLeaveRequest.leave_type_id,
          createHumanResourceApplyLeaveRequest.leave_from,
          createHumanResourceApplyLeaveRequest.leave_to,
          leaveDays,
          createHumanResourceApplyLeaveRequest.employee_remark,
          createHumanResourceApplyLeaveRequest.admin_remark,
          createHumanResourceApplyLeaveRequest.status,
          createHumanResourceApplyLeaveRequest.applied_by,
          createHumanResourceApplyLeaveRequest.document_file,
          createHumanResourceApplyLeaveRequest.date,
        ],
      );

      ApplyLeaveRequestId = applyLeaveRequest.insertId;

      let AdminLeaveTypeId;

      const AdminLeaveType = await this.dynamicConnection.query(
        'select id from leave_types where Hospital_id = ? AND hospital_leave_types_id = ?',
        [
          createHumanResourceApplyLeaveRequest.hospital_id,
          createHumanResourceApplyLeaveRequest.leave_type_id,
        ],
      );

      AdminLeaveTypeId = AdminLeaveType[0].id;

      await this.dynamicConnection.query(
        `INSERT into staff_leave_request(
  staff_id,
  leave_type_id,
  leave_from,
  leave_to,
  leave_days,
  employee_remark,
  admin_remark,
  status,
  applied_by,
  document_file,
  date,
  hospital_id,
  hos_staff_leave_request_id
)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicUPTDStaffId,
          AdminLeaveTypeId,
          createHumanResourceApplyLeaveRequest.leave_from,
          createHumanResourceApplyLeaveRequest.leave_to,
          leaveDays,
          createHumanResourceApplyLeaveRequest.employee_remark,
          createHumanResourceApplyLeaveRequest.admin_remark,
          createHumanResourceApplyLeaveRequest.status,
          dynamicUPTDStaffId1,
          createHumanResourceApplyLeaveRequest.document_file,
          createHumanResourceApplyLeaveRequest.date,
          createHumanResourceApplyLeaveRequest.hospital_id,
          ApplyLeaveRequestId,
        ],
      );

      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.STAFF_REQUEST_DETAILS,
            Added_Staff_leave_details: await this.connection.query(
              'SELECT * FROM staff_leave_request WHERE id = ?',
              [ApplyLeaveRequestId],
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

  async findAllLeaveRequest(): Promise<HumanResourceApplyLeave[]> {
    const getStaffLeaveRequestDetails = await this.connection.query(
      `select concat(staff.name," ",staff.surname,"(",staff.employee_id,")") as Staff,leave_types.type as LeaveType,
concat(staff_leave_request.leave_from," - ",staff_leave_request.leave_to)as LeaveDate,
staff_leave_request.leave_days as Days,staff_leave_request.date as ApplyDate,staff_leave_request.status as Status
from staff_leave_request
left join staff on staff.id = staff_leave_request.staff_id left join leave_types on leave_types.id =  staff_leave_request.leave_type_id`,
    );
    return getStaffLeaveRequestDetails;
  }

  async updateStaffLeaveRequest(
    id: number,
    updateHumanResourceApplyLeave: HumanResourceApplyLeave,
  ) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [updateHumanResourceApplyLeave.status_updated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${updateHumanResourceApplyLeave.status_updated_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const UpdateStaffLeaveRequest = await this.connection.query(
        'UPDATE staff_leave_request SET status = ?,admin_remark=?,status_updated_by=? WHERE id = ?',
        [
          updateHumanResourceApplyLeave.status,
          updateHumanResourceApplyLeave.admin_remark,
          updateHumanResourceApplyLeave.status_updated_by,
          id,
        ],
      );
      const UpdateAdminStaffLeaveRequest = await this.dynamicConnection.query(
        'UPDATE staff_leave_request SET status = ?,admin_remark=?,status_updated_by=? WHERE hospital_id = ? and hos_staff_leave_request_id = ?',
        [
          updateHumanResourceApplyLeave.status,
          updateHumanResourceApplyLeave.admin_remark,
          dynamicUPTDStaffId,
          updateHumanResourceApplyLeave.hospital_id,
          id,
        ],
      );
      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS,
            message: process.env.STAFF_PASSWORD_MESSAGE,
            updated_values: {
              primary_database: UpdateStaffLeaveRequest,
              dynamic_database: UpdateAdminStaffLeaveRequest,
            },
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

  async findByOwnStaffLeaveDetails(
    search: string,
  ): Promise<HumanResourceApplyLeave[]> {
    let query = `select concat(staff.name," ",staff.surname,"(",staff.employee_id,")") as Staff,leave_types.type as LeaveType,
    concat(staff_leave_request.leave_from," - ",staff_leave_request.leave_to)as LeaveDate,
    staff_leave_request.leave_days as Days,staff_leave_request.date as ApplyDate,staff_leave_request.status as Status
    from staff_leave_request
    left join staff on staff.id = staff_leave_request.staff_id left join leave_types on leave_types.id =  staff_leave_request.leave_type_id
    where staff_leave_request.staff_id = staff_leave_request.applied_by
  `;
    let values = [];
    if (search) {
      query += ` and (staff.employee_id LIKE ? OR staff.name LIKE ? OR leave_types.type LIKE ? OR staff_leave_request.leave_from LIKE ? OR staff_leave_request.leave_to LIKE ? OR staff_leave_request.leave_days LIKE ? OR staff_leave_request.date LIKE ? OR staff_leave_request.status LIKE ?)  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const StaffownLeaveSearch = await this.connection.query(final, values);
    return StaffownLeaveSearch;
  }

  async findByAdminStaffLeaveDetails(
    search: string,
  ): Promise<HumanResourceApplyLeave[]> {
    let query = `select concat(staff.name," ",staff.surname,"(",staff.employee_id,")") as name,leave_types.type,
    concat(staff_leave_request.leave_from,"  -  ",staff_leave_request.leave_to)as leave_date,
    staff_leave_request.leave_days,staff_leave_request.date,staff_leave_request.status 
    from staff_leave_request
    left join staff on staff.id = staff_leave_request.staff_id left join leave_types on leave_types.id =  staff_leave_request.leave_type_id
  `;
    let values = [];
    if (search) {
      query += ` WHERE (staff.employee_id LIKE ? OR staff.name LIKE ? OR leave_types.type LIKE ? OR staff_leave_request.leave_from LIKE ? OR staff_leave_request.leave_to LIKE ? OR staff_leave_request.leave_days LIKE ? OR staff_leave_request.date LIKE ? OR staff_leave_request.status LIKE ?)  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const StaffAdminLeaveSearch = await this.connection.query(final, values);
    return StaffAdminLeaveSearch;
  }

  async findRoles(): Promise<HumanResourceApplyLeave[]> {
    const getRoleDetails = await this.connection.query(
      `SELECT roles.id,roles.name from roles`,
    );
    return getRoleDetails;
  }

  async listStaffByRole(id: number): Promise<HumanResourceApplyLeave | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM roles WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getStaffByRoleID = await this.connection.query(
        `SELECT staff.id,staff.employee_id,concat(staff.name," ",staff.surname,"(",staff.employee_id,")") as StaffName FROM staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  WHERE roles.id = ?`,
        [id],
      );
      return getStaffByRoleID;
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

  async listStaffLeavesByStaffID(
    id: number,
  ): Promise<HumanResourceApplyLeave | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM staff WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getStaffLeaveByStaffID = await this.connection.query(
        `SELECT concat(leave_types.type,"(",staff_leave_details.alloted_leave,")") as StaffLeaveType FROM staff_leave_details
  LEFT JOIN staff ON staff.id = staff_leave_details.staff_id
  LEFT JOIN leave_types ON leave_types.id = staff_leave_details.leave_type_id WHERE staff_id = ?`,
        [id],
      );
      return getStaffLeaveByStaffID;
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


  async findStaffOwnLeaveRequestDetails(
    search: string,
    limit: number,
    page: number,
    staffId?: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];
  
    try {
      let baseQuery = `
        SELECT 
          staff_leave_request.id,
          CONCAT(staff.name, " ", staff.surname, " (", staff.employee_id, ")") AS Staff,
          leave_types.type AS LeaveType,
          CONCAT(staff_leave_request.leave_from, " - ", staff_leave_request.leave_to) AS LeaveDate,
          staff_leave_request.leave_days AS Days,
          staff_leave_request.date AS ApplyDate,
          staff_leave_request.status AS Status
        FROM staff_leave_request
        LEFT JOIN staff ON staff.id = staff_leave_request.staff_id
        LEFT JOIN leave_types ON leave_types.id = staff_leave_request.leave_type_id
        WHERE staff_leave_request.staff_id = staff_leave_request.applied_by`;
  
      let countQuery = `
        SELECT COUNT(staff_leave_request.id) AS total
        FROM staff_leave_request
        LEFT JOIN staff ON staff.id = staff_leave_request.staff_id
        LEFT JOIN leave_types ON leave_types.id = staff_leave_request.leave_type_id
        WHERE staff_leave_request.staff_id = staff_leave_request.applied_by`;
  
      
      if (staffId !== undefined && staffId !== null) {
        baseQuery += ` AND staff.id = ?`;
        countQuery += ` AND staff.id = ?`;
        values.push(staffId);
      }
  
      
      if (search) {
        const condition = `
          AND (
            staff.employee_id LIKE ? OR
            staff.name LIKE ? OR
            leave_types.type LIKE ? OR
            staff_leave_request.leave_from LIKE ? OR
            staff_leave_request.leave_to LIKE ? OR
            staff_leave_request.leave_days LIKE ? OR
            staff_leave_request.date LIKE ? OR
            staff_leave_request.status LIKE ?
          )`;
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        values.push(...Array(8).fill(pattern));
      }
  
      baseQuery += ` ORDER BY staff_leave_request.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, parseInt(limit.toString()), parseInt(offset.toString())];
  
      const staffOwnLeaveRequestDetailsSearch = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
  
      const countResult = await this.connection.query(countQuery, values);
  
      return {
        details: staffOwnLeaveRequestDetailsSearch,
        total: countResult[0]?.total ?? 0,
      };
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
  
  
  
  




  async findStaffLeaveRequestDetails(
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      let baseQuery = `
       select staff_leave_request.id,staff.id AS Staff_ID,leave_types.id AS LeaveTypeID,concat(staff.name," ",staff.surname,"(",staff.employee_id,")") as name,leave_types.type,
    concat(staff_leave_request.leave_from,"  -  ",staff_leave_request.leave_to)as leave_date,
    staff_leave_request.leave_days,staff_leave_request.date,staff_leave_request.status,staff_leave_request.applied_by,staff_leave_request.document_file,staff_leave_request.employee_remark,
    updated_by.name AS status_updated_by_name,updated_by.surname AS status_updated_by_surname
    from staff_leave_request
    left join staff on staff.id = staff_leave_request.staff_id 
    left join leave_types on leave_types.id =  staff_leave_request.leave_type_id
    LEFT JOIN staff AS updated_by ON updated_by.id = staff_leave_request.status_updated_by `;

      let countQuery = `
      SELECT COUNT(staff_leave_request.id) AS total 
      from staff_leave_request
    left join staff on staff.id = staff_leave_request.staff_id left join leave_types on leave_types.id =  staff_leave_request.leave_type_id 
    LEFT JOIN staff AS updated_by ON updated_by.id = staff_leave_request.status_updated_by`;

      if (search) {
        const condition = `
     WHERE (staff.employee_id LIKE ? OR staff.name LIKE ? OR leave_types.type LIKE ? OR staff_leave_request.leave_from LIKE ? OR staff_leave_request.leave_to LIKE ? OR staff_leave_request.leave_days LIKE ? OR staff_leave_request.date LIKE ? OR staff_leave_request.status LIKE ? OR staff_leave_request.applied_by LIKE ? OR staff_leave_request.document_file LIKE ?) `;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        values.push(
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern
        );
      }

      baseQuery += ` ORDER BY staff_leave_request.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];

      const staffLeaveRequestDetailsSearch = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: staffLeaveRequestDetailsSearch,
        total: countResult.total ?? 0,
      };
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
}
