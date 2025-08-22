import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { HumanResourceStaff } from './entities/human_resource_staff.entity';
import { CountDto } from './dto/human_resource_staff.dto';

@Injectable()
export class HumanResourceStaffService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async emailExists(email: string): Promise<boolean> {
    const result = await this.connection.query(
      `SELECT COUNT(*) AS count FROM staff WHERE email = ?`,
      [email],
    );
    return result[0].count > 0;
  }

  async create(StaffEntity: HumanResourceStaff) {
    if (StaffEntity.hospital_id) {
      let Admin = [];
      let hms = [];
      try {
        const [result] = await this.dynamicConnection.query(
          `SELECT id AS count FROM staff WHERE email = ?`,
          [StaffEntity.email],
        );
        if (result) {
          return {
            status: process.env.STAFF_DUPLICATE_STATUS,
            message: process.env.STAFF_DUPLICATE_MESSAGE,
          };
        }
        let numbbeerr;
        if (StaffEntity.contact_no.length <= 10) {
          numbbeerr = '91' + StaffEntity.contact_no;
        }
        const [checkMob] = await this.connection.query(
          `select * from staff where contact_no = ? or contact_no = ?`,
          [StaffEntity.contact_no, numbbeerr],
        );
        if (checkMob) {
          return {
            status: process.env.STAFF_DUPLICATE_STATUS,
            message: process.env.STAFF_DUPLICATE_MOBILE_VALIDATION,
          };
        }
        const [getHosPitalName] = await this.dynamicConnection.query(
          `select hospital_name,plenome_id from hospitals where plenome_id = ?`,
          [StaffEntity.hospital_id],
        );
        const [getlast_id] = await this.connection.query(
          `select id,employee_id from staff order by id desc`,
        );
        let emplast;
        if (getlast_id) {
          emplast = getlast_id.id;
        } else {
          emplast = 0;
        }
        const currentEmp_id = parseInt(emplast) + 1;
        const name = (await getHosPitalName).hospital_name.substring(0, 3);
        let nm = name.toUpperCase();
        const id = getHosPitalName.plenome_id;
        let empNow = nm + id + currentEmp_id;
        const [checkAdminEmp] = await this.dynamicConnection.query(
          `select * from staff where employee_id = ?`,
          [empNow],
        );
        const [checkHmsEmp] = await this.connection.query(
          `select * from staff where employee_id = ?`,
          [empNow],
        );
        if (checkHmsEmp || checkAdminEmp) {
          empNow = nm + id + currentEmp_id + 'A';
        }
        let HRStaff_id;
        const AddHRStaff = await this.connection.query(
          `INSERT INTO staff (
            employee_id,
          lang_id,
          department_id,
          staff_designation_id,
          specialist,
          qualification,
          work_exp,
          specialization,
          name,
          surname,
          father_name,
          mother_name,
          contact_no,
          emergency_contact_no,
          email,
          dob,
          marital_status,
          date_of_joining,
          date_of_leaving,
          local_address,
          permanent_address,
          note,
          image,
          password,
          gender,
          blood_group,
          account_title,
          bank_account_no,
          bank_name,
          ifsc_code,
          bank_branch,
          payscale,
          basic_salary,
          epf_no,
          contract_type,
          shift,
          location,
          facebook,
          twitter,
          linkedin,
          instagram,
          resume,
          joining_letter,
          resignation_letter,
          other_document_name,
          other_document_file,
          user_id,
          is_active,
          verification_code,
          zoom_api_key,
          zoom_api_secret,
          pan_number,
          identification_number,
          local_identification_number,
          Health_Professional_Registry,
          languagesKnown
          ) VALUES
         (?,?,?,?,?,?,?,?,?,?,?,?
          ,?,?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,?,?
          ,?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,?)`,
          [
            empNow,
            StaffEntity.lang_id,
            StaffEntity.department_id,
            StaffEntity.staff_designation_id,
            StaffEntity.specialist,
            StaffEntity.qualification,
            StaffEntity.work_exp,
            StaffEntity.specialization,
            StaffEntity.name,
            StaffEntity.surname,
            StaffEntity.father_name,
            StaffEntity.mother_name,
            StaffEntity.contact_no,
            StaffEntity.emergency_contact_no,
            StaffEntity.email,
            StaffEntity.dob,
            StaffEntity.marital_status,
            StaffEntity.date_of_joining,
            StaffEntity.date_of_leaving,
            StaffEntity.local_address,
            StaffEntity.permanent_address,
            StaffEntity.note,
            StaffEntity.image,
            StaffEntity.password,
            StaffEntity.gender,
            StaffEntity.blood_group,
            StaffEntity.account_title,
            StaffEntity.bank_account_no,
            StaffEntity.bank_name,
            StaffEntity.ifsc_code,
            StaffEntity.bank_branch,
            StaffEntity.payscale,
            StaffEntity.basic_salary,
            StaffEntity.epf_no,
            StaffEntity.contract_type,
            StaffEntity.shift,
            StaffEntity.location,
            StaffEntity.facebook,
            StaffEntity.twitter,
            StaffEntity.linkedin,
            StaffEntity.instagram,
            StaffEntity.resume,
            StaffEntity.joining_letter,
            StaffEntity.resignation_letter,
            StaffEntity.other_document_name,
            StaffEntity.other_document_file,
            StaffEntity.user_id,
            StaffEntity.is_active,
            StaffEntity.verification_code,
            StaffEntity.zoom_api_key,
            StaffEntity.zoom_api_secret,
            StaffEntity.pan_number,
            StaffEntity.identification_number,
            StaffEntity.local_identification_number,
            StaffEntity.Health_Professional_Registry,
            StaffEntity.languagesKnown,
          ],
        );
        HRStaff_id = AddHRStaff.insertId;
        if (HRStaff_id) {
          hms.push({ staff: HRStaff_id });
        }
        let staff_roles_id;
        try {
          const createRoles = await this.connection.query(
            `INSERT INTO staff_roles (role_id, staff_id, is_active) VALUES (?, ?, ?)`,
            [StaffEntity.role_id, AddHRStaff.insertId, StaffEntity.is_active],
          );
          staff_roles_id = createRoles.insertId;
          if (staff_roles_id) {
            hms.push({ staffRole: staff_roles_id });
          }
        } catch (error) {
          console.error('Error inserting data:', error);
        }
        if (StaffEntity.certificates) {
          let cert = await JSON.parse(JSON.stringify(StaffEntity.certificates));
          cert.forEach(async (file) => {
            await this.connection.query(
              `INSERT INTO staff_certifications (certificate_name,issued_year, staff_id, document) VALUES (?, ?, ?,?)`,
              [file.fileName, file.date, HRStaff_id, file.fileType],
            );
          });
        }
        // #-----------------------------------------------------------------------#

        let HRDynamicStaffid;

        try {
          const dynbloodgroup = StaffEntity.blood_group;
          const getdepartment = await this.dynamicConnection.query(
            'SELECT id FROM department WHERE hospital_department_id = ? and Hospital_id = ?',
            [StaffEntity.department_id, StaffEntity.hospital_id],
          );
          const dyndepartment = getdepartment[0].id;
          const getdesignation = await this.dynamicConnection.query(
            'SELECT id FROM staff_designation WHERE hospital_staff_designation_id = ? and Hospital_id = ?',
            [StaffEntity.staff_designation_id, StaffEntity.hospital_id],
          );
          const dyndesignation = getdesignation[0].id;

          const specialistIds = JSON.parse(StaffEntity.specialist);
          const dynspecialistArray = [];

          for (const specialistId of specialistIds) {
            const getspecialist = await this.dynamicConnection.query(
              'SELECT id FROM specialist WHERE hospital_specialist_id = ? and Hospital_id = ?',
              [specialistId, StaffEntity.hospital_id],
            );
            const dynspecialistRows = getspecialist.map((row) => row.id);
            for (const specialistId of dynspecialistRows) {
              const specialistData = await this.dynamicConnection.query(
                'SELECT * FROM specialist WHERE id = ?',
                [specialistId],
              );
              dynspecialistArray.push(specialistData[0].id);
            }
          }
          try {
            const AddDynamicHRStaff = await this.dynamicConnection.query(
              `INSERT INTO staff (
      employee_id,
lang_id,
department_id,
staff_designation_id,
specialist,
qualification,
work_exp,
specialization,
name,
surname,
father_name,
mother_name,
contact_no,
emergency_contact_no,
email,
dob,
marital_status,
date_of_joining,
date_of_leaving,
local_address,
permanent_address,
note,
image,
gender,
blood_group,
account_title,
bank_account_no,
bank_name,
ifsc_code,
bank_branch,
payscale,
basic_salary,
epf_no,
contract_type,
shift,
location,
facebook,
twitter,
linkedin,
instagram,
resume,
joining_letter,
resignation_letter,
other_document_name,
other_document_file,
user_id,
is_active,
verification_code,
zoom_api_key,
zoom_api_secret,
pan_number,
identification_number,
local_identification_number,
Health_Professional_Registry,
languagesKnown
) VALUES
(?,?,?,?,?,?,?,?,?,?,?,?
,?,?,?,?,?,?,?,?,?,?,?,
?,?,?,?,?,?,?,?,?,?,?,?
,?,?,?,?,?,?,?,?,?,?,
?,?,?,?,?,?,?,?,?,?)`,
              [
                empNow,
                StaffEntity.lang_id,
                dyndepartment,
                dyndesignation,
                JSON.stringify(dynspecialistArray),
                StaffEntity.qualification,
                StaffEntity.work_exp,
                StaffEntity.specialization,
                StaffEntity.name,
                StaffEntity.surname,
                StaffEntity.father_name,
                StaffEntity.mother_name,
                StaffEntity.contact_no,
                StaffEntity.emergency_contact_no,
                StaffEntity.email,
                StaffEntity.dob,
                StaffEntity.marital_status,
                StaffEntity.date_of_joining,
                StaffEntity.date_of_leaving,
                StaffEntity.local_address,
                StaffEntity.permanent_address,
                StaffEntity.note,
                StaffEntity.image,
                StaffEntity.gender,
                dynbloodgroup,
                StaffEntity.account_title,
                StaffEntity.bank_account_no,
                StaffEntity.bank_name,
                StaffEntity.ifsc_code,
                StaffEntity.bank_branch,
                StaffEntity.payscale,
                StaffEntity.basic_salary,
                StaffEntity.epf_no,
                StaffEntity.contract_type,
                StaffEntity.shift,
                StaffEntity.location,
                StaffEntity.facebook,
                StaffEntity.twitter,
                StaffEntity.linkedin,
                StaffEntity.instagram,
                StaffEntity.resume,
                StaffEntity.joining_letter,
                StaffEntity.resignation_letter,
                StaffEntity.other_document_name,
                StaffEntity.other_document_file,
                StaffEntity.user_id,
                StaffEntity.is_active,
                StaffEntity.verification_code,
                StaffEntity.zoom_api_key,
                StaffEntity.zoom_api_secret,
                StaffEntity.pan_number,
                StaffEntity.identification_number,
                StaffEntity.local_identification_number,
                StaffEntity.Health_Professional_Registry,
                StaffEntity.languagesKnown,
              ],
            );

            HRDynamicStaffid = AddDynamicHRStaff.insertId;
            if (HRDynamicStaffid) {
              Admin.push({ staff: HRDynamicStaffid });
            }
          } catch (error) {
            console.log(error, 'error in addin dunamic staff');
          }
        } catch (error) {
          console.error('Error inserting dynamic staff data:', error);
        }
        let staff_dynamic_hospital_staff_id;
        const [HOSStaff] = await this.dynamicConnection.query(
          'select * from hospital_staffs where hospital_id = ? AND staff_id = ?',
          [StaffEntity.hospital_id, HRDynamicStaffid],
        );
        if (!HOSStaff) {
          const createDynamicHospitalStaff = await this.dynamicConnection.query(
            `INSERT INTO hospital_staffs (hospital_id, staff_id,username,password) VALUES (?,?,?,?)`,
            [
              StaffEntity.hospital_id,
              HRDynamicStaffid,
              StaffEntity.email,
              StaffEntity.password,
            ],
          );
          staff_dynamic_hospital_staff_id = createDynamicHospitalStaff.insertId;
          if (staff_dynamic_hospital_staff_id) {
            Admin.push({ hospitalStaff: staff_dynamic_hospital_staff_id });
          }
        }
        let staff_dynamic_roles_id;
        const createDynamicRoles = await this.dynamicConnection.query(
          `INSERT INTO staff_roles (role_id, staff_id, hos_staff_role_id,hospital_id) VALUES (?, ?, ?, ?)`,
          [
            StaffEntity.role_id,
            HRDynamicStaffid,
            staff_roles_id,
            StaffEntity.hospital_id,
          ],
        );
        staff_dynamic_roles_id = createDynamicRoles.insertId;
        if (staff_dynamic_roles_id) {
          Admin.push({ sstaffRole: staff_dynamic_roles_id });
        }
        if (StaffEntity.certificates) {
          let cert1 = await JSON.parse(
            JSON.stringify(StaffEntity.certificates),
          );
          for (const file of cert1) {
            console.log(
              file.fileName,
              file.date,
              HRDynamicStaffid,
              file.fileType,
            );

            await this.dynamicConnection.query(
              `INSERT INTO staff_certifications (certificate_name, issued_year, staff_id, document) VALUES (?, ?, ?, ?)`,
              [file.fileName, file.date, HRDynamicStaffid, file.fileType],
            );
          }
        }
        let hosStaffLeaveDetailsID;

        const leaveTypes = Array.isArray(StaffEntity?.leave_types)
          ? StaffEntity.leave_types
          : [];

        if (leaveTypes.length === 0) {
          console.warn('No leave types found for the staff entity.');
        }

        for (const leaveType of leaveTypes) {
          console.log(leaveType, 'leaveType');
          try {
            const hosStaffLeaveDetails = await this.connection.query(
              `INSERT INTO staff_leave_details (staff_id, leave_type_id, alloted_leave) VALUES (?, ?, ?)`,
              [HRStaff_id, leaveType.leave_type_id, leaveType.alloted_leave],
            );
            hosStaffLeaveDetailsID = hosStaffLeaveDetails.insertId;
            if (leaveTypes) {
              const getAdminLeaveTypeID = await this.dynamicConnection.query(
                `SELECT id from leave_types where hospital_leave_types_id= ? and Hospital_id = ?`,
                [leaveType.leave_type_id, StaffEntity.hospital_id],
              );
              const getAdminLeaveTypeIDD = getAdminLeaveTypeID[0].id;

              await this.dynamicConnection.query(
                `INSERT INTO staff_leave_details (staff_id, leave_type_id, alloted_leave, hospital_id, hos_staff_leave_details_id) VALUES (?, ?, ?, ?, ?)`,
                [
                  HRDynamicStaffid,
                  getAdminLeaveTypeIDD,
                  leaveType.alloted_leave,
                  StaffEntity.hospital_id,
                  hosStaffLeaveDetailsID,
                ],
              );
            }
          } catch (error) {
            console.error('Error inserting leave details:', error);
          }
        }

        const [getHosName] = await this.dynamicConnection.query(
          `select * from hospitals where plenome_id = ?`,
          [StaffEntity.hospital_id],
        );
        const HosName = await getHosName.hospital_name;
        const [staffDetails] = await this.connection.query(
          'SELECT *,concat("Dr. ",staff.name," ",staff.surname) doctorName FROM staff WHERE id = ?',
          [HRStaff_id],
        );
        const staffMobile = await staffDetails.contact_no;
        const staffname = await staffDetails.doctorName;
        const staffEmail = await staffDetails.email;
        const [getuserpass] = await this.dynamicConnection.query(
          `select * from hospital_staffs where hospital_id = ? and staff_id = ?`,
          [StaffEntity.hospital_id, HRDynamicStaffid],
        );
        const hosstaffusername = await getuserpass.username;
        const hosstaffPassword = await getuserpass.password;
        const staffDataForSMS = {
          mobileNumber: '91' + staffMobile,
          patname: ' ' + staffname,
          Hospital: ' ' + HosName,
        };
        const staffemailData = {
          email: staffEmail,
          name: ' ' + staffname,
          HosName: ' ' + HosName,
          Username: ' ' + hosstaffusername,
          Password: ' ' + hosstaffPassword,
        };
        const smsResponse = await axios.post(
          'https://notifications.plenome.com/staff-onboard',
          staffDataForSMS,
        );
        const emailResponse = await axios.post(
          'https://notifications.plenome.com/email-staff-onboarding-information',
          staffemailData,
        );
        return [
          {
            data: {
              status: process.env.SUCCESS_STATUS,
              messege: process.env.STAFF_SUCCESS_MESSAGE,
              Added_Staff_Values: await this.connection.query(
                'SELECT * FROM staff WHERE id = ?',
                [HRStaff_id],
              ),
            },
          },
        ];
      } catch (error) {
        Admin.forEach((obj) => {
          if (obj.hasOwnProperty('sstaffRole')) {
            this.dynamicConnection.query(
              `delete from staff_roles where id = ?`,
              [obj.sstaffRole],
            );
          }
        });

        Admin.forEach((obj) => {
          if (obj.hasOwnProperty('hospitalStaff')) {
            this.dynamicConnection.query(
              `delete from hospital_staffs where id = ?`,
              [obj.hospitalStaff],
            );
          }
        });

        Admin.forEach((obj) => {
          if (obj.hasOwnProperty('staff')) {
            this.dynamicConnection.query(`delete from staff where id = ?`, [
              obj.staff,
            ]);
          }
        });
        hms.forEach((obj) => {
          if (obj.hasOwnProperty('staffRole')) {
            this.connection.query(`delete from staff_roles where id = ?`, [
              obj.staffRole,
            ]);
          }
        });

        hms.forEach((obj) => {
          if (obj.hasOwnProperty('staff')) {
            this.connection.query(`delete from staff where id = ?`, [
              obj.staff,
            ]);
          }
        });
        console.error('Error while posting data:', error);

        return error;
      }
    } else {
      return {
        status: process.env.STAFF_DUPLICATE_STATUS,
        message: process.env.STAFF_ERROR_MESSAGE,
      };
    }
  }

  async findAll(): Promise<HumanResourceStaff[]> {
    const getStaffDetails = await this.connection
      .query(`SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,staff_roles.role_id AS StaffRoleID,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
  LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
  LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
  LEFT JOIN department ON staff.department_id = department.id
  WHERE staff.is_active = 1
  group by staff.id,staff.employee_id,staffname,StaffRoleID,role_name,designation,contact_no,department_name`);
    return getStaffDetails;
  }

  async findOne(id: string): Promise<HumanResourceStaff | null> {
    const getStaffByID = await this.connection.query(
      `SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
  LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
  LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
  LEFT JOIN department ON staff.department_id = department.id WHERE staff.id = ? and staff.is_active = 1
  group by staff.id,staff.employee_id,staffname,role_name,designation,contact_no,department_name `,
      [id],
    );

    if (getStaffByID.length === 1) {
      return getStaffByID;
    } else {
      return null;
    }
  }

  async findByRole(id: number): Promise<HumanResourceStaff | null> {
    const getStaffByRoleName = await this.connection.query(
      `SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
  LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
  LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
  LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.role_id = ? and staff.is_active = 1
  group by staff.id,staff.employee_id,staffname,role_name,designation,contact_no,department_name `,
      [id],
    );
    return getStaffByRoleName;
  }

  async update(id: number, StaffEntity: HumanResourceStaff) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const email = staffId.email;

      let numbbeerr;
      if (StaffEntity.contact_no.length <= 10) {
        numbbeerr = '91' + StaffEntity.contact_no;
      }
      const [checkMob] = await this.connection.query(
        `select * from staff where contact_no = ? or contact_no = ?`,
        [StaffEntity.contact_no, numbbeerr],
      );
      if (checkMob && checkMob?.id != id) {
        return {
          status: process.env.STAFF_DUPLICATE_STATUS,
          message: process.env.STAFF_DUPLICATE_MOBILE_VALIDATION,
        };
      }

      await this.connection.query(
        `update staff SET
   employee_id=?,
  lang_id=?,
  department_id=?,
  staff_designation_id=?,
  specialist=?,
  qualification=?,
  work_exp=?,
  specialization=?,
  name=?,
  surname=?,
  father_name=?,
  mother_name=?,
  contact_no=?,
  emergency_contact_no=?,
  dob=?,
  marital_status=?,
  date_of_joining=?,
  date_of_leaving=?,
  local_address=?,
  permanent_address=?,
  note=?,
  image=?,
  gender=?,
  blood_group=?,
  account_title=?,
  bank_account_no=?,
  bank_name=?,
  ifsc_code=?,
  bank_branch=?,
  payscale=?,
  basic_salary=?,
  epf_no=?,
  contract_type=?,
  shift=?,
  location=?,
  facebook=?,
  twitter=?,
  linkedin=?,
  instagram=?,
  resume=?,
  joining_letter=?,
  resignation_letter=?,
  other_document_name=?,
  other_document_file=?,
  user_id=?,
  is_active=?,
  verification_code=?,
  zoom_api_key=?,
  zoom_api_secret=?,
  pan_number=?,
  identification_number=?,
  local_identification_number=?,
  Health_Professional_Registry=?,
  languagesKnown=?
  where id=?`,
        [
          StaffEntity.employee_id,
          StaffEntity.lang_id,
          StaffEntity.department_id,
          StaffEntity.staff_designation_id,
          StaffEntity.specialist,
          StaffEntity.qualification,
          StaffEntity.work_exp,
          StaffEntity.specialization,
          StaffEntity.name,
          StaffEntity.surname,
          StaffEntity.father_name,
          StaffEntity.mother_name,
          StaffEntity.contact_no,
          StaffEntity.emergency_contact_no,
          StaffEntity.dob,
          StaffEntity.marital_status,
          StaffEntity.date_of_joining,
          StaffEntity.date_of_leaving,
          StaffEntity.local_address,
          StaffEntity.permanent_address,
          StaffEntity.note,
          StaffEntity.image,
          StaffEntity.gender,
          StaffEntity.blood_group,
          StaffEntity.account_title,
          StaffEntity.bank_account_no,
          StaffEntity.bank_name,
          StaffEntity.ifsc_code,
          StaffEntity.bank_branch,
          StaffEntity.payscale,
          StaffEntity.basic_salary,
          StaffEntity.epf_no,
          StaffEntity.contract_type,
          StaffEntity.shift,
          StaffEntity.location,
          StaffEntity.facebook,
          StaffEntity.twitter,
          StaffEntity.linkedin,
          StaffEntity.instagram,
          StaffEntity.resume,
          StaffEntity.joining_letter,
          StaffEntity.resignation_letter,
          StaffEntity.other_document_name,
          StaffEntity.other_document_file,
          StaffEntity.user_id,
          StaffEntity.is_active,
          StaffEntity.verification_code,
          StaffEntity.zoom_api_key,
          StaffEntity.zoom_api_secret,
          StaffEntity.pan_number,
          StaffEntity.identification_number,
          StaffEntity.local_identification_number,
          StaffEntity.Health_Professional_Registry,
          StaffEntity.languagesKnown,
          id,
        ],
      );
      const leaveTypes = StaffEntity.leave_types;
      let hosstaffleavedetailsid;
      if (leaveTypes) {
        for (const leaveType of leaveTypes) {
          try {
            const [existingRecord] = await this.connection.query(
              `SELECT id FROM staff_leave_details WHERE staff_id = ? AND leave_type_id = ?`,
              [id, leaveType.leave_type_id],
            );
            if (existingRecord) {
              await this.connection.query(
                `UPDATE staff_leave_details 
         SET alloted_leave = ? 
         WHERE staff_id = ? AND leave_type_id = ?`,
                [leaveType.alloted_leave, id, leaveType.leave_type_id],
              );
            } else {
              const insertleaveDetails = await this.connection.query(
                `INSERT INTO staff_leave_details (staff_id, leave_type_id, alloted_leave) 
         VALUES (?, ?, ?)`,
                [id, leaveType.leave_type_id, leaveType.alloted_leave],
              );
              hosstaffleavedetailsid = insertleaveDetails.insertId;
            }
          } catch (error) {
            console.error('Error processing leave details:', error);
          }
        }
      }

      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [email],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      await this.dynamicConnection.query(
        'SELECT id FROM blood_bank_products WHERE hospital_blood_bank_products_id = ? and Hospital_id = ?',
        [StaffEntity.blood_group, StaffEntity.hospital_id],
      );
      const uptdynbloodgroup = StaffEntity.blood_group;
      const uptgetdepartment = await this.dynamicConnection.query(
        'SELECT id FROM department WHERE hospital_department_id = ? and Hospital_id = ?',
        [StaffEntity.department_id, StaffEntity.hospital_id],
      );
      const uptdyndepartment = uptgetdepartment[0].id;
      const uptgetdesignation = await this.dynamicConnection.query(
        'SELECT id FROM staff_designation WHERE hospital_staff_designation_id = ? and Hospital_id = ?',
        [StaffEntity.staff_designation_id, StaffEntity.hospital_id],
      );
      const uptdyndesignation = uptgetdesignation[0].id;
      const specialistIds = JSON.parse(StaffEntity.specialist);
      const dynspecialistArray = [];
      for (const specialistId of specialistIds) {
        const getspecialist = await this.dynamicConnection.query(
          'SELECT id FROM specialist WHERE hospital_specialist_id = ? and Hospital_id = ?',
          [specialistId, StaffEntity.hospital_id],
        );
        const dynspecialistRows = getspecialist.map((row) => row.id);
        for (const specialistId of dynspecialistRows) {
          const specialistData = await this.dynamicConnection.query(
            'SELECT * FROM specialist WHERE id = ?',
            [specialistId],
          );
          dynspecialistArray.push(specialistData[0].id);
        }
      }

      await this.dynamicConnection.query(
        `update staff SET
employee_id=?,
lang_id=?,
department_id=?,
staff_designation_id=?,
specialist=?,
qualification=?,
work_exp=?,
specialization=?,
name=?,
surname=?,
father_name=?,
mother_name=?,
contact_no=?,
emergency_contact_no=?,
dob=?,
marital_status=?,
date_of_joining=?,
date_of_leaving=?,
local_address=?,
permanent_address=?,
note=?,
image=?,
gender=?,
blood_group=?,
account_title=?,
bank_account_no=?,
bank_name=?,
ifsc_code=?,
bank_branch=?,
payscale=?,
basic_salary=?,
epf_no=?,
contract_type=?,
shift=?,
location=?,
facebook=?,
twitter=?,
linkedin=?,
instagram=?,
resume=?,
joining_letter=?,
resignation_letter=?,
other_document_name=?,
other_document_file=?,
user_id=?,is_active=?,
verification_code=?,
zoom_api_key=?,
zoom_api_secret=?,
pan_number=?,
identification_number=?,
local_identification_number=?,
Health_Professional_Registry=?,
languagesKnown=?
where id=?`,
        [
          StaffEntity.employee_id,
          StaffEntity.lang_id,
          uptdyndepartment,
          uptdyndesignation,
          JSON.stringify(dynspecialistArray),
          StaffEntity.qualification,
          StaffEntity.work_exp,
          StaffEntity.specialization,
          StaffEntity.name,
          StaffEntity.surname,
          StaffEntity.father_name,
          StaffEntity.mother_name,
          StaffEntity.contact_no,
          StaffEntity.emergency_contact_no,
          StaffEntity.dob,
          StaffEntity.marital_status,
          StaffEntity.date_of_joining,
          StaffEntity.date_of_leaving,
          StaffEntity.local_address,
          StaffEntity.permanent_address,
          StaffEntity.note,
          StaffEntity.image,
          StaffEntity.gender,
          uptdynbloodgroup,
          StaffEntity.account_title,
          StaffEntity.bank_account_no,
          StaffEntity.bank_name,
          StaffEntity.ifsc_code,
          StaffEntity.bank_branch,
          StaffEntity.payscale,
          StaffEntity.basic_salary,
          StaffEntity.epf_no,
          StaffEntity.contract_type,
          StaffEntity.shift,
          StaffEntity.location,
          StaffEntity.facebook,
          StaffEntity.twitter,
          StaffEntity.linkedin,
          StaffEntity.instagram,
          StaffEntity.resume,
          StaffEntity.joining_letter,
          StaffEntity.resignation_letter,
          StaffEntity.other_document_name,
          StaffEntity.other_document_file,
          StaffEntity.user_id,
          StaffEntity.is_active,
          StaffEntity.verification_code,
          StaffEntity.zoom_api_key,
          StaffEntity.zoom_api_secret,
          StaffEntity.pan_number,
          StaffEntity.identification_number,
          StaffEntity.local_identification_number,
          StaffEntity.Health_Professional_Registry,
          StaffEntity.languagesKnown,
          dynamicUPTDStaffId,
        ],
      );

      if (leaveTypes) {
        for (const leaveType of leaveTypes) {
          try {
            const [getdynleaveType] = await this.dynamicConnection.query(
              'SELECT id FROM leave_types WHERE hospital_leave_types_id = ? and Hospital_id = ?',
              [leaveType.leave_type_id, StaffEntity.hospital_id],
            );
            const dynLeaveTypeid = getdynleaveType.id;
            const [existingRecord] = await this.dynamicConnection.query(
              `SELECT id FROM staff_leave_details WHERE staff_id = ? AND leave_type_id = ?`,
              [dynamicUPTDStaffId, dynLeaveTypeid],
            );

            if (existingRecord) {
              await this.dynamicConnection.query(
                `UPDATE staff_leave_details 
               SET alloted_leave = ? 
               WHERE staff_id = ? AND leave_type_id = ?`,
                [leaveType.alloted_leave, dynamicUPTDStaffId, dynLeaveTypeid],
              );
            } else {
              const insertleaveDetails = await this.dynamicConnection.query(
                `INSERT INTO staff_leave_details (staff_id, leave_type_id, alloted_leave,hospital_id,hos_staff_leave_details_id) 
               VALUES (?, ?, ?, ?, ?)`,
                [
                  dynamicUPTDStaffId,
                  dynLeaveTypeid,
                  leaveType.alloted_leave,
                  StaffEntity.hospital_id,
                  hosstaffleavedetailsid,
                ],
              );
              hosstaffleavedetailsid = insertleaveDetails.insertId;
            }
          } catch (error) {
            console.error('Error processing leave details:', error);
          }
        }
      }

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.STAFF_UPDATE_SUCCESS_MESSAGE,
            updated_values: await this.connection.query(
              'SELECT * FROM staff WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async disableStaff(
    id: number,
  ): Promise<{ status: string; message: string } | Error> {
    try {
      const staffMember = await this.connection.query(
        'select * from staff where id = ?',
        [id],
      );
      if (!staffMember || staffMember.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const email = staffMember[0].email;
      if (!staffMember) {
        throw new Error(process.env.STAFF_MEMBER_NOT_FOUND);
      }

      await this.connection.query(
        `update staff set is_active = ? where id = ?`,
        [0, id],
      );

      await this.connection.query(
        `update staff_roles set is_active = ? where staff_id = ?`,
        [0, id],
      );

      const dynamicStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [email],
      );
      if (!dynamicStaff || dynamicStaff.length === 0) {
        throw new Error(
          `${process.env.STAFF_WITH_EMAIL} ${email} ${process.env.NOT_FOUND_IN_DYNAMIC_DATABASE}`,
        );
      }
      const dynamicStaffId = dynamicStaff[0].id;

      await this.dynamicConnection.query(
        `update staff set is_active = ? where id = ?`,
        [0, dynamicStaffId],
      );

      await this.dynamicConnection.query(
        `update staff_roles set is_active = ? where staff_id = ?`,
        [0, dynamicStaffId],
      );

      return {
        status: process.env.SUCCESS_STATUS,
        message: `${process.env.VALIDATION_STAFF} ${id} ${process.env.HAS_BEEN_DISABLED}`,
      };
    } catch (error) {
      return error;
    }
  }

  async enableStaff(
    id: number,
  ): Promise<{ status: string; message: string } | Error> {
    try {
      const enablestaffMember = await this.connection.query(
        'select * from staff where id = ?',
        [id],
      );
      if (!enablestaffMember || enablestaffMember.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const email = enablestaffMember[0].email;
      if (!enablestaffMember) {
        throw new Error(process.env.STAFF_MEMBER_NOT_FOUND);
      }
      await this.connection.query(
        `update staff set is_active = ? where id = ?`,
        [1, id],
      );

      await this.connection.query(
        `update staff_roles set is_active = ? where staff_id = ?`,
        [1, id],
      );

      const dynamicStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [email],
      );
      if (!dynamicStaff || dynamicStaff.length === 0) {
        throw new Error(
          `${process.env.STAFF_WITH_EMAIL} ${email} ${process.env.NOT_FOUND_IN_DYNAMIC_DATABASE}`,
        );
      }
      const dynamicStaffId = dynamicStaff[0].id;
      await this.dynamicConnection.query(
        `update staff set is_active = ? where id = ?`,
        [1, dynamicStaffId],
      );

      await this.dynamicConnection.query(
        `update staff_roles set is_active = ? where staff_id = ?`,
        [1, dynamicStaffId],
      );

      return {
        status: process.env.SUCCESS_STATUS,
        message: `${process.env.VALIDATION_STAFF} ${id} ${process.env.HAS_BEEN_ENABLED}`,
      };
    } catch (error) {
      return error;
    }
  }

  async remove(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const staff = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [id],
      );
      if (!staff || staff.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const email = staff[0].email;
      const [getStaff_rolesId_from_hos] = await this.connection.query(
        `select id from staff_roles where staff_id = ?`,
        [id],
      );
      let hos_staff_role_id = getStaff_rolesId_from_hos.id;
      await this.connection.query(
        'DELETE FROM staff_roles WHERE staff_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM staff_leave_details WHERE staff_id = ?',
        [id],
      );
      await this.connection.query('DELETE FROM staff WHERE id = ?', [id]);
      const dynamicStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [email],
      );
      if (!dynamicStaff || dynamicStaff.length === 0) {
        throw new Error(
          `${process.env.STAFF_WITH_EMAIL} ${email} ${process.env.NOT_FOUND_IN_DYNAMIC_DATABASE}`,
        );
      }
      const dynamicStaffId = dynamicStaff[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM hospital_staffs WHERE staff_id = ? AND hospital_id = ?',
        [dynamicStaffId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM staff_roles WHERE hos_staff_role_id = ? AND hospital_id = ?',
        [hos_staff_role_id, hospital_id],
      );
      await this.dynamicConnection.query(
        `
    update staff set is_deleted = ? where id = ?
    `,
        [1, dynamicStaffId],
      );

      await this.dynamicConnection.query(
        'DELETE FROM staff_leave_details WHERE staff_id = ? AND hospital_id = ?',
        [dynamicStaffId, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.VALIDATION_STAFF} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      return error;
    }
  }

  async findByStaffIdNameRole(search: string): Promise<HumanResourceStaff[]> {
    let query = `
      SELECT 
        staff.*, 
        staff.id,
        staff.employee_id,
        CONCAT(staff.name, ' ', staff.surname) AS staffname,
        roles.name AS role_name,
        staff_designation.designation,
        staff.contact_no,
        department.department_name,
        GROUP_CONCAT(DISTINCT specialist.specialist_name) AS specialists,
        GROUP_CONCAT(DISTINCT languages.language) AS languagesknown 
      FROM staff
      LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
      LEFT JOIN roles ON staff_roles.role_id = roles.id
      LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
      LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
      LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
      LEFT JOIN department ON staff.department_id = department.id
    `;
    let values = [];
    if (search) {
      query += `
        WHERE 
          (staff.id LIKE ? 
          OR CONCAT(staff.name, ' ', staff.surname) LIKE ? 
          OR staff.name LIKE ? 
          OR staff.surname LIKE ? 
          OR roles.name LIKE ? 
          OR staff.employee_id LIKE ?) 
          AND staff.is_active = 1 
      `;
      const searchPattern = '%' + search + '%';
      values.push(searchPattern);
      values.push(searchPattern);
      values.push(searchPattern);
      values.push(searchPattern);
      values.push(searchPattern);
      values.push(searchPattern);
    }
    let last = ` GROUP BY staff.id, staff.employee_id, staffname, role_name, designation, contact_no, department_name`;
    let final = query + last;
    const staffSearch = await this.connection.query(final, values);
    return staffSearch;
  }

  async updateStaffPassword(id: number, StaffEntity: HumanResourceStaff) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [id],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const email = staffId.email;
      const updatePrimaryPassword = await this.connection.query(
        'UPDATE staff SET password = ? WHERE id = ?',
        [StaffEntity.password, id],
      );

      const [dynamicStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [email],
      );
      if (!dynamicStaff || dynamicStaff.length === 0) {
        throw new Error(
          `${process.env.STAFF_WITH_EMAIL} ${email} ${process.env.NOT_FOUND_IN_DYNAMIC_DATABASE}`,
        );
      }
      const dynamicStaffId = dynamicStaff.id;
      const [dynhosstaffid] = await this.dynamicConnection.query(
        'SELECT id FROM hospital_staffs WHERE hospital_id = ? and staff_id = ?',
        [StaffEntity.hospital_id, dynamicStaffId],
      );

      const hospitalsstaffidd = dynhosstaffid.id;
      console.log(dynhosstaffid, 'hospitalsstaffidd');

      const updateDynamichospitalStaffPassword =
        await this.dynamicConnection.query(
          'UPDATE hospital_staffs SET password = ? WHERE id = ?',
          [StaffEntity.password, hospitalsstaffidd],
        );
      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS,
            message: process.env.STAFF_PASSWORD_MESSAGE,
            updated_values: {
              primary_database: updatePrimaryPassword,
              dynamic_hos_staff_database: updateDynamichospitalStaffPassword,
            },
          },
        },
      ];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async findAllDisableStaff(): Promise<HumanResourceStaff[]> {
    const getDisabledStaffDetails = await this.connection
      .query(`SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,staff_roles.role_id AS StaffRoleID,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
  LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
  LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
  LEFT JOIN department ON staff.department_id = department.id
  WHERE staff_roles.is_active = 0
  group by staff.id,staff.employee_id,staffname,StaffRoleID,role_name,designation,contact_no,department_name`);
    return getDisabledStaffDetails;
  }

  async findByDisabledStaffRole(
    id: number,
  ): Promise<HumanResourceStaff | null> {
    const getDisabledStaffByRoleName = await this.connection.query(
      `SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
  LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
  LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
  LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.role_id = ? and staff_roles.is_active = 0
  group by staff.id,staff.employee_id,staffname,role_name,designation,contact_no,department_name `,
      [id],
    );
    return getDisabledStaffByRoleName;
  }

  async findByDisabledStaffIdNameRole(
    search: string,
  ): Promise<HumanResourceStaff[]> {
    let query = `SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
    LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
    LEFT JOIN department ON staff.department_id = department.id
  `;
    let values = [];

    if (search) {
      query += `WHERE (staff.id LIKE ? OR staff.name LIKE ? OR roles.name LIKE ? OR staff.employee_id LIKE ?) AND staff_roles.is_active = 0 `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let last = `group by staff.id,staff.employee_id,staffname,role_name,designation,contact_no,department_name`;

    let final = query + last;
    const disabledStaffSearch = await this.connection.query(final, values);
    return disabledStaffSearch;
  }

  async findAllStaff(limit: number, page: number): Promise<CountDto> {
    const offset = limit * (page - 1);

    const staff_list = await this.connection.query(
      `SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,staff_roles.role_id AS StaffRoleID,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
   LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
   LEFT JOIN roles ON staff_roles.role_id = roles.id
   LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
   LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
   LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
   LEFT JOIN department ON staff.department_id = department.id
   WHERE staff_roles.is_active = 1
   group by staff.id,staff.employee_id,staffname,StaffRoleID,role_name,designation,contact_no,department_name LIMIT ? OFFSET ? `,
      [Number(limit), Number(offset)],
    );

    try {
      let [total_list] = await this.connection.query(
        `SELECT count(id) as total FROM staff WHERE staff_roles.is_active = 1`,
      );

      let out = {
        details: staff_list,
        total: total_list.total,
      };
      return out;
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

  async findAllStaffsearch(
    search: string,
    limit: number,
    page: number,
    role_id?: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      let baseQuery = `
       SELECT 
      staff.*,
      CONCAT(staff.name, ' ', staff.surname) AS staffname,
      roles.name AS role_name,
      staff_designation.designation,
      staff.contact_no,
      department.department_name,
      staff_roles.role_id
    FROM staff
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.is_active = 1`;

      let countQuery = `
      SELECT COUNT(staff.id) AS total 
      FROM staff 
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.is_active = 1 `;

      if (search) {
        const condition = `
    and (staff.id LIKE ? 
        OR CONCAT(staff.name, ' ', staff.surname) LIKE ? 
        OR staff.name LIKE ? 
        OR staff.surname LIKE ? 
        OR roles.name LIKE ? 
        OR staff.employee_id LIKE ?
        OR staff_designation.designation LIKE ? 
        OR staff.contact_no LIKE ? 
        OR department.department_name LIKE ?
        OR staff_roles.role_id LIKE ? ) `;

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
          pattern,
        );

        baseQuery += condition;
        countQuery += condition;
      }

      if (role_id) {
        baseQuery += ` AND staff_roles.role_id = ?`;
        countQuery += ` AND staff_roles.role_id = ?`;
        values.push(role_id);
      }

      baseQuery += ` ORDER BY CONCAT(staff.name, ' ', staff.surname) ASC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];

      const staffSearch = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: staffSearch,
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

  async findAllDisabledStaff(limit: number, page: number): Promise<CountDto> {
    const offset = limit * (page - 1);

    const Disabled_staff_list = await this.connection.query(
      `SELECT staff.* ,staff.id,staff.employee_id,CONCAT(staff.name, ' ', staff.surname) AS staffname,staff_roles.role_id AS StaffRoleID,roles.name AS role_name,staff_designation.designation,staff.contact_no,department.department_name,group_concat(DISTINCT specialist.specialist_name),GROUP_CONCAT(DISTINCT languages.language) AS languagesknown FROM staff
   LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
   LEFT JOIN roles ON staff_roles.role_id = roles.id
   LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
   LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
   LEFT JOIN languages ON JSON_CONTAINS(staff.languagesKnown, CAST(languages.id AS JSON), '$') = 1
   LEFT JOIN department ON staff.department_id = department.id
   WHERE staff_roles.is_active = 0
   group by staff.id,staff.employee_id,staffname,StaffRoleID,role_name,designation,contact_no,department_name LIMIT ? OFFSET ? `,
      [Number(limit), Number(offset)],
    );

    try {
      let [total_list] = await this.connection.query(
        `SELECT count(id) as total FROM staff WHERE staff_roles.is_active = 0`,
      );

      let out = {
        details: Disabled_staff_list,
        total: total_list.total,
      };
      return out;
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

  async findAllDisabledStaffsearch(
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      let baseQuery = `
       SELECT 
      staff.id,
      staff.employee_id,
      CONCAT(staff.name, ' ', staff.surname) AS staffname,
      roles.name AS role_name,
      staff_designation.designation,
      staff.contact_no,
      department.department_name
    FROM staff
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.is_active = 0`;

      let countQuery = `
      SELECT COUNT(staff.id) AS total 
      FROM staff 
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.is_active = 0 `;

      if (search) {
        const condition = `
    and (staff.id LIKE ? 
        OR CONCAT(staff.name, ' ', staff.surname) LIKE ? 
        OR staff.name LIKE ? 
        OR staff.surname LIKE ? 
        OR roles.name LIKE ? 
        OR staff.employee_id LIKE ?
        OR staff_designation.designation LIKE ? 
        OR staff.contact_no LIKE ? 
        OR department.department_name LIKE ? ) `;

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
        );
      }

      baseQuery += ` ORDER BY CONCAT(staff.name, ' ', staff.surname) ASC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];

      const DisabledStaffSearch = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: DisabledStaffSearch,
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

  async findStaffListByRole(
    search: string,
    limit: number,
    page: number,
    role_id?: number,
  ): Promise<CountDto> {
    limit = Number(limit) || 10;
    page = Number(page) || 1;
    const offset = limit * (page - 1);

    const baseValues: any[] = [role_id];
    const searchValues: any[] = [];

    try {
      let baseQuery = `
        SELECT 
          staff.id,
          staff.employee_id,
          CONCAT(staff.name, ' ', staff.surname) AS staffname,
          roles.name AS role_name,
          staff_designation.designation,
          staff.contact_no,
          department.department_name 
        FROM staff
        LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
        LEFT JOIN roles ON staff_roles.role_id = roles.id
        LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
        LEFT JOIN department ON staff.department_id = department.id 
        WHERE staff_roles.role_id = ? 
          AND staff_roles.is_active = 1
      `;

      let countQuery = `
        SELECT COUNT(DISTINCT staff.id) AS total 
        FROM staff
        LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
        LEFT JOIN roles ON staff_roles.role_id = roles.id
        LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
        LEFT JOIN department ON staff.department_id = department.id 
        WHERE staff_roles.role_id = ? 
          AND staff_roles.is_active = 1
      `;

      if (search) {
        const condition = `
          AND (
            staff.id LIKE ? OR
            CONCAT(staff.name, ' ', staff.surname) LIKE ? OR
            staff.name LIKE ? OR
            staff.surname LIKE ? OR
            roles.name LIKE ? OR
            staff.employee_id LIKE ? OR
            staff_designation.designation LIKE ? OR
            staff.contact_no LIKE ? OR
            department.department_name LIKE ?
          )
        `;
        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        for (let i = 0; i < 9; i++) {
          searchValues.push(pattern);
        }
      }

      const fullBaseValues = [...baseValues, ...searchValues, limit, offset];
      const fullCountValues = [...baseValues, ...searchValues];

      baseQuery += ` ORDER BY CONCAT(staff.name, ' ', staff.surname) ASC LIMIT ? OFFSET ?`;

      const staffListByRole = await this.connection.query(
        baseQuery,
        fullBaseValues,
      );
      const countResultArray = await this.connection.query(
        countQuery,
        fullCountValues,
      );
      const countResult = countResultArray[0];

      return {
        details: staffListByRole,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      console.error('Query Error:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findDisabledStaffListByRole(
    search: string,
    limit: number,
    page: number,
    role_id?: number,
  ): Promise<CountDto> {
    limit = Number(limit) || 10;
    page = Number(page) || 1;

    const offset = limit * (page - 1);
    const values: any[] = [];

    try {
      let baseQuery = `
        SELECT 
          staff.id,
          staff.employee_id,
          CONCAT(staff.name, ' ', staff.surname) AS staffname,
          roles.name AS role_name,
          staff_designation.designation,
          staff.contact_no,
          department.department_name 
        FROM staff
        LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
        LEFT JOIN roles ON staff_roles.role_id = roles.id
        LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
        LEFT JOIN department ON staff.department_id = department.id 
        WHERE staff_roles.is_active = 0
      `;

      let countQuery = `
        SELECT COUNT(DISTINCT staff.id) AS total 
        FROM staff
        LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
        LEFT JOIN roles ON staff_roles.role_id = roles.id
        LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
        LEFT JOIN department ON staff.department_id = department.id 
        WHERE staff_roles.is_active = 0
      `;

      if (role_id) {
        baseQuery += ` AND staff_roles.role_id = ?`;
        countQuery += ` AND staff_roles.role_id = ?`;
        values.push(role_id);
      }

      if (search) {
        const condition = `
          AND (
            staff.id LIKE ? OR
            CONCAT(staff.name, ' ', staff.surname) LIKE ? OR
            staff.name LIKE ? OR
            staff.surname LIKE ? OR
            roles.name LIKE ? OR
            staff.employee_id LIKE ? OR
            staff_designation.designation LIKE ? OR
            staff.contact_no LIKE ? OR
            department.department_name LIKE ?
          )
        `;
        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        values.push(...Array(9).fill(pattern));
      }

      baseQuery += ` ORDER BY CONCAT(staff.name, ' ', staff.surname) ASC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const disabledStaff = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: disabledStaff,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      console.error('Query Error:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllstaffsearch(
    search: string,
    limit: number,
    page: number,
    role_id?: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      let baseQuery = `
       SELECT 
      staff.*,
      CONCAT(staff.name, ' ', staff.surname) AS staffname,
      roles.name AS role_name,
      staff_designation.designation,
      staff.contact_no,
      department.department_name,
      staff_roles.role_id
    FROM staff
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.is_active = 1`;

      let countQuery = `
      SELECT COUNT(staff.id) AS total 
      FROM staff 
    LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
    LEFT JOIN roles ON staff_roles.role_id = roles.id
    LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
    LEFT JOIN department ON staff.department_id = department.id WHERE staff_roles.is_active = 1 `;

      if (search) {
        const condition = `
    and (staff.id LIKE ? 
        OR CONCAT(staff.name, ' ', staff.surname) LIKE ? 
        OR staff.name LIKE ? 
        OR staff.surname LIKE ? 
        OR roles.name LIKE ? 
        OR staff.employee_id LIKE ?
        OR staff_designation.designation LIKE ? 
        OR staff.contact_no LIKE ? 
        OR department.department_name LIKE ?
        OR staff_roles.role_id LIKE ? ) `;

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
          pattern,
        );

        baseQuery += condition;
        countQuery += condition;
      }

      if (role_id) {
        baseQuery += ` AND staff_roles.role_id = ?`;
        countQuery += ` AND staff_roles.role_id = ?`;
        values.push(role_id);
      }

      baseQuery += ` ORDER BY CONCAT(staff.name, ' ', staff.surname) ASC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];

      const staffSearch = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: staffSearch,
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

  async V3findAllstaffsearch(
    search: string,
    limit: number,
    page: number,
    role_id?: number,
  ) {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      let staff_details = await this.connection.query(
        `select id, name, surname, employee_id, staff_designation_id, department_id, contact_no, local_address, image from staff where is_deleted=0 limit ${limit} offset ${offset}`,
      );
      console.log(staff_details, 'staff');

      if (staff_details.length > 0) {
        const staff_id = staff_details.map((staff) => staff.id);

        const designation_id = staff_details.map(
          (staff) => staff.staff_designation_id,
        );
        const department_id = staff_details.map((staff) => staff.department_id);

        const [department, designation, role] = await Promise.all([
          this.connection.query(
            `select id,department_name from department where id in (?)`,
            [department_id],
          ),
          this.connection.query(
            `select id,designation from staff_designation where id in (?)`,
            [designation_id],
          ),
          this.connection.query(
            `select staff_roles.staff_id id,roles.name from roles left join staff_roles on roles.id = staff_roles.role_id where staff_id in (?)`,
            [staff_id],
          ),
        ]);

        const dept_map = new Map(department.map((d) => [d.id, d]));
        console.log(dept_map, 'dept_map');

        const designation_map = new Map(designation.map((d) => [d.id, d]));
        const role_map = new Map(role.map((d) => [d.id, d]));

        await Promise.all(
          staff_details.map(async (app) => {
            app.designation_details = designation_map.get(
              app.staff_designation_id,
            );
            app.department_details = dept_map.get(app.department_id);
            app.role_details = role_map.get(app.id);
          }),
        );

        const [count] = await this.connection.query(
          `select count(id) total from staff where is_deleted = 0`,
        );

        return {
          details: staff_details,
          count: count.total,
        };
      }
    } catch (error) {
      console.log(error, 'err');

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
