import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PhoneCallLog } from "./entities/phone_call_log.entity";

@Injectable()
export class PhoneCallLogService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createPhoneCallLog: PhoneCallLog) {
    try {
      const addCalls = await this.connection.query(
        `INSERT into general_calls(
       name,
       contact,
       date,
       description,
       follow_up_date,
       call_duration,
       note,
       call_type
        ) VALUES (?,?,?,?,?,?,?,?)`,
        [
          createPhoneCallLog.name,
          createPhoneCallLog.contact,
          createPhoneCallLog.date,
          createPhoneCallLog.description,
          createPhoneCallLog.follow_up_date,
          createPhoneCallLog.call_duration,
          createPhoneCallLog.note,
          createPhoneCallLog.call_type
        ],
      )
      const addCallsID = addCalls.insertId;
      await this.dynamicConnection.query(
        `INSERT into general_calls(
       name,
       contact,
       date,
       description,
       follow_up_date,
       call_duration,
       note,
       call_type,
       hospital_id,
       hos_general_calls_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          createPhoneCallLog.name,
          createPhoneCallLog.contact,
          createPhoneCallLog.date,
          createPhoneCallLog.description,
          createPhoneCallLog.follow_up_date,
          createPhoneCallLog.call_duration,
          createPhoneCallLog.note,
          createPhoneCallLog.call_type,
          createPhoneCallLog.hospital_id,
          addCallsID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "general calls added successfully ",
          "calls_Details": await this.connection.query('SELECT * FROM general_calls WHERE id = ?', [addCallsID])
        }
      }];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async update(id: number, createPhoneCallLog: PhoneCallLog) {
    try {
      await this.connection.query(`update general_calls SET
      name=?,
       contact=?,
       date=?,
       description=?,
       follow_up_date=?,
       call_duration=?,
       note=?,
       call_type=?
       where id=?`,
        [
          createPhoneCallLog.name,
          createPhoneCallLog.contact,
          createPhoneCallLog.date,
          createPhoneCallLog.description,
          createPhoneCallLog.follow_up_date,
          createPhoneCallLog.call_duration,
          createPhoneCallLog.note,
          createPhoneCallLog.call_type,
          id
        ],
      )
      const [dynCallLogs] = await this.dynamicConnection.query(`select id from general_calls where hospital_id = ? and  hos_general_calls_id = ?`, [createPhoneCallLog.hospital_id, id])
      const dynCallLogsID = dynCallLogs.id;
      await this.dynamicConnection.query(`update general_calls SET
       name=?,
       contact=?,
       date=?,
       description=?,
       follow_up_date=?,
       call_duration=?,
       note=?,
       call_type=?,
       hospital_id=?
       where id=?`,
        [
          createPhoneCallLog.name,
          createPhoneCallLog.contact,
          createPhoneCallLog.date,
          createPhoneCallLog.description,
          createPhoneCallLog.follow_up_date,
          createPhoneCallLog.call_duration,
          createPhoneCallLog.note,
          createPhoneCallLog.call_type,
          createPhoneCallLog.hospital_id,
          dynCallLogsID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Call logs updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM general_calls WHERE id = ?', [id])
        }
      }];

    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async removeFrontofficeCallLogs(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM general_calls WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM general_calls WHERE hos_general_calls_id = ? and hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: 'success',
          message: `General calls details with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }
}
