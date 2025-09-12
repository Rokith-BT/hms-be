import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupAppointmentShift } from "./entities/setup-appointment-shift.entity";
import { CountDto } from "./setup-appointment-shift.dto";


@Injectable()
export class SetupAppointmentShiftService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    appointment_shiftEntity: SetupAppointmentShift,
  ): Promise<{ [key: string]: any }[]> {


    try {
      const overlappingShift = await this.connection.query(
        `SELECT * FROM global_shift WHERE 
          (start_time < ? AND end_time > ?)`,
        [
          appointment_shiftEntity.end_time,
          appointment_shiftEntity.start_time,
        ],
      );
      if (overlappingShift.length > 0) {
        return [
          {
            status: process.env.ERROR,
            message: process.env.SHIFT_OVERLAP,
          },
        ];
      }
      const result = await this.connection.query(
        'INSERT INTO global_shift (name, start_time, end_time) VALUES (?, ?, ?)',
        [
          appointment_shiftEntity.name,
          appointment_shiftEntity.start_time,
          appointment_shiftEntity.end_time,
        ],
      );
      await this.dynamicConnection.query(
        `INSERT INTO global_shift (name, start_time, end_time, Hospital_id, hospital_global_shift_id) VALUES (?, ?, ?, ?, ?)`,
        [
          appointment_shiftEntity.name,
          appointment_shiftEntity.start_time,
          appointment_shiftEntity.end_time,
          appointment_shiftEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          data: {
            id: result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.SHIFT_ADDED,
            inserted_data: await this.connection.query(
              'SELECT * FROM global_shift WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<SetupAppointmentShift[]> {
    try {
      const global_shift = await this.connection.query(
        'SELECT * FROM global_shift',
      );
      return global_shift;
    } catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR
      );

    }
  }

  async findOne(id: string): Promise<SetupAppointmentShift | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM global_shift WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      const global_shift = await this.connection.query(
        'SELECT * FROM global_shift WHERE id = ?',
        [id],
      );
      return global_shift;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    id: string,
    appointment_shiftEntity: SetupAppointmentShift,
  ): Promise<{ [key: string]: any }[]> {
try {


    const [existingRecord] = await this.connection.query(
      'SELECT id FROM global_shift WHERE id = ?',
      [id],
    );
    

    if (!existingRecord) {
      return [{ status: process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }



 if (appointment_shiftEntity.start_time >= appointment_shiftEntity.end_time) {
  return [{
    status: process.env.ERROR_STATUS,
    message: process.env.SHIFT_TIME,
  }];
}

const overlappingShift = await this.connection.query(
  `SELECT * FROM global_shift WHERE 
    (start_time < ? AND end_time > ? AND id != ?)`,
  [
    appointment_shiftEntity.end_time,
    appointment_shiftEntity.start_time,
    id
  ],
);
if (overlappingShift.length > 0) {
  return [
    {
      status: process.env.ERROR,
      message: process.env.SHIFT_OVERLAPPING,
    },
  ];
}



      await this.connection.query(
        'UPDATE global_shift SET name =? ,start_time =?, end_time =? WHERE id = ?',
        [
          appointment_shiftEntity.name,
          appointment_shiftEntity.start_time,
          appointment_shiftEntity.end_time,
          id,
        ],
      );

      await this.dynamicConnection.query(
        'update global_shift SET name =? ,start_time =?, end_time =? where hospital_global_shift_id =? and Hospital_id = ?',
        [
          appointment_shiftEntity.name,
          appointment_shiftEntity.start_time,
          appointment_shiftEntity.end_time,
          id,
          appointment_shiftEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SHIFT_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM global_shift WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM global_shift WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    await this.connection.query(
      'DELETE FROM global_shift WHERE id = ?',
      [id],
    );


    try {
      const resul = await this.dynamicConnection.query(
        'select id from global_shift where hospital_global_shift_id = ?',
        [id],
      );
      const shift = resul[0].id;
      await this.dynamicConnection.query(
        `delete from global_shift where id = ? and Hospital_id = ?`,
        [shift, Hospital_id],
      );

      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async AppointmentShift(search: string): Promise<SetupAppointmentShift[]> {
    let query = ` SELECT * FROM global_shift `;
    let values = [];
    if (search) {
      query += ` WHERE ( global_shift.name LIKE ? OR global_shift.start_time LIKE ? OR global_shift.end_time LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    } let final = query;
    const appointmentShiftSearch = await this.connection.query(final, values);
    return appointmentShiftSearch;
  }

//   async findallshift(limit: number, page: number, search?: string): Promise<CountDto> {
//     try {



//       const offset = limit * (page - 1);

//       const searchfilter = search ? `AND (name LIKE ? OR start_time LIKE ? OR end_time LIKE ?)` : '';
//       const queryParams = search
//       ? [`%${search}%`, `%${search}%`, `%${search}%`,Number(limit), Number(offset)]
//       : [Number(limit), Number(offset)];

// console.log("queryParams",queryParams);

//       const global_shift = await this.connection.query(
//         'SELECT * FROM global_shift LIMIT ? OFFSET ?');
// console.log("global_shift",global_shift.error);

//         const countParams = search
//         ? [`%${search}%`, `%${search}%`, `%${search}%`]
//         : [];
// console.log("countParams",countParams);

//       let [totallist] = await this.connection.query(`SELECT count(id) as total FROM global_shift`, countParams);

// console.log("totallist",totallist);

//       let variable = {
//         details: global_shift,
//         total: totallist.total
//       }

//       return variable;




//     } catch (error) {
//       throw new HttpException({
//         statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
//         message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE PLEASE TRY AGAIN LATER,`
//       }, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

async findallshift(limit: number, page: number, search?: string): Promise<CountDto> {
  try {
    const offset = limit * (page - 1);

    const searchfilter = search ? `AND (name LIKE ? OR start_time LIKE ? OR end_time LIKE ?)` : '';
    const queryParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`, Number(limit), Number(offset)]
      : [Number(limit), Number(offset)];

    console.log("queryParams", queryParams);

    const global_shift = await this.connection.query(
      `SELECT * FROM global_shift WHERE 1=1 ${searchfilter} LIMIT ? OFFSET ?`,
      queryParams
    );

    console.log("global_shift", global_shift);

    const countParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];

    console.log("countParams", countParams);

    let [totallist] = await this.connection.query(
      `SELECT count(id) as total FROM global_shift WHERE 1=1 ${searchfilter}`,
      countParams
    );

    console.log("totallist", totallist);

    let variable = {
      details: global_shift,
      total: totallist.total
    };

    return variable;
  } catch (error) {
    throw new HttpException(
      {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}


}
