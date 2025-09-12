import { Injectable } from '@nestjs/common';
import { CreateOpHubFcmTokenDto } from './dto/create-op-hub-fcm-token.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubFcmTokenService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) { }


  async create(createOpHubFcmTokenDto: CreateOpHubFcmTokenDto) {
    if (!createOpHubFcmTokenDto.hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {

      const [getStaffEmail] = await this.dynamicConnection.query(`select email from staff where id = ?`, [createOpHubFcmTokenDto.staff_id])
      const staff_mail_id = await getStaffEmail.email
      await this.connection.query(`update hospital_staffs set fcm_token = ? where username = ? and hospital_id = ?`, [
        createOpHubFcmTokenDto.fcm_token,
        staff_mail_id,
        createOpHubFcmTokenDto.hospital_id
      ])
      return {
        "status": "success",
        "message": "fcm token updated successfully"
      };
    } catch (error) {
      return {
        "status": "failed",
        "message": "unable to update fcm token",
        "error": error
      }
    }
  }

}
