import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";


@Injectable()
export class EmrPatientDetailsService {
    constructor(private readonly connection: DataSource) { }

    async findall(patients_id: number, mobile_no: number) {
        const patient = await this.connection.query(`select patients.id,patients.patient_name, patients.mobileno, patients.dob, 
concat(patients.age, " " ,"years") as age, patients.gender from patients where patients.id = ? or patients.mobileno = ?`, [patients_id, mobile_no])
        return patient;
    }
    async finddoctor(staff_id: number) {
        const doctor = await this.connection.query(`select staff.id, CONCAT("DR.",staff.name, ' ', staff.surname) AS staffname, charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
        (charges.standard_charge*((tax_category.percentage)/100))),2)  as amount from shift_details
left join staff on shift_details.staff_id = staff.id
left join charges on shift_details.charge_id = charges.id 
join tax_category on charges.tax_category_id = tax_category.id
where staff.id = ?`, [staff_id])
        return doctor;
    }
    async findDoctor_shift(staff_id: number) {
        const doctor_shift = await this.connection.query(` SELECT doctor_shift.id,doctor_shift.staff_id AS doctor,
                   doctor_shift.day AS date,
                   global_shift.name AS shift
            FROM doctor_shift
            LEFT JOIN global_shift ON doctor_shift.global_shift_id = global_shift.id
            WHERE doctor_shift.staff_id = ?`,
            [staff_id]);
        return doctor_shift;
    }

    async findDoctor_slot(staff_id: number, global_shift: number) {
        const doctor_time = await this.connection.query(`
      SELECT doctor_shift.id,doctor_shift.staff_id AS doctor,
               doctor_shift.day AS date,
               global_shift.name AS shift,
               CONCAT(doctor_shift.start_time, "-", doctor_shift.end_time) AS slot
        FROM doctor_shift
        LEFT JOIN global_shift ON doctor_shift.global_shift_id = global_shift.id
        WHERE doctor_shift.staff_id = ?

          AND doctor_shift.global_shift_id = ? `,
            [staff_id, global_shift]);
        return doctor_time;
    }
}