import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { OpdPrescription } from "./entities/opd_prescription.entity";

@Injectable()
export class OpdPrescriptionService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createPrescriptionOpd: OpdPrescription) {

    try {
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createPrescriptionOpd.prescribe_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createPrescriptionOpd.prescribe_by} not found.`);
      }
      const docemail = staffId.email;
      const fromDate = new Date()
      const timestamp = fromDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
      const opdPrescriptionbasic = await this.connection.query(
        `INSERT into ipd_prescription_basic(
    visit_details_id,
    header_note,
    footer_note,
    finding_description,
    is_finding_print,
    date,
    prescribe_by
    ) VALUES (?,?,?,?,?,?,?)`,
        [
          createPrescriptionOpd.visit_details_id,
          createPrescriptionOpd.header_note,
          createPrescriptionOpd.footer_note,
          createPrescriptionOpd.finding_description,
          createPrescriptionOpd.is_finding_print,
          timestamp,
          createPrescriptionOpd.prescribe_by
        ],
      )
      const opdPrescriptionbasicIddd = opdPrescriptionbasic.insertId;
      const dynnnopdd = await this.dynamicConnection.query('SELECT id FROM visit_details WHERE hos_visit_id = ?', [createPrescriptionOpd.visit_details_id]);
      const Yourdynnnopdd = dynnnopdd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const DynopdPrescriptionbasic = await this.dynamicConnection.query(
        `INSERT into ipd_prescription_basic(
      visit_details_id,
      header_note,
      footer_note,
      finding_description,
      is_finding_print,
      date,
      prescribe_by,
      Hospital_id,
      hos_ipd_prescription_basic_id
      ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          Yourdynnnopdd,
          createPrescriptionOpd.header_note,
          createPrescriptionOpd.footer_note,
          createPrescriptionOpd.finding_description,
          createPrescriptionOpd.is_finding_print,
          timestamp,
          dynamicUPTDStaffId,
          createPrescriptionOpd.Hospital_id,
          opdPrescriptionbasicIddd
        ],
      )

      const dynopdPrescriptionbasicIddd = DynopdPrescriptionbasic.insertId;
      const opdPrescriptionTest = await this.connection.query(
        `INSERT into ipd_prescription_test(
      ipd_prescription_basic_id,pathology_id,radiology_id
      ) VALUES (?,?,?)`,
        [
          opdPrescriptionbasicIddd,
          createPrescriptionOpd.pathology_id,
          createPrescriptionOpd.radiology_id
        ],
      )
      const opdPrescriptiontestIddd = opdPrescriptionTest.insertId;
      await this.dynamicConnection.query(
        `INSERT into ipd_prescription_test(
        ipd_prescription_basic_id,
        pathology_id,
        radiology_id,
        Hospital_id,
        hos_ipd_prescription_test_id
        ) VALUES (?,?,?,?,?)`,
        [
          dynopdPrescriptionbasicIddd,
          createPrescriptionOpd.pathology_id,
          createPrescriptionOpd.radiology_id,
          createPrescriptionOpd.Hospital_id,
          opdPrescriptiontestIddd
        ],
      )
      for (const prescriptions of createPrescriptionOpd.prescriptions) {
        const opdPrescriptionDetails = await this.connection.query(
          `INSERT into ipd_prescription_details(
      basic_id,
      pharmacy_id,
      dosage,
      dose_interval_id,
      dose_duration_id,
      instruction
      ) VALUES (?,?,?,?,?,?)`,
          [
            opdPrescriptionbasicIddd,
            prescriptions.pharmacy_id,
            prescriptions.dosage,
            prescriptions.dose_interval_id,
            prescriptions.dose_duration_id,
            prescriptions.instruction
          ],
        )


        const opdPrescriptiondetailsIdddwww = opdPrescriptionDetails.insertId;

        const dynnnPharmacyid = await this.dynamicConnection.query('SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?', [prescriptions.pharmacy_id]);
        const dynnnPharmaid = dynnnPharmacyid[0].id;
        const dynnndoseintervalid = await this.dynamicConnection.query('SELECT id FROM dose_interval WHERE hospital_dose_interval_id = ?', [prescriptions.dose_interval_id]);
        const Dynnndoseintervalid = dynnndoseintervalid[0].id;
        const dynnndosedurationid = await this.dynamicConnection.query('SELECT id FROM dose_duration WHERE hospital_dose_duration_id = ?', [prescriptions.dose_duration_id]);
        const Dynnndosedurationid = dynnndosedurationid[0].id;
        const dynopdPrescriptionbasicIddd = DynopdPrescriptionbasic.insertId;
        await this.dynamicConnection.query(
          `INSERT into ipd_prescription_details(
        basic_id,
        pharmacy_id,
        dosage,
        dose_interval_id,
        dose_duration_id,
        instruction,
        Hospital_id,
        hos_ipd_prescription_details_id
        ) VALUES (?,?,?,?,?,?,?,?)`,
          [
            dynopdPrescriptionbasicIddd,
            dynnnPharmaid,
            prescriptions.dosage,
            Dynnndoseintervalid,
            Dynnndosedurationid,
            prescriptions.instruction,
            createPrescriptionOpd.Hospital_id,
            opdPrescriptiondetailsIdddwww
          ],
        )
      }
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "message": process.env.PRESCRIPTION,
          "Added_Opd_Prescription_Values": await this.connection.query('SELECT * FROM ipd_prescription_basic WHERE id = ?', [opdPrescriptionbasic.insertId])
        }
      }];


    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
