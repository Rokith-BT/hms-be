import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubSendNotificationService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async SendNotificationForPatientProfile(from_staff_id: string, to_staff_id: any, room_id: string, hospital_id: any) {

    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }

    const [getBearerToken] = await this.connection.query(
      `select token from op_hub_firebase_auth_bearer_token`
    );
    const token = 'Bearer ' + getBearerToken.token;

    if (from_staff_id && to_staff_id) {

      const [getFromStaffEmail] = await this.dynamicConnection.query(`select * from staff where id = ?`, [from_staff_id])
      const [getToStaffEmail] = await this.dynamicConnection.query(`select email from staff where id = ?`, [from_staff_id])

      if (getToStaffEmail) {
        const [getFcmToken] = await this.connection.query(
          `select fcm_token from hospital_staffs where username = ?`,
          [getToStaffEmail.email]
        );
        if (getFcmToken) {
          const notificationBody = {
            message: {
              token: getFcmToken.fcm_token,
              notification: {
                body: room_id,
                title: "Dr." + getFromStaffEmail.name + " " + getFromStaffEmail.surname + " is calling you",
              },
            },
          };
          const headers = {
            accept: '*/*',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json',
            Authorization: token,
          };
          const authUrl = `https://fcm.googleapis.com/v1/projects/plenome-hub/messages:send`;
          try {
            await axios.post(authUrl, notificationBody, { headers });
          } catch (error) {
            console.log(error.response.data, "ppp");
          }

          return {
            status: "success",
            message: "Notification sent successfully",
          };
        }
      }
    }
  }
}
