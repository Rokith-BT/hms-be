import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MedicationIpd } from './entities/medication_ipd.entity';

@Injectable()
export class MedicationIpdService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}
  async create(createMedicationIpd: MedicationIpd) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createMedicationIpd.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Medication with id: ${createMedicationIpd.generated_by} not found.`,
        );
      }
      const docemail = await staffId.email;
      const ipdMedication = await this.connection.query(
        `INSERT into medication_report(
  medicine_dosage_id,
  pharmacy_id,
  ipd_id,
  date,
  time,
  remark,
  generated_by
  ) VALUES (?,?,?,?,?,?,?)`,
        [
          createMedicationIpd.medicine_dosage_id,
          createMedicationIpd.pharmacy_id,
          createMedicationIpd.ipd_id,
          createMedicationIpd.date,
          createMedicationIpd.time,
          createMedicationIpd.remark,
          createMedicationIpd.generated_by,
        ],
      );
      const ipdMedicationIddd = ipdMedication.insertId;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const dynnnPharmacyid = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?',
        [createMedicationIpd.pharmacy_id],
      );
      const dynnnPharmaid = dynnnPharmacyid[0].id;
      const dynnnDosageid = await this.dynamicConnection.query(
        'SELECT id FROM medicine_dosage WHERE hospital_medicine_dosage_id = ?',
        [createMedicationIpd.medicine_dosage_id],
      );
      const dynnndosageid = dynnnDosageid[0].id;
      const dynnnipdid = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ?',
        [createMedicationIpd.ipd_id],
      );
      const dynnnipdidddd = dynnnipdid[0].id;
      await this.dynamicConnection.query(
        `INSERT into medication_report(
        medicine_dosage_id,
        pharmacy_id,
        ipd_id,
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
          dynnnipdidddd,
          createMedicationIpd.date,
          createMedicationIpd.time,
          createMedicationIpd.remark,
          dynamicUPTDStaffId,
          createMedicationIpd.Hospital_id,
          ipdMedicationIddd,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Medication added successfully ',
            Added_Ipd_Medication_Values: await this.connection.query(
              'SELECT * FROM medication_report WHERE id = ?',
              [ipdMedicationIddd],
            ),
          },
        },
      ];
    } catch (error) {
      throw new Error('Error inserting ipd medication details');
    }
  }

  async findMedication(id: number): Promise<MedicationIpd | null> {
    const getmedicationByID = await this.connection.query(
      `select medication_report.id, medication_report.date,dayname(medication_report.date) as day,pharmacy.medicine_name,medication_report.time,
    concat(medicine_dosage.dosage," " ,charge_units.unit) as Dosage,
    medication_report.remark from medication_report
    left join pharmacy on medication_report.pharmacy_id = pharmacy.id
    left join medicine_dosage on medication_report.medicine_dosage_id = medicine_dosage.id
    left join charge_units on medicine_dosage.charge_units_id = charge_units.id
    where ipd_id = ?`,
      [id],
    );
    return getmedicationByID;
  }

  async update(id: number, createMedicationIpd: MedicationIpd) {
    try {
      const ipdMedicationipdidd = await this.connection.query(
        `SELECT ipd_id from medication_report WHERE id = ?`,
        [id],
      );
      const ipdMedicationipdiddddd = ipdMedicationipdidd[0].ipd_id;
      await this.connection.query(
        `UPDATE medication_report SET
          medicine_dosage_id=?,
          pharmacy_id=?,
          ipd_id=?,
          date=?,
          time=?,
          remark=?
          WHERE id = ?
          `,
        [
          createMedicationIpd.medicine_dosage_id,
          createMedicationIpd.pharmacy_id,
          ipdMedicationipdiddddd,
          createMedicationIpd.date,
          createMedicationIpd.time,
          createMedicationIpd.remark,
          id,
        ],
      );
      const DynipdMedicationip = await this.dynamicConnection.query(
        `SELECT id from medication_report WHERE hos_medication_report_id = ? and Hospital_id = ?`,
        [id, createMedicationIpd.Hospital_id],
      );
      const DynipdMedicationippp = DynipdMedicationip[0].id;
      const DynipdMedicationipdidd = await this.dynamicConnection.query(
        `SELECT ipd_id from medication_report WHERE id = ? and Hospital_id = ?`,
        [DynipdMedicationippp, createMedicationIpd.Hospital_id],
      );
      const DynipdMedicationipdiddddd = DynipdMedicationipdidd[0].ipd_id;
      const dynnnPharmacyid = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy WHERE hos_pharmacy_id = ?',
        [createMedicationIpd.pharmacy_id],
      );
      const dynnnPharmaid = dynnnPharmacyid[0].id;
      const dynnnDosageid = await this.dynamicConnection.query(
        'SELECT id FROM medicine_dosage WHERE hospital_medicine_dosage_id = ?',
        [createMedicationIpd.medicine_dosage_id],
      );
      const dynnndosageid = dynnnDosageid[0].id;
      await this.dynamicConnection.query(
        `UPDATE medication_report SET
          medicine_dosage_id=?,
          pharmacy_id=?,
          ipd_id=?,
          date=?,
          time=?,
          remark=?,
          Hospital_id=?
          WHERE id = ?
          `,
        [
          dynnndosageid,
          dynnnPharmaid,
          DynipdMedicationipdiddddd,
          createMedicationIpd.date,
          createMedicationIpd.time,
          createMedicationIpd.remark,
          createMedicationIpd.Hospital_id,
          DynipdMedicationippp,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Ipd Medication notes updated successfully ',
            Updated_ipd_medication_Values: await this.connection.query(
              'SELECT * FROM medication_report WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new Error('Error updating ipd medication details');
    }
  }

  async removeMedication(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM medication_report WHERE id = ?',
        [id],
      );
      const dynamicgetMedication = await this.dynamicConnection.query(
        'SELECT id FROM medication_report WHERE hos_medication_report_id = ?',
        [id],
      );
      const dynamicgetMedicationiddd = dynamicgetMedication[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM medication_report WHERE id = ? AND Hospital_id = ?',
        [dynamicgetMedicationiddd, Hospital_id],
      );
      return [
        {
          status: 'success',
          message: `Medication with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new Error('Error deleting ipd medication details');
    }
  }
}
