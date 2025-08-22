import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
const crypto = require('node:crypto');
const fs = require('node:fs');
import axios from 'axios';
import { EmrNewLogin } from './entities/emr_new-login.entity';

@Injectable()
export class EmrNewLoginService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
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

  async create(Entity: EmrNewLogin) {

    try {
      const [getHospital_id] = await this.dynamicConnection.query(
        `select hospital_id, staff_id, is_reset_needed, username from hospital_staffs where username = ? and password = ?`,
        [Entity.username, Entity.Password]
      );

      if (!getHospital_id) {
        return {
          status: "failed",
          message: "Enter correct username and password"
        };
      }

      if (getHospital_id.username !== Entity.username) {
        return {
          status: "failed",
          message: "The entered username does not exist or is incorrect."
        };
      }

      const [getHosName] = await this.dynamicConnection.query(
        `select * from hospitals where plenome_id = ?`,
        [getHospital_id.hospital_id]
      );

      const [getAdminStaffEmail] = await this.dynamicConnection.query(
        `select email from staff where id = ?`,
        [getHospital_id.staff_id]
      );

      const [getHospitalStaff_id] = await this.connection.query(
        `select staff.id id, roles.id role_id, roles.name, staff.is_active,
          concat("Dr. ", staff.name, " ", staff.surname) staffName, staff.image
          from staff
          left join staff_roles on staff.id = staff_roles.staff_id
          left join roles on roles.id = staff_roles.role_id
          where staff.email = ? and staff.password = ?`,
        [getAdminStaffEmail.email, Entity.Password]
      );

      if (getHospitalStaff_id.is_active === 1) {
        const resp = {
          "Hospital_id": getHospital_id.hospital_id,
          "Hospital_name": getHosName.hospital_name,
          "Hospital_address": getHosName.address,
          "Hospital_logo": getHosName.logo,
          "Hospital_image": getHosName.image,
          "Staff_id": getHospitalStaff_id.id,
          "staffImage": getHospitalStaff_id.image,
          "username": Entity.username,
          "password": Entity.Password,
          "role_id": getHospitalStaff_id.role_id,
          "staffName": getHospitalStaff_id.staffName,
          "role_name": getHospitalStaff_id.name,
          "resetStatus": getHospital_id.is_reset_needed
        };
        return {
          status: "success",
          message: "Password verified successfully",
          details: resp
        };
      } else {
        return {
          status: "failed",
          message: "Contact admin as you are disabled"
        };
      }

    } catch (error) {
      return { status: "failed", message: error.message };
    }
  }

  // async ForgetPassword(Entity: EmrNewLogin) {

  //   try {
  //     const [getHospital_id] = await this.dynamicConnection.query(
  //       `select hospital_id, staff_id, id, username from hospital_staffs where username = ?`,
  //       [Entity.username]
  //     );
  //     if (!getHospital_id || getHospital_id.username !== Entity.username) {
  //       return {
  //         status: "failed",
  //         message: "The entered username does not exist or is incorrect."
  //       };
  //     }

  //     const [getHosName] = await this.dynamicConnection.query(
  //       `select hospital_name from hospitals where hospitals.plenome_id = ?`,
  //       [getHospital_id.hospital_id]
  //     );
  //     const [getAdminStaffEmail] = await this.dynamicConnection.query(
  //       `select email, staff.name, staff.surname from staff where id = ?`,
  //       [getHospital_id.staff_id]
  //     );

  //     const [getHospitalStaff_id] = await this.connection.query(
  //       `select id from staff where email = ? `,
  //       [getAdminStaffEmail.email]
  //     );
  //     console.log(getHospitalStaff_id, "getHospitalStaff_id");

  //     const Password = this.generateRandomPassword();
  //     await this.dynamicConnection.query(
  //       `update hospital_staffs set password = ?, is_reset_needed = ? where id = ? `,
  //       [Password, 1, getHospital_id.id]
  //     );
  //     await this.connection.query(
  //       `update staff set password = ? where id = ?`,
  //       [Password, getHospitalStaff_id.id]
  //     );
  //     console.log(Password, "Password");

  //     const EmailData = {
  //       email: getAdminStaffEmail.email,
  //       name: `${getAdminStaffEmail.name} ${getAdminStaffEmail.surname}`,
  //       HosName: getHosName.hospital_name,
  //       Password: Password
  //     };

      // try {
      //   const sendEmail = await axios.post(`https://notifications.plenome.com/send-email`, EmailData);

      //   if (sendEmail.status === 200 && sendEmail.data.success) {
      //     return {
      //       status: "success",
      //       message: "Email sent successfully"
      //     };
      //   } else {
      //     return {
      //       status: "failed",
      //       message: "Email API responded, but email not sent",
      //       error: sendEmail.data
      //     };
      //   }
      // } catch (error) {
      //   console.log("Error sending email:", error.message);
      // }
      // return {
      //   status: "success",
      //   message: "Password sent successfully to your Email"
      // };
  //   } catch (error) {
  //     return error;
  //   }
  // }

   async ForgetPassword(Entity: EmrNewLogin) {

    try {
      const [getHospital_id] = await this.dynamicConnection.query(
        `select hospital_id, staff_id, id, username from hospital_staffs where username = ?`,
        [Entity.username]
      );
      if (!getHospital_id || getHospital_id.username !== Entity.username) {
        return {
          status: "failed",
          message: "The entered username does not exist or is incorrect."
        };
      }

      const [getHosName] = await this.dynamicConnection.query(
        `select hospital_name from hospitals where hospitals.plenome_id = ?`,
        [getHospital_id.hospital_id]
      );
      const [getAdminStaffEmail] = await this.dynamicConnection.query(
        `select email, staff.name, staff.surname from staff where id = ?`,
        [getHospital_id.staff_id]
      );

      const [getHospitalStaff_id] = await this.connection.query(
        `select id from staff where email = ? `,
        [getAdminStaffEmail.email]
      );
      console.log(getHospitalStaff_id, "getHospitalStaff_id");

      const Password = this.generateRandomPassword();
      await this.dynamicConnection.query(
        `update hospital_staffs set password = ?, is_reset_needed = ? where id = ? `,
        [Password, 1, getHospital_id.id]
      );
      await this.connection.query(
        `update staff set password = ? where id = ?`,
        [Password, getHospitalStaff_id.id]
      );
      console.log(Password, "Password");

      const EmailData = {
        email: getAdminStaffEmail.email,
        name: `${getAdminStaffEmail.name} ${getAdminStaffEmail.surname}`,
        HosName: getHosName.hospital_name,
        Password: Password
      };

     let emailStatus = "Email not sent";

try {
  const sendEmail = await axios.post(`https://notifications.plenome.com/send-email`, EmailData);

  if (sendEmail.status === 200 && sendEmail.data.success) {
    emailStatus = "Email sent successfully";
  } else {
    emailStatus = "Email API responded, but email not sent";
  }
} catch (error) {
  console.log("Error sending email:", error.message);
  emailStatus = "Email sending failed";
}

return {
  status: "success",
  message: "Password reset successfully",
  emailStatus,
};

    } catch (error) {
      return error;
    }
  }

  async ResetPassword(Entity: EmrNewLogin) {
    const [getHospital_id] = await this.dynamicConnection.query(`select hospital_id,staff_id,id,is_reset_needed from hospital_staffs 
  where username = ?`, [Entity.username])
    console.log(getHospital_id, "getHospital_id");

    try {

      if (getHospital_id) {

        if (getHospital_id.is_reset_needed == 1) {
          const [getAdminStaffEmail] = await this.dynamicConnection.query(`select email from staff where id = ?`, [getHospital_id.staff_id])

          const [getHospitalStaff_id] = await this.connection.query(`select id from staff where email = ? `,
            [getAdminStaffEmail.email])
          const Password = Entity.Password;

          await this.dynamicConnection.query(`update hospital_staffs set password = ?,is_reset_needed = ? where id = ? `,
            [Password,
              0,
              getHospital_id.id])
          await this.connection.query(`update staff set password  = ? where id = ?`, [Password, getHospitalStaff_id.id])
          return {
            status: "success",
            "messege": "Password Changed successfully."
          };

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
    } catch (error) {
      return error
    }


  }


}


