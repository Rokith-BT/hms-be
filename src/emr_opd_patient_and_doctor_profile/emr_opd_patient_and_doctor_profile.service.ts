import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class EmrOpdPatientAndDoctorProfileService {
    constructor(private readonly connection: DataSource
    ) { }

    async findone(patient_id: number) {
        const patient_details = await this.connection.query(`
    select patients.id as patient_id , patients.patient_name, patients.gender, patients.blood_bank_product_id, 
concat(patients.age,"Years",patients.month,"months",patients.day,"days") as age,patients.dial_code ,patients.mobileno, 
patients.email, patients.abha_address, patients.address from patients where patients.id = ?`, [patient_id])
        return patient_details;
    }

    async finddoctors(staff_id: number) {
        const patient_details = await this.connection.query(`
       select concat("DR.",staff.name,staff.surname) as doctor, 
specialist.specialist_name as speciality,
concat("PT",staff.id) as staff_id 
from staff 
left join specialist on staff.specialist = specialist.id
where staff.id = ?`, [staff_id])
        return patient_details;
    }
}
