import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubTokenInitiateService {


  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async findAll() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const TodayDate = `${year}-${month}-${day}`;
    const getTokenInitiatingDetails = await this.connection.query(`
      SELECT distinct doctor, shift_id, Hospital_id  
      FROM appointment 
      WHERE date = curdate() and appointment.doctor;
    `);
    for await (const { doctor, shift_id, Hospital_id } of getTokenInitiatingDetails) {
      await axios.post('http://localhost:/op-hub-token-generation', {
        staff_id: doctor,
        shift_id: shift_id,
        Hospital_id: Hospital_id,
        date: TodayDate
      });
    }

    const getsendNotificationDetails = await this.connection.query(`
      SELECT patients.patient_name,
             concat (patients.dial_code,"",patients.mobileno) mobileno,
             patients.email,
             CONCAT("Dr. ",staff.name, " ", staff.surname) doctorName,
             hospitals.hospital_name,
             appointment_queue.position token,
             DATE_FORMAT(appointment.date, '%D %b %Y') date,
             DATE_FORMAT(appointment.time, '%h:%i %p') time
      FROM appointment 
      LEFT JOIN patients ON appointment.patient_id = patients.id
      LEFT JOIN hospitals ON hospitals.plenome_id = appointment.Hospital_id
      LEFT JOIN appointment_queue ON appointment_queue.appointment_id = appointment.id
      LEFT JOIN staff ON staff.id = appointment.doctor
      WHERE appointment.date = curdate() and staff.id;
    `);
    for (const { mobileno, date, doctorName, token } of getsendNotificationDetails) {
      let body = {
        mobileNumber: mobileno,
        date: date,
        doctor: doctorName,
        TK_NO: token
      };
      await axios.post('https://notifications.plenome.com//sending-sms-token-no', body);
    }
    for (const { email, patient_name, hospital_name, date, time, token } of getsendNotificationDetails) {
      let body = {
        email: email,
        name: patient_name,
        HosName: hospital_name,
        date_time: date + " " + time,
        TOKEN_NO: token,
        company: "PLENOME"
      };
      await axios.post('https://notifications.plenome.com//email-token-number-send', body);
    }
    return `This action returns all tokenInitiate`;
  }
}
