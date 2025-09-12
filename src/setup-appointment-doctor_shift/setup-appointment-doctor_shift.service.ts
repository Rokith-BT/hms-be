import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupAppointmentDoctorShift } from "./entities/setup-appointment-doctor_shift.entity";
import { CountDto } from "./setup-appointment-doctor_shift.dto";

@Injectable()
export class SetupAppointmentDoctorShiftService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    doctor_shiftEntity: SetupAppointmentDoctorShift,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const [Hos_staff_email] = await this.connection.query(
        `select email from staff where id = ?`,
        [doctor_shiftEntity.staff_id],
      );

      const [Admin_staff_id] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [Hos_staff_email.email],
      );

      const [Admin_global_shift_id] = await this.dynamicConnection.query(
        `select id from global_shift where Hospital_id = ? and hospital_global_shift_id = ?`,
        [doctor_shiftEntity.Hospital_id, doctor_shiftEntity.global_shift_id],
      );

      const [check] = await this.connection.query(
        `select id from doctor_global_shift where staff_id = ? and global_shift_id = ?`,
        [doctor_shiftEntity.staff_id, doctor_shiftEntity.global_shift_id],
      );
      try {
        if (check) {
          await this.connection.query(
            `delete from doctor_global_shift where id = ?`,
            [check.id],
          );

          await this.dynamicConnection.query(
            `delete from doctor_global_shift where Hospital_id = ? and hospital_doctor_global_shift_id = ?`,
            [doctor_shiftEntity.Hospital_id, check.id],
          );

          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS_V2,
                messege: process.env.DELETED,
              },
            },
          ];
        } else {
          const newHos = await this.connection.query(
            `insert into doctor_global_shift (staff_id,global_shift_id) values (?,?)`,
            [doctor_shiftEntity.staff_id, doctor_shiftEntity.global_shift_id],
          );

          await this.dynamicConnection.query(
            `insert into doctor_global_shift (staff_id,global_shift_id,Hospital_id,hospital_doctor_global_shift_id)
      values (?,?,?,?)`,
            [
              Admin_staff_id.id,
              Admin_global_shift_id.id,
              doctor_shiftEntity.Hospital_id,
              newHos.insertId,
            ],
          );

          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS_V2,
                messege: process.env.DOCTOR_GLOBAL_SHIFT,
              },
            },
          ];
        }
      } catch (error) { }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupAppointmentDoctorShift[]> {
    try {
      const doctor_shift = await this.connection.query(`
        SELECT
              staff.id,
              concat(staff.name," ",staff.surname,"(",staff.employee_id,")") AS doctor_name,
              JSON_ARRAYAGG(
                  JSON_OBJECT('shift', global_shift.name,'id',global_shift.id)
              ) AS global_shifts
          FROM
              staff
          LEFT JOIN
              doctor_global_shift ON doctor_global_shift.staff_id = staff.id
          LEFT JOIN
              global_shift ON global_shift.id = doctor_global_shift.global_shift_id
              left join
              staff_roles ON staff.id = staff_roles.staff_id
              where staff_roles.role_id = 3
             
          GROUP BY
              staff.id,
              CONCAT(staff.name, ' ', staff.surname, '(', staff.employee_id, ')');
      `);
      return doctor_shift;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async AppointmentDoctorShift(
    search: string,
  ): Promise<SetupAppointmentDoctorShift[]> {
    try {


      let query = ` SELECT
  staff.id,
  concat(staff.name," ",staff.surname,"(",staff.employee_id,")") AS doctor_name,
  JSON_ARRAYAGG(
      JSON_OBJECT('shift', global_shift.name,'id',global_shift.id)
  ) AS global_shifts
FROM
  staff
LEFT JOIN
  doctor_global_shift ON doctor_global_shift.staff_id = staff.id
LEFT JOIN
  global_shift ON global_shift.id = doctor_global_shift.global_shift_id
  left join
  staff_roles ON staff.id = staff_roles.staff_id
  where staff_roles.role_id = 3
`;
      let values = [];

      if (search) {
        query += ` AND (concat(staff.name," ",staff.surname,"(",staff.employee_id,")") LIKE ?) `;
        values.push('%' + search + '%');
      }
      let last = ` GROUP BY
  staff.id,
  CONCAT(staff.name, ' ', staff.surname, '(', staff.employee_id, ')') `;

      let final = query + last;

      const appointmentDoctorShiftSearch = await this.connection.query(
        final,
        values,
      );

      return appointmentDoctorShiftSearch;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }



//   async findalldoctorshift(limit: number, page: number): Promise<CountDto> {
//     try {



//       const offset = limit * (page - 1);
//       console.log(limit, "limittttttttt");  
//       console.log(page, "pagenumberrrrrr");

//       const doctor_shift = await this.connection.query(`
//         SELECT
//               staff.id,
//               concat(staff.name," ",staff.surname,"(",staff.employee_id,")") AS doctor_name,
//               JSON_ARRAYAGG(
//                   JSON_OBJECT('shift', global_shift.name,'id',global_shift.id)
//               ) AS global_shifts
//           FROM
//               staff
//           LEFT JOIN
//               doctor_global_shift ON doctor_global_shift.staff_id = staff.id
//           LEFT JOIN
//               global_shift ON global_shift.id = doctor_global_shift.global_shift_id
//               left join
//               staff_roles ON staff.id = staff_roles.staff_id
//               where staff_roles.role_id = 3
             
//           GROUP BY
//               staff.id,
//               CONCAT(staff.name, ' ', staff.surname, '(', staff.employee_id, ')') LIMIT ? OFFSET ?`,
//         [Number(limit), Number(offset)]);

//       let [total_list] = await this.connection.query(`SELECT COUNT(DISTINCT staff.id) AS total
// FROM staff
// LEFT JOIN doctor_global_shift ON doctor_global_shift.staff_id = staff.id
// LEFT JOIN global_shift ON global_shift.id = doctor_global_shift.global_shift_id
// LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
// WHERE staff_roles.role_id = 3;
// `)

//       let doctor_shift_variable = {
//         details: doctor_shift,
//         total: total_list.total
//       }

//       return doctor_shift_variable;

//     } catch (error) {
//       throw new HttpException({
//         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//         message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
//       }, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }


async findalldoctorshift(limit: number, page: number, search?: string): Promise<CountDto> {
  try {



    const offset = limit * (page - 1);
    

    const searchfilter = search ? `AND (staff.name LIKE ? OR staff.surname LIKE ? OR staff.employee_id LIKE ?)` : '';
    const queryParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`, Number(limit), Number(offset)]
      : [Number(limit), Number(offset)];
    
    const doctor_shift = await this.connection.query(`
      SELECT
        staff.id,
        CONCAT(staff.name, " ", staff.surname, "(", staff.employee_id, ")") AS doctor_name,
        JSON_ARRAYAGG(
          JSON_OBJECT('shift', global_shift.name, 'id', global_shift.id)
        ) AS global_shifts
      FROM staff
      LEFT JOIN doctor_global_shift ON doctor_global_shift.staff_id = staff.id
      LEFT JOIN global_shift ON global_shift.id = doctor_global_shift.global_shift_id
      LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
      WHERE staff_roles.role_id = 3
      ${searchfilter}
      GROUP BY staff.id, CONCAT(staff.name, ' ', staff.surname, '(', staff.employee_id, ')')
      LIMIT ? OFFSET ?
    `, queryParams);
    
    const countParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];
    
    const [total_list] = await this.connection.query(`
      SELECT COUNT(DISTINCT staff.id) AS total
      FROM staff
      LEFT JOIN doctor_global_shift ON doctor_global_shift.staff_id = staff.id
      LEFT JOIN global_shift ON global_shift.id = doctor_global_shift.global_shift_id
      LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
      WHERE staff_roles.role_id = 3 
      ${searchfilter}
    `, countParams);
    

    let doctor_shift_variable = {
      details: doctor_shift,
      total: total_list.total
    }

    return doctor_shift_variable;

  } catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}
