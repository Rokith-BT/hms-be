import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { EmrHumanResourceAddStaff } from "./entities/emr_human_resource_add_staff.entity";


@Injectable()
export class EmrHumanResourceAddStaffService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async emailExists(email: string): Promise<boolean> {
    const result = await this.connection.query(
      `SELECT COUNT(*) AS count FROM staff WHERE email = ?`,
      [email],
    );
    return result[0].count > 0;
  }
  async create(StaffEntity: EmrHumanResourceAddStaff) {
    if (StaffEntity.hospital_id) {
      let Admin = []
      let hms = []
      try {
        const emailExists = await this.emailExists(StaffEntity.email);
        if (emailExists) {
          console.log(
            'Staff with this email already exists. Not inserting duplicate.',
          );
          return {
            status: 'failed',
            message:
              'Staff with this email already exists. Not inserting duplicate.',
          };
        }
        let numbbeerr;
        if (StaffEntity.contact_no.length <= 10) {
          numbbeerr = '91' + StaffEntity.contact_no
        }
        const [checkMob] = await this.connection.query(`select * from staff where contact_no = ? or contact_no = ?`, [
          StaffEntity.contact_no,
          numbbeerr
        ])
        if (checkMob) {
          return {
            status: 'failed',
            message: 'Mobile Number Already Exists!'
          };
        }
        const [getHosPitalName] = await this.dynamicConnection.query(`select hospital_name,plenome_id from hospitals where plenome_id = ?`, [StaffEntity.hospital_id])
        const [getlast_id] = await this.connection.query(`select id,employee_id from staff order by id desc`)
        let emplast
        if (getlast_id) {
          emplast = getlast_id.id;
        } else {
          emplast = 0
        }
        const currentEmp_id = parseInt(emplast) + 1
        const name = (await getHosPitalName).hospital_name.substring(0, 3);
        let nm = name.toUpperCase()
        const id = getHosPitalName.plenome_id
        let empNow = nm + id + currentEmp_id
        const [checkAdminEmp] = await this.dynamicConnection.query(`select * from staff where employee_id = ?`, [empNow])
        const [checkHmsEmp] = await this.connection.query(`select * from staff where employee_id = ?`, [empNow])
        if (checkHmsEmp || checkAdminEmp) {
          empNow = nm + id + currentEmp_id + "A"
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
          languagesKnown,
          staff_licence_number,
          aadhar_number
          ) VALUES
         (?,?,?,?,?,?,?,?,?,?,?,?
          ,?,?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,?,?
          ,?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [empNow,
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
            StaffEntity.staff_licence_number,
            StaffEntity.aadhar_number
          ],
        );
        HRStaff_id = AddHRStaff.insertId;
        if (HRStaff_id) {
          hms.push({ "staff": HRStaff_id })
        }
        const educations = (StaffEntity.education)
        for (const staff_educationss of educations) {
          console.log(staff_educationss, AddHRStaff.insertId, staff_educationss.degree,
            staff_educationss.specialization,
            staff_educationss.institute_name,
            staff_educationss.year_of_passing,
            staff_educationss.degree_certificate
          );
          await this.connection.query(
            `insert into staff_education (staff_id,degree,specialization,institute_name,year_of_passing,degree_certificate)
          values (?,?,?,?,?,?)`, [
            AddHRStaff.insertId,
            staff_educationss.degree,
            staff_educationss.specialization,
            staff_educationss.institute_name,
            staff_educationss.year_of_passing,
            staff_educationss.degree_certificate
          ]
          )
        }
        const experience = (StaffEntity.experience)
        for (const staff_work_experience of experience) {
          try {
            await this.connection.query(
              `insert into staff_work_experience (staff_id,company_name,designation,experience_certificate,start_date,end_date)
              values(?,?,?,?,?,?)`, [
              AddHRStaff.insertId,
              staff_work_experience.company_name,
              staff_work_experience.designation,
              staff_work_experience.experience_certificate,
              staff_work_experience.start_date,
              staff_work_experience.end_date
            ]
            )
          } catch (error) {
            console.error(`error inserting education:`, error);
          }
        }
        let staff_roles_id;
        try {
          const createRoles = await this.connection.query(
            `INSERT INTO staff_roles (role_id, staff_id, is_active) VALUES (?, ?, ?)`,
            [StaffEntity.role_id, AddHRStaff.insertId, StaffEntity.is_active],
          );

          staff_roles_id = createRoles.insertId;
          console.log(staff_roles_id, 'idddrole');
          if (staff_roles_id) {
            hms.push({ "staffRole": staff_roles_id })
          }
        } catch (error) {
          console.error('Error inserting data:', error);
        }

        let hosStaffLeaveDetailsID;

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
languagesKnown,
staff_licence_number,
aadhar_number
) VALUES
(?,?,?,?,?,?,?,?,?,?,?,?
,?,?,?,?,?,?,?,?,?,?,?,?
,?,?,?,?,?,?,?,?,?,?,?,?
,?,?,?,?,?,?,?,?,?,?,?,?
,?,?,?,?,?,?,?,?,?)`,
              [empNow,
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
                StaffEntity.staff_licence_number,
                StaffEntity.aadhar_number
              ],
            );
            HRDynamicStaffid = AddDynamicHRStaff.insertId;
            if (HRDynamicStaffid) {
              Admin.push({ "staff": HRDynamicStaffid })
            }
          } catch (error) {
            console.log(error, "error in addin dunamic staff");
          }

        } catch (error) {
          console.error('Error inserting dynamic staff data:', error);
        }

        let staff_dynamic_hospital_staff_id;

        const [HOSStaff] = await this.dynamicConnection.query(
          'select * from hospital_staffs where hospital_id = ? AND staff_id = ?',
          [StaffEntity.hospital_id, HRDynamicStaffid],
        );
        if (HOSStaff) {
          console.log('irukku');
        } else {
          if (staff_dynamic_hospital_staff_id) {
            Admin.push({ "hospitalStaff": staff_dynamic_hospital_staff_id })
          }
          console.log(staff_dynamic_hospital_staff_id, 'idddhospitalstaffrole');
        }



        try {
          await this.dynamicConnection.query(`insert into staff_education(staff_id,degree,specialization,institute_name,
    year_of_passing,degree_certificate,hospital_id,hos_staff_education_id) values(?,?,?,?,?,?,?,?)`, [
            AddHRStaff.insertId,
            StaffEntity.degree,
            StaffEntity.specialization,
            StaffEntity.institute_name,
            StaffEntity.year_of_passing,
            StaffEntity.degree_certificate,
            StaffEntity.hospital_id,
            id
          ])
        } catch (error) {
          console.error(`error inserting staff_education:`, error)
        }


        try {
          await this.dynamicConnection.query(`insert into staff_work_experience(staff_id,company_name,designation,experience_certificate,start_date,end_date,
    hospital_id,hos_staff_work_experience_id) values (?,?,?,?,?,?,?,?)`, [
            AddHRStaff.insertId,
            StaffEntity.company_name,
            StaffEntity.designation,
            StaffEntity.experience_certificate,
            StaffEntity.start_date,
            StaffEntity.end_date,
            StaffEntity.hospital_id,
            id
          ])
        } catch (error) {
          console.error(`error inserting staff_work_experience:`, error)
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
          Admin.push({ "sstaffRole": staff_dynamic_roles_id })
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

        const getAdminLeaveTypeID = await this.dynamicConnection.query(`SELECT id from leave_types where hospital_leave_types_id= ? and Hospital_id = ?`, [StaffEntity.leave_type_id, StaffEntity.hospital_id])
        const getAdminLeaveTypeIDD = getAdminLeaveTypeID[0].id;
        await this.dynamicConnection.query(
          `INSERT INTO staff_leave_details (staff_id, leave_type_id, alloted_leave, hospital_id, hos_staff_leave_details_id) VALUES (?, ?, ?, ?, ?)`,
          [HRDynamicStaffid, getAdminLeaveTypeIDD, StaffEntity.alloted_leave, StaffEntity.hospital_id, hosStaffLeaveDetailsID],
        );


        return [
          {
            data: {
              status: 'success',
              messege: 'Staff details added successfully ',
              Added_Staff_Values: await this.connection.query(
                'SELECT * FROM staff WHERE id = ?',
                [HRStaff_id],
              ),
            },
          },
        ];
      }
      catch (error) {

        Admin.forEach(obj => {
          if (obj.hasOwnProperty('sstaffRole')) {
            this.dynamicConnection.query(`delete from staff_roles where id = ?`, [obj.sstaffRole])
            console.log('staff value:', obj.sstaffRole);
          }
        });

        Admin.forEach(obj => {
          if (obj.hasOwnProperty('hospitalStaff')) {
            this.dynamicConnection.query(`delete from hospital_staffs where id = ?`, [obj.hospitalStaff])
            console.log('staff value:', obj.hospitalStaff);
          }
        });

        Admin.forEach(obj => {
          if (obj.hasOwnProperty('staff')) {
            this.dynamicConnection.query(`delete from staff where id = ?`, [obj.staff])
            console.log('staff value:', obj.staff);
          }
        });






        hms.forEach(obj => {
          if (obj.hasOwnProperty('staffRole')) {
            this.connection.query(`delete from staff_roles where id = ?`, [obj.staffRole])
            console.log('staff value:', obj.staffRole);
          }
        });


        hms.forEach(obj => {
          if (obj.hasOwnProperty('staff')) {
            this.connection.query(`delete from staff where id = ?`, [obj.staff])
            console.log('staff value:', obj.staff);
          }
        });
        console.error('Error while posting data:', error);

        return error
      }
    } else {
      return {
        status: 'failed',
        message: 'Enter hospital_id to add staff',
      };
    }
  }


  async find_active_or_inactive_staff(active_Status: string) {
    const get_staff_profiles = await this.connection.query(`select staff.id as id, concat(staff.name," ",staff.surname) as name, staff.employee_id as employee_id, roles.name as Role, staff.email as email,
department.department_name as department, staff_designation.designation as designation, staff.contact_no as mobile, 
staff_roles.is_active as status from staff
left join staff_roles on staff_roles.staff_id = staff.id
left join roles on staff_roles.role_id = roles.id  
left join  department on staff.department_id = department.id
left join staff_designation on staff.staff_designation_id = staff_designation.id
where staff_roles.is_active = ?`, [active_Status])
    return get_staff_profiles;
  }
  async find_total_count(date: string) {
    const count = await this.connection.query(`SELECT COUNT(*) total
      FROM staff 
      LEFT JOIN staff_attendance ON staff_attendance.staff_id = staff.id
      WHERE date(staff_attendance.date) = date(?)`, [date])
    return count;
  }
  async find_present_staff(date: string) {
    const present_count = await this.connection.query(`     SELECT 
    COUNT(staff.id) AS total_active_staff
FROM 
    staff
LEFT JOIN 
    staff_roles ON staff_roles.staff_id = staff.id
LEFT JOIN 
    staff_attendance ON staff_attendance.staff_id = staff.id
WHERE 
    staff_attendance.is_active = 1 
    AND DATE(staff_attendance.date) = DATE(?)`, [date])
    return present_count;
  }

  async find_absent_staff(date: string) {
    const absend_count = await this.connection.query(`SELECT 
    COUNT(staff.id) AS total_absent_staff
FROM 
    staff
LEFT JOIN 
    staff_roles ON staff_roles.staff_id = staff.id
LEFT JOIN 
    staff_attendance ON staff_attendance.staff_id = staff.id
WHERE 
    staff_attendance.is_active = 0 
    AND DATE(staff_attendance.date) = DATE(?)`, [date])
    return absend_count;
  }
}