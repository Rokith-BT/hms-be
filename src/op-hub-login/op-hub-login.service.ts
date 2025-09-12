import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { Login } from './entities/op-hub-login.entity';
const crypto = require('node:crypto');

@Injectable()
export class OpHubLoginService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  generateRandomPassword(length: number = 12): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    const randomBytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % characters.length;
      password += characters.charAt(randomIndex);
    }
    return password;
  }
  async create(Entity: Login) {
    const [getHospital_id] = await this.connection.query(`select hospital_id,staff_id,is_reset_needed from hospital_staffs 
  where username = ? and password = ?`, [Entity.Username, Entity.Password])
    if (getHospital_id) {
      const [getHosName] = await this.connection.query(`select * from hospitals where plenome_id = ?`, [getHospital_id.hospital_id])
      const [getAdminStaffEmail] = await this.connection.query(`select email from staff where id = ?`, [getHospital_id.staff_id])
      try {
        const [getHospitalStaff_id] = await this.dynamicConnection.query(`select staff.id id,roles.id role_id,roles.name,staff.is_active,
concat(staff.name," ",staff.surname) staffName,staff.image,staff.employee_id
from staff
left join staff_roles on staff.id = staff_roles.staff_id
left join roles on roles.id = staff_roles.role_id
where BINARY staff.email = ? and BINARY staff.password = ?`,
          [getAdminStaffEmail.email,
          Entity.Password])
        if (getHospitalStaff_id.is_active == 1) {
          let resp = {
            "Hospital_id": getHospital_id.hospital_id,
            "hip_id": getHosName.hip_id,
            "Hospital_name": getHosName.hospital_name,
            "Hospital_address": getHosName.address,
            "Hospital_logo": getHosName.logo,
            "Hospital_image": getHosName.image,
            "Staff_id": getHospitalStaff_id.id,
            "staffImage": getHospitalStaff_id.image,
            "username": Entity.Username,
            "password": Entity.Password,
            "role_id": getHospitalStaff_id.role_id,
            "staffName": getHospitalStaff_id.staffName,
            "role_name": getHospitalStaff_id.name,
            "resetStatus": getHospital_id.is_reset_needed,
            "employeeID": getHospitalStaff_id.employee_id,
            "abha_scan_qr": `https://phrsbx.abdm.gov.in/share-profile?hip-id=${getHosName.hip_name}&counter-id=dev-0`
          }
          if (getHospitalStaff_id.role_id == 3) {
            resp.abha_scan_qr = `https://phrsbx.abdm.gov.in/share-profile?hip-id=${getHosName.hip_name}&counter-id=dev-${getHospitalStaff_id.employee_id}`
          }
          return {
            status: "success",
            "messege": "Password verified successfully",
            "details": resp
          };
        }
        else {
          return {
            "status": "failed",
            "message": "Contact admin as you are disabled"
          }
        }
      } catch (error) {
        return error
      }
    }
    else {
      return {
        "status": "failed",
        "message": "Enter Correct username and password"
      }
    }
  }




  async ForgetPassword(Entity: Login) {
    const [getHospital_id] = await this.connection.query(`select hospital_id,staff_id,id from hospital_staffs 
where username = ?`, [Entity.Username])
    if (getHospital_id) {
      const [getHosName] = await this.connection.query(`select hospital_name
   from hospitals 
  where hospitals.plenome_id = ?`, [getHospital_id.hospital_id])
      const [getAdminStaffEmail] = await this.connection.query(`select email,staff.name,staff.surname from staff
   where id = ?`, [getHospital_id.staff_id])

      try {
        const [getHospitalStaff_id] = await this.dynamicConnection.query(`select id from staff where email = ? `,
          [getAdminStaffEmail.email])
        const Password = this.generateRandomPassword();
        await this.connection.query(`update hospital_staffs set
password = ?,is_reset_needed = ? where id = ? `,
          [Password,
            1,
            getHospital_id.id])
        await this.dynamicConnection.query(`update staff set password  = ? where id = ?`, [Password, getHospitalStaff_id.id])

        const EmailData = {
          "email": getAdminStaffEmail.email,
          "name": getAdminStaffEmail.name + " " + getAdminStaffEmail.surname,
          "HosName": getHosName.hospital_name,
          "Password": Password
        }
        await axios.post(`https://notifications.plenome.com//send-email`, EmailData)
        return {
          status: "success",
          "messege": "Password sent successfully to your Email"
        };

      } catch (error) {
        return error
      }
    }
    else {
      return {
        "status": "failed",
        "message": "Enter Correct username or contact your Admin"
      }
    }
  }

  async ResetPassword(Entity: Login) {
    const [getHospital_id] = await this.connection.query(`select hospital_id,staff_id,id,is_reset_needed from hospital_staffs 
where username = ?`, [Entity.Username])
    if (getHospital_id) {
      if (getHospital_id.is_reset_needed == 1) {
          const [getAdminStaffEmail] = await this.connection.query(`select email from staff where id = ?`, [getHospital_id.staff_id])
          try {
            const [getHospitalStaff_id] = await this.dynamicConnection.query(`select id from staff where email = ? `,
              [getAdminStaffEmail.email])
           const Password = Entity.Password;
            await this.connection.query(`update hospital_staffs set password = ?,is_reset_needed = ? where id = ? `,
              [Password,
                0,
                getHospital_id.id])
            await this.dynamicConnection.query(`update staff set password  = ? where id = ?`, [Password, getHospitalStaff_id.id])
            return {
              status: "success",
              "messege": "Password Changed successfully."
            };
          } catch (error) {
            return error
          }
      }
      else {
        return {
          "status": "failed",
          "message": "cannot change the password as no request is made for change of password"
        }
      }
    } else {
      return {
        "status": "failed",
        "message": "contact admin to register as staff"
      }
    }
  }

  async getHosDetails(hospital_id: number) {
    try {
      const [getHosName] = await this.connection.query(`select * from hospitals where plenome_id = ?`, [hospital_id])
      const [getheadfoot] = await this.dynamicConnection.query(`select print_header, print_footer from print_setting where setting_for = 'opdpre'`)
      const resp = {
        "Hospital_id": hospital_id,
        "Hospital_name": getHosName.hospital_name ?? "",
        "Hospital_address": getHosName.address ?? "",
        "Hospital_state": getHosName.state ?? "",
        "Hospital_district": getHosName.district ?? "",
        "Hospital_pincode": getHosName.pincode ?? "",
        "Hospital_logo": getHosName.logo ?? "",
        "Hospital_image": getHosName.image ?? "",
        "Hospital_website_link": getHosName.website ?? "",
        "Header": getheadfoot.print_header ?? "",
        "Footer": getheadfoot.print_footer ?? "",
        "Hospital_contact_no": getHosName.contact_no ?? "",
      }
      return {
        "status": "success",
        "message": "hospital details fetched successfully",
        "details": resp
      }
    } catch (error) {
      return {
        "status": "failed",
        "message": "unable to fetch hospital details",
        "error": error
      }
    }
  }
}
