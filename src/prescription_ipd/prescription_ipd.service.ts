import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PrescriptionIpd } from "./entities/prescription_ipd.entity";

@Injectable()
export class PrescriptionIpdService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async create(createPrescriptionIpd: PrescriptionIpd) {
    try {
      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createPrescriptionIpd.prescribe_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createPrescriptionIpd.prescribe_by} not found.`);
      }
      const docemail = staffId.email;

      const fromDate = new Date()
      const timestamp = fromDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
      const ipdPrescriptionbasic = await this.connection.query(
        `INSERT into ipd_prescription_basic(
    ipd_id,
    header_note,
    footer_note,
    finding_description,
    is_finding_print,
    date,
    prescribe_by
    ) VALUES (?,?,?,?,?,?,?)`,
        [
          createPrescriptionIpd.ipd_id,
          createPrescriptionIpd.header_note,
          createPrescriptionIpd.footer_note,
          createPrescriptionIpd.finding_description,
          createPrescriptionIpd.is_finding_print,
          timestamp,
          createPrescriptionIpd.prescribe_by
        ],
      )

      const ipdPrescriptionbasicIddd = ipdPrescriptionbasic.insertId;
      const dynnnipdd = await this.dynamicConnection.query('SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?', [createPrescriptionIpd.ipd_id]);
      const Yourdynnnipdd = dynnnipdd[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const DynipdPrescriptionbasic = await this.dynamicConnection.query(
        `INSERT into ipd_prescription_basic(
      ipd_id,
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
          Yourdynnnipdd,
          createPrescriptionIpd.header_note,
          createPrescriptionIpd.footer_note,
          createPrescriptionIpd.finding_description,
          createPrescriptionIpd.is_finding_print,
          timestamp,
          dynamicUPTDStaffId,
          createPrescriptionIpd.Hospital_id,
          ipdPrescriptionbasicIddd
        ],
      )
      const dynipdPrescriptionbasicIddd = DynipdPrescriptionbasic.insertId;
      for (const prescriptionsTest of createPrescriptionIpd.prescriptionTest) {
        const ipdPrescriptionTest = await this.connection.query(
          `INSERT into ipd_prescription_test(
      ipd_prescription_basic_id,
      pathology_id,
      radiology_id
      ) VALUES (?,?,?)`,
          [
            ipdPrescriptionbasicIddd,
            prescriptionsTest.pathology_id,
            prescriptionsTest.radiology_id
          ],
        )
        const ipdPrescriptiontestIddd = ipdPrescriptionTest.insertId;
        const patholodyadmin_id = await this.dynamicConnection.query(`select id from pathology where hos_pathology_id = ? and hospital_id = ?`, [prescriptionsTest.pathology_id, createPrescriptionIpd.Hospital_id])
        const pathology_id = patholodyadmin_id[0].id;
        const radiologyadmin_id = await this.dynamicConnection.query(`select id from radio where hos_radio_id = ? and hospital_id = ?`, [prescriptionsTest.radiology_id, createPrescriptionIpd.Hospital_id])
        const radiology_id = radiologyadmin_id[0].id;
        await this.dynamicConnection.query(
          `INSERT into ipd_prescription_test(
        ipd_prescription_basic_id,
        pathology_id,
      radiology_id,
        Hospital_id,
        hos_ipd_prescription_test_id
        ) VALUES (?,?,?,?,?)`,
          [
            dynipdPrescriptionbasicIddd,
            pathology_id,
            radiology_id,
            createPrescriptionIpd.Hospital_id,
            ipdPrescriptiontestIddd
          ],
        )
      }
      for (const prescriptions of createPrescriptionIpd.prescriptions) {
        const ipdPrescriptionDetails = await this.connection.query(
          `INSERT into ipd_prescription_details(
      basic_id,
      pharmacy_id,
      dosage,
      dose_interval_id,
      dose_duration_id,
      instruction
      ) VALUES (?,?,?,?,?,?)`,
          [
            ipdPrescriptionbasicIddd,
            prescriptions.pharmacy_id,
            prescriptions.dosage,
            prescriptions.dose_interval_id,
            prescriptions.dose_duration_id,
            prescriptions.instruction
          ],
        )
        const ipdPrescriptiondetailsIdddwww = ipdPrescriptionDetails.insertId;
        const dynnnPharmacyid = await this.dynamicConnection.query('SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?', [prescriptions.pharmacy_id]);
        const dynnnPharmaid = dynnnPharmacyid[0].id;
        const dynnndoseintervalid = await this.dynamicConnection.query('SELECT id FROM dose_interval WHERE hospital_dose_interval_id = ?', [prescriptions.dose_interval_id]);
        const Dynnndoseintervalid = dynnndoseintervalid[0].id;
        const dynnndosedurationid = await this.dynamicConnection.query('SELECT id FROM dose_duration WHERE hospital_dose_duration_id = ?', [prescriptions.dose_duration_id]);
        const Dynnndosedurationid = dynnndosedurationid[0].id;
        const dynipdPrescriptionbasicIddd = DynipdPrescriptionbasic.insertId;
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
            dynipdPrescriptionbasicIddd,
            dynnnPharmaid,
            prescriptions.dosage,
            Dynnndoseintervalid,
            Dynnndosedurationid,
            prescriptions.instruction,
            createPrescriptionIpd.Hospital_id,
            ipdPrescriptiondetailsIdddwww
          ],
        )
      }
      return [{
        "data ": {
          status: "success",
          "message": "Prescription added successfully ",
          "Added_Ipd_Prescription_Values": await this.connection.query('SELECT * FROM ipd_prescription_basic WHERE id = ?', [ipdPrescriptionbasic.insertId])
        }
      }];


    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async findFindingsName(id: number): Promise<PrescriptionIpd | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding_category WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try{
    const getFindingsname = await this.connection.query(`SELECT * from finding where finding_category_id = ?`, [id]);
    return getFindingsname;
  }catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }



  async findFindingsNameandDesc(id: number): Promise<PrescriptionIpd | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try{
    const getFindingsnameanddesc = await this.connection.query(`SELECT finding.id,concat(finding.name," ",finding.description) AS Finding FROM finding WHERE id = ?`, [id]);
    return getFindingsnameanddesc;
  }catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }




  async findprescriptionByIpdno(id: number, search: string): Promise<PrescriptionIpd | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try{
    let query = `SELECT ipd_prescription_basic.id,concat('IPDP',"",ipd_prescription_basic.id) AS PrescriptionNo,
    ipd_prescription_basic.date AS PrescriptionDate,
    ipd_prescription_basic.finding_description AS Finding
    FROM ipd_prescription_basic
    WHERE ipd_id = ? `
    let values = []
    values.push(id)
    if (search) {

      query += `  and (concat('IPDP',"",ipd_prescription_basic.id) like ? or ipd_prescription_basic.date like ? or ipd_prescription_basic.finding_description like ?)  `
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
    }
    const getprescriptionByIpdno = await this.connection.query(query, values)
    return getprescriptionByIpdno;
  }catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }


  async findviewPrescription(id: number): Promise<PrescriptionIpd | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try{
    const getViewPrescription = await this.connection.query(`SELECT ipd_prescription_basic.id,sch_settings.image AS HospitalLogo,sch_settings.name AS HospitalName,
    sch_settings.address,sch_settings.phone,sch_settings.email,
    print_setting.print_header AS PrintHeader,
    concat('IPDP',"",ipd_prescription_basic.id) AS PrescriptionNo,
    ipd_prescription_basic.date AS PrescriptionDate,
    ipd_prescription_basic.finding_description AS Finding,
    ipd_prescription_basic.header_note,
    ipd_prescription_basic.footer_note,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS ConsultantDoctor,
    medicine_category.medicine_category AS MedicineCategory,
    pharmacy.medicine_name AS Medicine,
    medicine_dosage.dosage AS MedicineDosage,
    dose_interval.name AS DosageInterval,
    dose_duration.name AS DosageDuration,
    ipd_prescription_details.instruction AS Instruction,
    patients.patient_name AS PatientName,patients.age AS PatientAge,patients.gender AS PatientGender,patients.email AS PatientEmail,
    patients.mobileno AS PatientMobileNo,blood_bank_products.name As PatientBloodGroup,
    ipd_details.bp AS PatientBP,ipd_details.height AS PatientHieght,ipd_details.weight AS PatientWeight,
    ipd_details.pulse AS PatientPulse,ipd_details.temperature AS PatientTemperature
    FROM ipd_prescription_basic
    JOIN print_setting
    JOIN sch_settings 
    LEFT JOIN staff ON ipd_prescription_basic.prescribe_by = staff.id
    LEFT JOIN ipd_prescription_details ON ipd_prescription_basic.id = ipd_prescription_details.basic_id
    LEFT JOIN pharmacy ON ipd_prescription_details.pharmacy_id = pharmacy.id
    LEFT JOIN medicine_category ON pharmacy.medicine_category_id = medicine_category.id
    LEFT JOIN medicine_dosage ON ipd_prescription_details.dosage = medicine_dosage.id
    LEFT JOIN dose_interval ON ipd_prescription_details.dose_interval_id = dose_interval.id
    LEFT JOIN dose_duration ON ipd_prescription_details.dose_duration_id = dose_duration.id
    LEFT JOIN ipd_details ON ipd_prescription_basic.ipd_id = ipd_details.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    LEFT JOIN blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id
    WHERE ipd_id = ?`, [id]);
    return getViewPrescription;
  }catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }




  async removePrescription(id: number, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM ipd_prescription_basic WHERE id = ?', [id]);
      await this.connection.query('DELETE FROM ipd_prescription_test WHERE ipd_prescription_basic_id = ?', [id]);
      await this.connection.query('DELETE FROM ipd_prescription_details WHERE basic_id = ?', [id]);
      const dynamicgetprescription = await this.dynamicConnection.query('SELECT id FROM ipd_prescription_basic WHERE hos_ipd_prescription_basic_id = ?', [id]);
      const dynamicgetprescriptionid = dynamicgetprescription[0].id;
      await this.dynamicConnection.query('DELETE FROM ipd_prescription_basic WHERE id = ? AND Hospital_id = ?', [dynamicgetprescriptionid, Hospital_id]);
      await this.dynamicConnection.query('DELETE FROM ipd_prescription_test WHERE ipd_prescription_basic_id = ? AND Hospital_id = ?', [dynamicgetprescriptionid, Hospital_id]);
      await this.dynamicConnection.query('DELETE FROM ipd_prescription_details WHERE basic_id = ? AND Hospital_id = ?', [dynamicgetprescriptionid, Hospital_id]);
      return [
        {
          status: 'success',
          message: `Prescription with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }





  async update(id: number, createPrescriptionIpd: PrescriptionIpd) {
    try {
      const fromDate = new Date()
      const timestamp = fromDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
      const getdynprescbasicid = await this.dynamicConnection.query('SELECT id FROM ipd_prescription_basic WHERE hos_ipd_prescription_basic_id = ? and Hospital_id = ?', [id, createPrescriptionIpd.Hospital_id]);
      const getdynprescbasicidd = getdynprescbasicid[0].id;
      await this.connection.query(`update ipd_prescription_basic SET
    header_note=?,
    footer_note=?,
    finding_description=?,
    is_finding_print=?,
    date=?
    where id=?`,
        [
          createPrescriptionIpd.header_note,
          createPrescriptionIpd.footer_note,
          createPrescriptionIpd.finding_description,
          createPrescriptionIpd.is_finding_print,
          timestamp,
          id
        ],
      )
      await this.dynamicConnection.query(`update ipd_prescription_basic SET
      header_note=?,
      footer_note=?,
      finding_description=?,
      is_finding_print=?,
      date=?,
      Hospital_id=?
      where id=?`,
        [
          createPrescriptionIpd.header_note,
          createPrescriptionIpd.footer_note,
          createPrescriptionIpd.finding_description,
          createPrescriptionIpd.is_finding_print,
          timestamp,
          createPrescriptionIpd.Hospital_id,
          getdynprescbasicidd
        ],
      )
      const getPrescriptiontestid = await this.connection.query('SELECT id FROM ipd_prescription_test WHERE ipd_prescription_basic_id = ?', [id]);
      const getPrescriptiontestidd = getPrescriptiontestid[0].id;

      for (const update_PrescriptionTest of createPrescriptionIpd.prescriptionTest) {
        await this.connection.query(`update ipd_prescription_test SET
    pathology_id=?,
    radiology_id=?
    where id=?`,
          [
            update_PrescriptionTest.pathology_id,
            update_PrescriptionTest.radiology_id,
            getPrescriptiontestidd
          ]
        )
        const patholodyadmin_id = await this.dynamicConnection.query(`select id from pathology where hos_pathology_id = ? and hospital_id = ?`, [update_PrescriptionTest.pathology_id, createPrescriptionIpd.Hospital_id])
        const pathology_id = patholodyadmin_id[0].id;
        const radiologyadmin_id = await this.dynamicConnection.query(`select id from radio where hos_radio_id = ? and hospital_id = ?`, [update_PrescriptionTest.radiology_id, createPrescriptionIpd.Hospital_id])
        const radiology_id = radiologyadmin_id[0].id;
        const getprescrptiontest_id = await this.dynamicConnection.query(`select id from ipd_prescription_test where ipd_prescription_basic_id = ? and Hospital_id = ?`, [getPrescriptiontestidd, createPrescriptionIpd.Hospital_id])
        const get_prescription = getprescrptiontest_id[0];
        await this.dynamicConnection.query(`update ipd_prescription_test SET
      pathology_id=?,
    radiology_id=?,
    Hospital_id=?
  where id=?
      `, [
          pathology_id,
          radiology_id,
          createPrescriptionIpd.Hospital_id,
          get_prescription
        ])
      }
      const getPrescriptionDetailsid = await this.connection.query('SELECT id FROM ipd_prescription_details WHERE basic_id = ?', [id]);
      const getPrescriptionDetailsiddd = getPrescriptionDetailsid[0].id;

      for (const update_prescription of createPrescriptionIpd.prescriptions) {
        await this.connection.query(`update ipd_prescription_details SET
        pharmacy_id=?,
        dosage=?,
        dose_interval_id=?,
        dose_duration_id=?,
        instruction=?
        where id=?`,
          [createPrescriptionIpd.pharmacy_id,
          createPrescriptionIpd.dosage,
          createPrescriptionIpd.dose_interval_id,
          createPrescriptionIpd.dose_duration_id,
          createPrescriptionIpd.instruction,
            getPrescriptionDetailsiddd
          ]
        )
        const dynnnPharmacyid = await this.dynamicConnection.query('SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?', [update_prescription.pharmacy_id]);
        const dynnnPharmaid = dynnnPharmacyid[0].id;
        const dynnndoseintervalid = await this.dynamicConnection.query('SELECT id FROM dose_interval WHERE hospital_dose_interval_id = ?', [update_prescription.dose_interval_id]);
        const Dynnndoseintervalid = dynnndoseintervalid[0].id;
        const dynnndosedurationid = await this.dynamicConnection.query('SELECT id FROM dose_duration WHERE hospital_dose_duration_id = ?', [update_prescription.dose_duration_id]);
        const Dynnndosedurationid = dynnndosedurationid[0].id;
        const getDynPrescriptionDetailsid = await this.dynamicConnection.query('SELECT id FROM ipd_prescription_details WHERE basic_id = ? and Hospital_id = ?', [getdynprescbasicidd, createPrescriptionIpd.Hospital_id]);
        const getDynPrescriptionDetailsiddd = getDynPrescriptionDetailsid[0].id;
        await this.dynamicConnection.query(`update ipd_prescription_details SET
  pharmacy_id=?,
  dosage=?,
  dose_interval_id=?,
  dose_duration_id=?,
  instruction=?,
  Hospital_id=?
  where id=?`,
          [
            dynnnPharmaid,
            createPrescriptionIpd.dosage,
            Dynnndoseintervalid,
            Dynnndosedurationid,
            createPrescriptionIpd.instruction,
            createPrescriptionIpd.Hospital_id,
            getDynPrescriptionDetailsiddd
          ]
        )
      }
      return [{
        "data ": {
          status: "success",
          "messege": "Prescription details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM ipd_prescription_basic WHERE id = ?', [id])
        }
      }];

    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }





  async findMedicineName(id: number): Promise<PrescriptionIpd | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_category WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try{
    const getMedicineName = await this.connection.query(`SELECT pharmacy.id,pharmacy.medicine_name AS Medicine FROM pharmacy WHERE medicine_category_id = ?`, [id]);
    return getMedicineName;
    }catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findDosageName(id: number): Promise<PrescriptionIpd | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_category WHERE id = ?',
      [id],
    );
 
    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try{

    const findDosageName = await this.connection.query(`SELECT medicine_dosage.id, CONCAT(medicine_dosage.dosage,"",charge_units.unit) AS Dosage FROM medicine_dosage 
    LEFT JOIN charge_units ON medicine_dosage.charge_units_id = charge_units.id
    WHERE medicine_category_id = ?`, [id]);
    return findDosageName;
    }catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  }
}