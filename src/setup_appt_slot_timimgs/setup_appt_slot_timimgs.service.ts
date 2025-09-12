import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Entity } from "typeorm";
import { SetupApptSlotTimimg } from "./entities/setup_appt_slot_timimg.entity";

@Injectable()
export class SetupApptSlotTimimgsService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async updatepostTimingSlot(
    timingEntityArray: SetupApptSlotTimimg[],
  ): Promise<{ [key: string]: any }[]> {
 
 
    const responseArray: { [key: string]: any }[] = [];
 
    try {
      for (const timingEntity of timingEntityArray) {
        const [start_times] = await this.connection.query(
          `SELECT global_shift.start_time FROM global_shift WHERE id = ?`,
          [timingEntity.global_shift_id],
        );
 
        const [end_times] = await this.connection.query(
          `SELECT global_shift.end_time FROM global_shift WHERE id = ?`,
          [timingEntity.global_shift_id],
        );
        const getAllSlotForStaff = await this.connection.query(
          `SELECT * FROM doctor_shift WHERE staff_id = ? AND day = ?`,
          [timingEntity.staff_id, timingEntity.day],
        );
        if (
          start_times.start_time > timingEntity.start_time ||
          end_times.end_time < timingEntity.end_time
        ) {
          return [{
            status: process.env.ERROR_STATUS,
            message: `${process.env.SLOT_TIME_RANGE} ${start_times.start_time} - ${end_times.end_time}`,
          }];
        } else if (timingEntity.start_time >= timingEntity.end_time) {
          return [{
            status: process.env.ERROR_STATUS,
            message: process.env.SLOT_TIME_GREATER,
          }];
          continue;
        } else {
          let count = 0;
          
          for (const staff_slot of getAllSlotForStaff) {
 
            if(
              staff_slot.id !== timingEntity.id &&
              !(staff_slot.start_time >= timingEntity.end_time || staff_slot.end_time <= timingEntity.start_time)
            )  {
              
              count = count + 1;
              return [{
                status: process.env.ERROR_STATUS,
                message:
                  process.env.SLOT_TIME_OVERLAP  + " "+
                  timingEntity.day + " "+
                  process.env.BETWEEN + " "+
                  staff_slot.start_time + " "+
                  process.env.DASH + " "+
                  staff_slot.end_time,
              }];
            }
          }
 
        }
      }
      
      for (const timingEntity of timingEntityArray) {
        const [start_times] = await this.connection.query(
          `SELECT global_shift.start_time FROM global_shift WHERE id = ?`,
          [timingEntity.global_shift_id],
        );
 
        const [end_times] = await this.connection.query(
          `SELECT global_shift.end_time FROM global_shift WHERE id = ?`,
          [timingEntity.global_shift_id],
        );
        const getAllSlotForStaff = await this.connection.query(
          `SELECT * FROM doctor_shift WHERE staff_id = ? AND day = ?`,
          [timingEntity.staff_id, timingEntity.day],
        );
        if (
          start_times.start_time > timingEntity.start_time ||
          end_times.end_time < timingEntity.end_time
        ) {
          responseArray.push({
            status: process.env.ERROR_STATUS,
            message: `${process.env.SLOT_SHIFT_TIME_RANGE} ${start_times.start_time} - ${end_times.end_time}`,
          });
        } else if (timingEntity.start_time > timingEntity.end_time) {
          responseArray.push({
            status: process.env.ERROR_STATUS,
            message: process.env.SLOT_TIME_GREATER
          });
          continue;
        } else {
          let count = 0;
          
          for (const staff_slot of getAllSlotForStaff) {
            if (
              staff_slot.id !== timingEntity.id &&
              !(staff_slot.start_time >= timingEntity.end_time || staff_slot.end_time <= timingEntity.start_time)
            ){
              
              count = count + 1;
              responseArray.push({
                status: process.env.ERROR_STATUS,
                message:
                   process.env.SLOT_TIME_OVERLAP  + " "+
                  timingEntity.day + " "+
                  process.env.BETWEEN + " "+
                  staff_slot.start_time + " "+
                  process.env.DASH + " "+
                  staff_slot.end_time,
              });
            }
          }
console.log(count <= 0,"count");
 
          if (count <= 0) {
            console.log("count <= 0");
            
            if (timingEntity.id) {
              await this.connection.query(
                'UPDATE doctor_shift SET start_time = ?, end_time = ? WHERE id = ?',
                [
                  timingEntity.start_time,
                  timingEntity.end_time,
                  timingEntity.id,
                ],
              );
 
              await this.dynamicConnection.query(
                'UPDATE doctor_shift SET start_time = ?, end_time = ? WHERE hospital_doctor_shift_id = ? AND Hospital_id = ?',
                [
                  timingEntity.start_time,
                  timingEntity.end_time,
                  timingEntity.id,
                  timingEntity.Hospital_id,
                ],
              ); 
              responseArray.push({
                status: process.env.SUCCESS_STATUS_V2,
                message: process.env.SHIFT_DETAIL_UPDATED,
                updated_data: await this.connection.query(
                  'SELECT * FROM doctor_shift WHERE id = ?',
                  [timingEntity.id],
                ),
              });
              continue;
            }
            else {
              const [getAdminGlobal] = await this.dynamicConnection.query(
                'SELECT id FROM global_shift WHERE Hospital_id = ? AND hospital_global_shift_id = ?',
                [timingEntity.Hospital_id, timingEntity.global_shift_id],
              );
 
              const [getHosDocMail] = await this.connection.query(
                'SELECT email FROM staff WHERE id = ?',
                [timingEntity.staff_id],
              );
              const [getAdminDocId] = await this.dynamicConnection.query(
                'SELECT id FROM staff WHERE email = ?',
                [getHosDocMail.email],
              );
              console.log("rrr");
              const time = await this.connection.query(`select * from doctor_shift where id = ?`, [timingEntity.id]);
              if (
                start_times.start_time === time.start_time ||
                end_times.end_time === time.end_time
              ) {
                return [{
                  status: process.env.ERROR_STATUS,
                  message: process.env.DUPLICATE_NAME,
                }]
              }
              else {
 
                const insertResult = await this.connection.query(
                  `INSERT INTO doctor_shift (day, staff_id, global_shift_id, start_time, end_time) VALUES (?, ?, ?, ?, ?)`,
                  [
                    timingEntity.day,
                    timingEntity.staff_id,
                    timingEntity.global_shift_id,
                    timingEntity.start_time,
                    timingEntity.end_time,
                  ],
                );
                console.log("eee");
 
                await this.dynamicConnection.query(
                  `INSERT INTO doctor_shift (day, staff_id, global_shift_id, start_time, end_time, Hospital_id, hospital_doctor_shift_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    timingEntity.day,
                    getAdminDocId.id,
                    getAdminGlobal.id,
                    timingEntity.start_time,
                    timingEntity.end_time,
                    timingEntity.Hospital_id,
                    insertResult.insertId,
                  ],
                );
 
                responseArray.push({
                  status: process.env.SUCCESS_STATUS_V2,
                  message: process.env.SHIFT_DETAIL_ADDED,
                  inserted_data: await this.connection.query(
                    'SELECT * FROM doctor_shift WHERE id = ?',
                    [insertResult.insertId],
                  ),
                });
              }
            }
          }
        }
      }
      return responseArray;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async finforDocAndShift(
    day: string,
    staff_id: number,
    global_shift_id: number,
  ) {
    try {
      const slot_timings = await this.connection.query(
        `select doctor_shift.id,doctor_shift.start_time,doctor_shift.end_time ,doctor_shift.day
       from doctor_shift where day = ? and staff_id = ? and global_shift_id = ? `,
        [day, staff_id, global_shift_id],
      );
      return slot_timings;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    id: number,
    timingEntity: SetupApptSlotTimimg,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM doctor_shift WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'update doctor_shift set start_time = ?, end_time = ? where id = ?',
        [timingEntity.start_time, timingEntity.end_time, id],
      );

      await this.dynamicConnection.query(
        'update doctor_shift SET start_time = ?, end_time = ? where hospital_doctor_shift_id = ? and Hospital_id = ?',
        [
          timingEntity.start_time,
          timingEntity.end_time,
          id,
          timingEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.SHIFT_DETAIL_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM doctor_shift WHERE id = ?',
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

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]>  {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM doctor_shift WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, message: process.env.EXISTING_RECORD }];
    }
        try {

    await this.connection.query(
      `Delete from doctor_shift where id = ?`,
      [id],
    );

      const time = await this.dynamicConnection.query(
        `select id from doctor_shift where hospital_doctor_shift_id = ?`,
        [id],
      );
      const times = time[0].id;

      await this.dynamicConnection.query(
        `delete from doctor_shift where id = ? and Hospital_id = ? `,
        [times, Hospital_id],
      );

      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message:id + " "+ process.env.DELETED,
        },
      ];
    } catch (error) {
       if (
      error.code === 'ER_ROW_IS_REFERENCED_2' || 
      error.errno === 1451 
    ) {
      return [
        {
          status: process.env.ERROR,
          message: `Cannot delete ID ${id} because it is in use (foreign key constraint).`,
        },
      ];
    }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
