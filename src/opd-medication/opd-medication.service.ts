import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { OpdMedication } from "./entities/opd-medication.entity";

@Injectable()
export class OpdMedicationService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async create(createMedicationOpd: OpdMedication) {
    try {
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createMedicationOpd.generated_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Medication with id: ${createMedicationOpd.generated_by} not found.`);
      }
      const docemail = staffId.email;
      const opdMedication = await this.connection.query(
        `INSERT into medication_report(
  medicine_dosage_id,
  pharmacy_id,
  opd_details_id,
  date,
  time,
  remark,
  generated_by
  ) VALUES (?,?,?,?,?,?,?)`,
        [
          createMedicationOpd.medicine_dosage_id,
          createMedicationOpd.pharmacy_id,
          createMedicationOpd.opd_details_id,
          createMedicationOpd.date,
          createMedicationOpd.time,
          createMedicationOpd.remark,
          createMedicationOpd.generated_by
        ],
      )
      const opdMedicationIddd = opdMedication.insertId;
      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const dynnnPharmacyid = await this.dynamicConnection.query('SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?', [createMedicationOpd.pharmacy_id]);
      const dynnnPharmaid = dynnnPharmacyid[0].id;
      const dynnnDosageid = await this.dynamicConnection.query('SELECT id FROM medicine_dosage WHERE hospital_medicine_dosage_id = ?', [createMedicationOpd.medicine_dosage_id]);
      const dynnndosageid = dynnnDosageid[0].id;
      const dynnnopdid = await this.dynamicConnection.query('SELECT id FROM opd_details WHERE hos_opd_id = ?', [createMedicationOpd.opd_details_id]);
      const dynnnopdidddd = dynnnopdid[0].id;
      await this.dynamicConnection.query(
        `INSERT into medication_report(
        medicine_dosage_id,
        pharmacy_id,
        opd_details_id,
        date,
        time,
        remark,
        generated_by,
        Hospital_id,
        hos_medication_report_id
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          dynnndosageid,
          dynnnPharmaid,
          dynnnopdidddd,
          createMedicationOpd.date,
          createMedicationOpd.time,
          createMedicationOpd.remark,
          dynamicUPTDStaffId,
          createMedicationOpd.Hospital_id,
          opdMedicationIddd
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.MEDICATION,
          "Added_opd_Medication_Values": await this.connection.query('SELECT * FROM medication_report WHERE id = ?', [opdMedicationIddd])
        }
      }];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findall() {
    try {
      const getmedication = await this.connection.query(`select medication_report.id, medication_report.date,dayname(medication_report.date) as day,pharmacy.medicine_name,medication_report.time,
    concat(medicine_dosage.dosage," " ,charge_units.unit) as Dosage,
    medication_report.remark from medication_report
    left join pharmacy on medication_report.pharmacy_id = pharmacy.id
    left join medicine_dosage on medication_report.medicine_dosage_id = medicine_dosage.id
    left join charge_units on medicine_dosage.charge_units_id = charge_units.id`);
      return getmedication;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }


  async findMedication(id: number) {
    try {
      const getmedicationByID = await this.connection.query(`select medication_report.id, medication_report.date,dayname(medication_report.date) as day,pharmacy.medicine_name,medication_report.time,
    concat(medicine_dosage.dosage," " ,charge_units.unit) as Dosage,
    medication_report.remark from medication_report
    left join pharmacy on medication_report.pharmacy_id = pharmacy.id
    left join medicine_dosage on medication_report.medicine_dosage_id = medicine_dosage.id
    left join charge_units on medicine_dosage.charge_units_id = charge_units.id
    where opd_details_id = ?`, [id]);
      return getmedicationByID;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }
  async update(id: number, createMedicationOpd: OpdMedication) {
    try {
      await this.connection.query(
        `UPDATE medication_report SET
          medicine_dosage_id=?,
          pharmacy_id=?,
          date=?,
          time=?,
          remark=?
          WHERE id = ?
          `,
        [
          createMedicationOpd.medicine_dosage_id,
          createMedicationOpd.pharmacy_id,
          createMedicationOpd.date,
          createMedicationOpd.time,
          createMedicationOpd.remark,
          id
        ],
      )
      const DynopdMedicationip = await this.dynamicConnection.query(`SELECT id from medication_report WHERE hos_medication_report_id = ? and Hospital_id = ?`, [id, createMedicationOpd.Hospital_id])
      const DynopdMedicationippp = DynopdMedicationip[0].id;
      const dynnnPharmacyid = await this.dynamicConnection.query('SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?', [createMedicationOpd.pharmacy_id]);
      const dynnnPharmaid = dynnnPharmacyid[0].id;
      const dynnnDosageid = await this.dynamicConnection.query('SELECT id FROM medicine_dosage WHERE hospital_medicine_dosage_id = ?', [createMedicationOpd.medicine_dosage_id]);
      const dynnndosageid = dynnnDosageid[0].id;
      await this.dynamicConnection.query(
        `UPDATE medication_report SET
          medicine_dosage_id=?,
          pharmacy_id=?,
          date=?,
          time=?,
          remark=?,
          Hospital_id=?
          WHERE id = ?
          `,
        [
          dynnndosageid,
          dynnnPharmaid,
          createMedicationOpd.date,
          createMedicationOpd.time,
          createMedicationOpd.remark,
          createMedicationOpd.Hospital_id,
          DynopdMedicationippp
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.MEDICATION_UPDATED,
          "Updated_Opd_medication_Values": await this.connection.query('SELECT * FROM medication_report WHERE id = ?', [id])
        }
      }];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async removeMedication(id: number, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query('SELECT id FROM medication_report WHERE id = ?', [id]);
    if (!existingRecord) {
      return [{ status: "error", message: `ID ${id} does not exist or it has been already deleted` }];
    }
    await this.connection.query('DELETE FROM medication_report WHERE id = ?', [id]);
    const dynamicgetMedication = await this.dynamicConnection.query('SELECT id FROM medication_report WHERE hos_medication_report_id = ?', [id]);
    const dynamicgetMedicationiddd = dynamicgetMedication[0].id;
    await this.dynamicConnection.query('DELETE FROM medication_report WHERE id = ? AND Hospital_id = ?', [dynamicgetMedicationiddd, Hospital_id]);
    return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message: `${process.env.MEDICATION_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
      },
    ];

  }






}
