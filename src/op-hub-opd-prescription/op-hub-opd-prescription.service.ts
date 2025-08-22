import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateOpdPrescriptionDto } from './dto/create-opd-prescription.dto';
import { UpdateOpdPrescriptionDto } from './dto/update-opd-prescription.dto';

@Injectable()
export class OpHubOpdPrescriptionService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(clinicalNotes: CreateOpdPrescriptionDto | CreateOpdPrescriptionDto[]) {

    const prescriptions = Array.isArray(clinicalNotes) ? clinicalNotes : [clinicalNotes];

    for (const prescription of prescriptions) {
      console.log(prescription.hospital_id,"prescription.hospital_id");
      
      if (!prescription.hospital_id) {
        return {
          status: 'failed',
          message: 'Enter hospital_id to post clinical notes',
        };
      }
      try {
        const [getAdminOPD] = await this.connection.query(
          `SELECT id FROM opd_details WHERE Hospital_id = ? AND hos_opd_id = ?`,
          [prescription.hospital_id, prescription.opd_id],
        );

        const insertPrescription = await this.dynamicConnection.query(
          `INSERT INTO opd_prescription 
          (medicine_name, frequency, dosage, duration_count, duration_limit, quantity, \`when\`, remarks, filled_using, opd_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prescription.medicine_name,
            prescription.frequency,
            prescription.dosage,
            prescription.duration_count,
            prescription.duration_limit,
            prescription.quantity,
            prescription.when,
            prescription.remarks,
            prescription.filled_using,
            prescription.opd_id,
          ],
        );

        await this.connection.query(
          `INSERT INTO opd_prescription 
          (medicine_name, frequency, dosage, duration_count, duration_limit, quantity, \`when\`, remarks, filled_using, opd_id, hospital_id, hos_fopd_prescription_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prescription.medicine_name,
            prescription.frequency,
            prescription.dosage,
            prescription.duration_count,
            prescription.duration_limit,
            prescription.quantity,
            prescription.when,
            prescription.remarks,
            prescription.filled_using,
            getAdminOPD.id,
            prescription.hospital_id,
            insertPrescription.insertId,
          ],
        );
      } catch (error) {
        return {
          status: 'failed',
          message: 'Unable to post prescription',
          error: error,
        };
      }
    }
    return {
      status: 'success',
      message: 'Prescription(s) added successfully',
    };
  }

  async findAll(opd_id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      const insertPrescription = await this.dynamicConnection.query(`select * from opd_prescription where opd_id = ?`, [opd_id])
      const [getOpdDetails] = await this.dynamicConnection.query(`
            select DATE_FORMAT(visit_details.appointment_date, '%D %b %Y') date,
            DATE_FORMAT(visit_details.appointment_date, '%h:%i %p') time,
            concat("OPDN",visit_details.opd_details_id) opd_no,
            concat(staff.name," ",staff.surname) consultant
            from visit_details left join staff on staff.id = visit_details.cons_doctor where opd_details_id = ?
            `, [
        opd_id
      ])
      return {
        "status": "success",
        "messege": "prescription fetch successfully",
        "details": insertPrescription,
        "OpdDetails": getOpdDetails
      }
    } catch (error) {
      return {
        "status": "failed",
        "messege": "unable to fetch prescription",
        error
      }
    }
  }

  async update(clinicalNotes: UpdateOpdPrescriptionDto) {
    if (!clinicalNotes.hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
       await this.dynamicConnection.query(`UPDATE opd_prescription 
SET 
  medicine_name = ?, 
  frequency = ?, 
  dosage = ?, 
  duration_count = ?, 
  duration_limit = ?, 
  quantity = ?, 
  \`when\` = ?, 
  remarks = ?, 
  filled_using = ? 
WHERE 
  id = ?
`, [
        clinicalNotes.medicine_name,
        clinicalNotes.frequency,
        clinicalNotes.dosage,
        clinicalNotes.duration_count,
        clinicalNotes.duration_limit,
        clinicalNotes.quantity,
        clinicalNotes.when,
        clinicalNotes.remarks,
        clinicalNotes.filled_using,
        clinicalNotes.id
      ])
       await this.connection.query(`UPDATE opd_prescription 
SET 
  medicine_name = ?, 
  frequency = ?, 
  dosage = ?, 
  duration_count = ?, 
  duration_limit = ?, 
  quantity = ?, 
  \`when\` = ?, 
  remarks = ?, 
  filled_using = ? 
WHERE 
  hospital_id = ? AND hos_fopd_prescription_id = ?
  `, [
        clinicalNotes.medicine_name,
        clinicalNotes.frequency,
        clinicalNotes.dosage,
        clinicalNotes.duration_count,
        clinicalNotes.duration_limit,
        clinicalNotes.quantity,
        clinicalNotes.when,
        clinicalNotes.remarks,
        clinicalNotes.filled_using,
        clinicalNotes.hospital_id,
        clinicalNotes.id
      ])
      return {
        "status": "success",
        "messege": "prescription updated successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "unable to update prescription",
        "error": error
      }
    }
  }

  async remove(id: number, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {

      await this.dynamicConnection.query(`delete from opd_prescription where id = ?`, [id])
      await this.connection.query(`delete from opd_prescription where hos_fopd_prescription_id = ? and hospital_id = ?`, [id, hospital_id])
      return {
        "status": "success",
        "messege": "prescription deleted successfully"
      }
    } catch (error) {
      return {
        "status": "failed",
        "messege": "unable to deleted prescription",
        "error": error
      }
    }
  }
}
