import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class EmrHumanResourceProfileService {
  constructor(private readonly connection: DataSource
  ) { }

  async findbyid(id: string) {
    const get_staff_profiles = await this.connection.query(`select staff.id as id, concat(staff.name,staff.surname) as name, staff.employee_id as staff_id, staff_roles.role_id AS StaffRoleID,roles.name AS role_name,
staff_designation.designation as Designation, department.department_name as department, specialist.specialist_name as specialist from staff
  LEFT JOIN staff_roles ON staff.id = staff_roles.staff_id
  LEFT JOIN roles ON staff_roles.role_id = roles.id
  LEFT JOIN staff_designation ON staff.staff_designation_id = staff_designation.id
  LEFT JOIN department ON staff.department_id = department.id
  LEFT JOIN specialist ON JSON_contains(staff.specialist,cast(specialist.id as JSON),'$')=1
where staff.id = ?`, [id])
    console.log("service");

    return get_staff_profiles;

  }

  async findonebyId(id: string) {
    const get_profile = await this.connection.query(`select staff.contact_no as phone_number, staff.email as Email_ID, staff.gender as gender, staff.blood_group as blood_group, staff.dob as date_of_birth, 
staff.marital_status as marital_status, staff.father_name as father_name, staff.mother_name as mother_name, staff.qualification as Qualification,
department.department_name as department, staff.work_exp as work_experience, staff.emergency_contact_no as emergency_phone_number,
staff.epf_no as EPF_number,staff.pan_number as pan_number, staff.identification_number as national_identification_number, staff.basic_salary as basic_salary,
staff.shift, staff.location as work_location,staff.date_of_joining as date_of_joining, staff.contract_type from staff
left join department on staff.department_id = department.id
where staff.id = ?`, [id])
    return get_profile;
  }

}
