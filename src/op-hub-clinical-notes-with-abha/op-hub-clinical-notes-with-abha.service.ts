import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ClinicalNotesWithAbha } from './entities/op-hub-clinical-notes-with-abha.entity';

@Injectable()
export class OpHubClinicalNotesWithAbhaService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(clinicalNotes: ClinicalNotesWithAbha) {
    if (!clinicalNotes.hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }

    try {
      if (clinicalNotes.chiefComplaintDetails && clinicalNotes.chiefComplaintsBasic) {
        const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          clinicalNotes.hospital_id,
          clinicalNotes.chiefComplaintDetails.opd_id
        ])
        const insertDetails = await this.dynamicConnection.query(`insert into chief_complaint_details (opd_id,
    count,
    duration_limit,
    remarks,
    filled_using) values (?,?,?,?,?)`,
          [
            clinicalNotes.chiefComplaintDetails.opd_id,
            clinicalNotes.chiefComplaintDetails.count,
            clinicalNotes.chiefComplaintDetails.duration_limit,
            clinicalNotes.chiefComplaintDetails.remarks,
            clinicalNotes.chiefComplaintDetails.filled_using
          ])
        const insertDetailsAdmin = await this.connection.query(`insert into chief_complaint_details (opd_id,
    count,
    duration_limit,
    remarks,
    filled_using,
    hospital_id,
    hos_chief_complaint_details_id) values (?,?,?,?,?,?,?)`,
          [
            getOPDAdmin.id,
            clinicalNotes.chiefComplaintDetails.count,
            clinicalNotes.chiefComplaintDetails.duration_limit,
            clinicalNotes.chiefComplaintDetails.remarks,
            clinicalNotes.chiefComplaintDetails.filled_using,
            clinicalNotes.hospital_id,
            insertDetails.insertId
          ])


        for (const aa of clinicalNotes.chiefComplaintsBasic) {
          const insertBasic = await this.dynamicConnection.query(`insert into chief_complaints_basic (opd_id,
    chief_complaints_detail_id,
    complaints_name,
    filled_using
    ) values (?,?,?,?)`, [
            aa.opd_id,
            insertDetails.insertId,
            aa.complaint_name,
            aa.filled_using
          ])
          await this.connection.query(`insert into chief_complaints_basic (opd_id,
        chief_complaints_detail_id,
        complaints_name,
        filled_using,
        hospital_id,
        hos_chief_complaints_basic_id
        ) values (?,?,?,?,?,?)`, [
            getOPDAdmin.id,
            insertDetailsAdmin.insertId,
            aa.complaint_name,
            aa.filled_using,
            clinicalNotes.hospital_id,
            insertBasic.insertId
          ])
        }
      }


      if (clinicalNotes.pastTreatmentHistory && clinicalNotes.pastTreatmentHistoryDocs) {
        const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          clinicalNotes.hospital_id,
          clinicalNotes.chiefComplaintDetails.opd_id
        ])
        const insertHistory = await this.dynamicConnection.query(`insert into past_history (opd_id,
    history,
    filled_using) values (?,?,?)`,
          [
            clinicalNotes.pastTreatmentHistory.opd_id,
            clinicalNotes.pastTreatmentHistory.history,
            clinicalNotes.pastTreatmentHistory.filled_using
          ])
        const insertDetailsAdmin = await this.connection.query(`insert into past_history (opd_id,
    history,
    filled_using,
    hospital_id,
    hos_past_history_id) values (?,?,?,?,?)`,
          [
            getOPDAdmin.id,
            clinicalNotes.pastTreatmentHistory.history,
            clinicalNotes.pastTreatmentHistory.filled_using,
            clinicalNotes.hospital_id,
            insertHistory.insertId
          ])


        for (const aa of clinicalNotes.pastTreatmentHistoryDocs) {
          const insertBasic = await this.dynamicConnection.query(`insert into past_history_docs (opd_id,
    past_history_id,
    document,
    filled_using
    ) values (?,?,?,?)`, [
            aa.opd_id,
            insertHistory.insertId,
            aa.documents,
            aa.filled_using
          ])
          await this.connection.query(`insert into past_history_docs (opd_id,
        past_history_id,
        document,
        filled_using,
        hospital_id,
        hos_past_history_docs_id
        ) values (?,?,?,?,?,?)`, [
            getOPDAdmin.id,
            insertDetailsAdmin.insertId,
            aa.documents,
            aa.filled_using,
            clinicalNotes.hospital_id,
            insertBasic.insertId
          ])
        }
      }
      if (clinicalNotes.diagnosisReport) {

        for (const aa of clinicalNotes.diagnosisReport) {
          const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
            clinicalNotes.hospital_id,
            aa.opd_id
          ])
          const insertBasic = await this.dynamicConnection.query(`insert into diagnosis_report (opd_id,
                test_categories,
                sub_category,
                laboratory,
                remarks,
                filled_using
                ) values (?,?,?,?,?,?)`, [
            aa.opd_id,
            aa.test_categories,
            aa.sub_category,
            aa.laboratory,
            aa.remarks,
            aa.filled_using
          ])
          await this.connection.query(`insert into diagnosis_report (opd_id,
                test_categories,
                sub_category,
                laboratory,
                remarks,
                    filled_using,
                    hospital_id,
                    hos_diagnosis_report_id
                    ) values (?,?,?,?,?,?,?,?)`, [
            getOPDAdmin.id,
            aa.test_categories,
            aa.sub_category,
            aa.laboratory,
            aa.remarks,
            aa.filled_using,
            clinicalNotes.hospital_id,
            insertBasic.insertId
          ])
        }
      }
      if (clinicalNotes.dietPlan) {
        let aa = clinicalNotes.dietPlan
        const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          clinicalNotes.hospital_id,
          aa.opd_id
        ])
        const insertBasic = await this.dynamicConnection.query(`insert into diet_plan (opd_id,
            diet_plan,
            filled_using
            ) values (?,?,?)`, [
          aa.opd_id,
          aa.diet_plan,
          aa.filled_using
        ])
        await this.connection.query(`insert into diet_plan (opd_id,
            diet_plan,
            filled_using,
                hospital_id,
                hos_diet_plan_id
                ) values (?,?,?,?,?)`, [
          getOPDAdmin.id,
          aa.diet_plan,
          aa.filled_using,
          clinicalNotes.hospital_id,
          insertBasic.insertId
        ])
      }

      if (clinicalNotes.treatmentAdvice) {

        let aa = clinicalNotes.treatmentAdvice
        const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          clinicalNotes.hospital_id,
          aa.opd_id
        ])
        const insertBasic = await this.dynamicConnection.query(`insert into treatment_advice (opd_id,
            treatment_advice,
            filled_using
            ) values (?,?,?)`, [
          aa.opd_id,
          aa.advice,
          aa.filled_using
        ])
        await this.connection.query(`insert into treatment_advice (opd_id,
            treatment_advice,
            filled_using,
                hospital_id,
                hos_treatment_advice_id
                ) values (?,?,?,?,?)`, [
          getOPDAdmin.id,
          aa.advice,
          aa.filled_using,
          clinicalNotes.hospital_id,
          insertBasic.insertId
        ])
      }

      if (clinicalNotes.followUp) {

        let aa = clinicalNotes.followUp
        const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          clinicalNotes.hospital_id,
          aa.opd_id
        ])
        const insertBasic = await this.dynamicConnection.query(`insert into follow_up (opd_id,
            count,
            duration,
            date,
            remarks,
            filled_using
            ) values (?,?,?,?,?,?)`, [
          aa.opd_id,
          aa.count,
          aa.duration_limit,
          aa.date,
          aa.remarks,
          aa.filled_using
        ])
        await this.connection.query(`insert into follow_up (opd_id,
            count,
            duration,
            date,
            remarks,
            filled_using,
                hospital_id,
                hos_follow_up_id
                ) values (?,?,?,?,?,?,?,?)`, [
          getOPDAdmin.id,
          aa.count,
          aa.duration_limit,
          aa.date,
          aa.remarks,
          aa.filled_using,
          clinicalNotes.hospital_id,
          insertBasic.insertId
        ])
      }
      return {
        "status": "success",
        "messege": "clinical notes added successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to post clinical-notes"
      }
    }
  }

  async findAll(opd_id: any, hospital_id: any) {

    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      const getComplaintBasic = await this.dynamicConnection.query(`select * from chief_complaints_basic where opd_id = ?`, [opd_id])
      const [getComplaintdetails] = await this.dynamicConnection.query(`select * from chief_complaint_details where opd_id = ?`, [opd_id])
      const [getPastTreatmentHis] = await this.dynamicConnection.query(`select * from past_history where opd_id = ?`, [opd_id])
      const getPastHisDocs = await this.dynamicConnection.query(`select * from past_history_docs where opd_id = ?`, [opd_id])
      const getDiagnosisReport = await this.dynamicConnection.query(`select * from diagnosis_report where opd_id = ?`, [opd_id])
      const [getDietPlan] = await this.dynamicConnection.query(`select * from diet_plan where opd_id = ?`, [opd_id])
      const [getTreatmentAdvice] = await this.dynamicConnection.query(`select * from treatment_advice where opd_id = ?`, [opd_id])
      const [getFollowUp] = await this.dynamicConnection.query(`select * from follow_up where opd_id = ?`, [opd_id])
      const [getOpdDetails] = await this.dynamicConnection.query(`
select DATE_FORMAT(visit_details.appointment_date, '%D %b %Y') date,
DATE_FORMAT(visit_details.appointment_date, '%h:%i %p') time,
concat("OPDN",visit_details.opd_details_id) opd_no,
concat(staff.name," ",staff.surname) consultant
from visit_details left join staff on staff.id = visit_details.cons_doctor where opd_details_id = ?
`, [
        opd_id
      ])
      let out = {
        "OpdDetails": getOpdDetails
      }
      if (getComplaintBasic.length > 0) {
        out["chiefComplaintsBasic"] = getComplaintBasic
      }
      if (getComplaintdetails) {
        out["chiefComplaintDetails"] = getComplaintdetails

      }
      if (getPastTreatmentHis) {
        out["pastTreatmentHistory"] = getPastTreatmentHis

      }
      if (getPastHisDocs.length > 0) {
        out["pastTreatmentHistoryDocs"] = getPastHisDocs

      }
      if (getDiagnosisReport.length > 0) {
        out["diagnosisReport"] = getDiagnosisReport

      }
      if (getDietPlan) {
        out["dietPlan"] = getDietPlan

      }
      if (getTreatmentAdvice) {
        out["treatmentAdvice"] = getTreatmentAdvice

      }
      if (getFollowUp) {
        out["followUp"] = getFollowUp

      }
      return {
        "status": "success",
        "messege": "clinical fetched  successfully",
        "details": out
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to fetch clinical-notes"
      }
    }

  }

  async update(clinicalNotes: any) {

    if (!clinicalNotes.hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      if (clinicalNotes.chiefComplaintDetails && clinicalNotes.chiefComplaintsBasic) {

        await this.dynamicConnection.query(`update chief_complaint_details set 
            count = ?,
            duration_limit = ?,
            remarks = ?,
            filled_using = ? where id = ?`,
          [
            clinicalNotes.chiefComplaintDetails.count,
            clinicalNotes.chiefComplaintDetails.duration_limit,
            clinicalNotes.chiefComplaintDetails.remarks,
            clinicalNotes.chiefComplaintDetails.filled_using,
            clinicalNotes.chiefComplaintDetails.id
          ])
        await this.connection.query(`update chief_complaint_details set 
            count = ?,
            duration_limit = ?,
            remarks = ?,
            filled_using = ?
             where 
            hospital_id = ? and
            hos_chief_complaint_details_id = ?`,
          [
            clinicalNotes.chiefComplaintDetails.count,
            clinicalNotes.chiefComplaintDetails.duration_limit,
            clinicalNotes.chiefComplaintDetails.remarks,
            clinicalNotes.chiefComplaintDetails.filled_using,
            clinicalNotes.hospital_id,
            clinicalNotes.chiefComplaintDetails.id
          ])


        for (const aa of clinicalNotes.chiefComplaintsBasic) {
          if (aa.id) {
            console.log("palsu");

            await this.dynamicConnection.query(`update chief_complaints_basic set 
              complaints_name = ?,
              filled_using = ? where id = ?
             `, [
              aa.complaint_name,
              aa.filled_using,
              aa.id
            ])
            await this.connection.query(`update chief_complaints_basic set 
                  complaints_name = ?,
                  filled_using = ? where 
                  hospital_id = ? and
                  hos_chief_complaints_basic_id = ?
                  `, [
              aa.complaint_name,
              aa.filled_using,
              clinicalNotes.hospital_id,
              aa.id
            ])
          } else {
            const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
              clinicalNotes.hospital_id,
              aa.opd_id
            ])
            const [getAdminId] = await this.connection.query(`select * from chief_complaint_details where 
             hospital_id = ? and
            hos_chief_complaint_details_id = ?`, [
              clinicalNotes.hospital_id,
              clinicalNotes.chiefComplaintDetails.id
            ])
            const insertBasic = await this.dynamicConnection.query(`insert into chief_complaints_basic (opd_id,
      chief_complaints_detail_id,
      complaints_name,
      filled_using
      ) values (?,?,?,?)`, [
              aa.opd_id,
              clinicalNotes.chiefComplaintDetails.id,
              aa.complaint_name,
              aa.filled_using
            ])

            await this.connection.query(`insert into chief_complaints_basic (opd_id,
          chief_complaints_detail_id,
          complaints_name,
          filled_using,
          hospital_id,
          hos_chief_complaints_basic_id
          ) values (?,?,?,?,?,?)`, [
              getOPDAdmin.id,
              getAdminId.id,
              aa.complaint_name,
              aa.filled_using,
              clinicalNotes.hospital_id,
              insertBasic.insertId
            ])
          }

        }
      }


      if (clinicalNotes.pastTreatmentHistory && clinicalNotes.pastTreatmentHistoryDocs) {

        await this.dynamicConnection.query(`update past_history set 
            history = ?,
            filled_using = ? where id = ?`,
          [
            clinicalNotes.pastTreatmentHistory.history,
            clinicalNotes.pastTreatmentHistory.filled_using,
            clinicalNotes.pastTreatmentHistory.id
          ])

        await this.connection.query(`update past_history set 
            history = ?,
            filled_using = ? where 
            hospital_id = ? and
            hos_past_history_id = ?`,
          [
            clinicalNotes.pastTreatmentHistory.history,
            clinicalNotes.pastTreatmentHistory.filled_using,
            clinicalNotes.hospital_id,
            clinicalNotes.pastTreatmentHistory.id
          ])


        for (const aa of clinicalNotes.pastTreatmentHistoryDocs) {
          if (aa.id) {
            await this.dynamicConnection.query(`update past_history_docs set 
              document = ?,
              filled_using = ? where id = ?
              `, [
              aa.documents,
              aa.filled_using,
              aa.id
            ])
            await this.connection.query(`update past_history_docs set 
                  document = ?,
                  filled_using = ? where 
                  hospital_id = ? and 
                  hos_past_history_docs_id = ?
                  `, [
              aa.documents,
              aa.filled_using,
              clinicalNotes.hospital_id,
              aa.id
            ])
          } else {
            const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
              clinicalNotes.hospital_id,
              aa.opd_id
            ])
            const [getAdminPastTreatmentHisID] = await this.connection.query(`select id from past_history where hospital_id = ? and
            hos_past_history_id = ?`, [
              clinicalNotes.hospital_id,
              clinicalNotes.pastTreatmentHistory.id
            ])

            const insertBasic = await this.dynamicConnection.query(`insert into past_history_docs (opd_id,
      past_history_id,
      document,
      filled_using
      ) values (?,?,?,?)`, [
              aa.opd_id,
              clinicalNotes.pastTreatmentHistory.id,
              aa.documents,
              aa.filled_using
            ])
            await this.connection.query(`insert into past_history_docs (opd_id,
          past_history_id,
          document,
          filled_using,
          hospital_id,
          hos_past_history_docs_id
          ) values (?,?,?,?,?,?)`, [
              getOPDAdmin.id,
              getAdminPastTreatmentHisID.id,
              aa.documents,
              aa.filled_using,
              clinicalNotes.hospital_id,
              insertBasic.insertId
            ])
          }

        }
      }
      if (clinicalNotes.diagnosisReport) {

        for (const aa of clinicalNotes.diagnosisReport) {
          if (aa.id) {
            await this.dynamicConnection.query(`update diagnosis_report set
                      test_categories = ?,
                      sub_category = ?,
                      laboratory = ?,
                      remarks = ? ,
                      filled_using = ? where id = ?`, [
              aa.test_categories,
              aa.sub_category,
              aa.laboratory,
              aa.remarks,
              aa.filled_using,
              aa.id
            ])
            await this.connection.query(`update diagnosis_report set
                      test_categories = ?,
                      sub_category = ?,
                      laboratory = ?,
                      remarks = ?,
                          filled_using = ? where
                          hospital_id = ? and
                          hos_diagnosis_report_id = ?`, [
              aa.test_categories,
              aa.sub_category,
              aa.laboratory,
              aa.remarks,
              aa.filled_using,
              clinicalNotes.hospital_id,
              aa.id
            ])
          }
          else {
            const [getOPDAdmin] = await this.connection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
              clinicalNotes.hospital_id,
              aa.opd_id
            ])
            const insertBasic = await this.dynamicConnection.query(`insert into diagnosis_report (opd_id,
                      test_categories,
                      sub_category,
                      laboratory,
                      remarks,
                      filled_using
                      ) values (?,?,?,?,?,?)`, [
              aa.opd_id,
              aa.test_categories,
              aa.sub_category,
              aa.laboratory,
              aa.remarks,
              aa.filled_using
            ])
            await this.connection.query(`insert into diagnosis_report (opd_id,
                      test_categories,
                      sub_category,
                      laboratory,
                      remarks,
                          filled_using,
                          hospital_id,
                          hos_diagnosis_report_id
                          ) values (?,?,?,?,?,?,?,?)`, [
              getOPDAdmin.id,
              aa.test_categories,
              aa.sub_category,
              aa.laboratory,
              aa.remarks,
              aa.filled_using,
              clinicalNotes.hospital_id,
              insertBasic.insertId
            ])
          }

        }
      }
      if (clinicalNotes.dietPlan) {
        let aa = clinicalNotes.dietPlan

        await this.dynamicConnection.query(`update diet_plan set
                    diet_plan = ?,
                    filled_using = ? where id = ?`, [
          aa.diet_plan,
          aa.filled_using,
          aa.id
        ])
        await this.connection.query(`update diet_plan set
                    diet_plan = ?,
                    filled_using = ? where 
                        hospital_id = ? and
                        hos_diet_plan_id = ?`, [
          aa.diet_plan,
          aa.filled_using,
          clinicalNotes.hospital_id,
          aa.id
        ])
      }

      if (clinicalNotes.treatmentAdvice) {

        let aa = clinicalNotes.treatmentAdvice

        await this.dynamicConnection.query(`update treatment_advice set
                    treatment_advice = ?,
                    filled_using = ? where id = ?`, [
          aa.advice,
          aa.filled_using,
          aa.id
        ])
        await this.connection.query(`update treatment_advice set
                    treatment_advice = ?,
                    filled_using = ? where
                        hospital_id = ? and 
                        hos_treatment_advice_id = ?`, [
          aa.advice,
          aa.filled_using,
          clinicalNotes.hospital_id,
          aa.id
        ])
      }

      if (clinicalNotes.followUp) {

        let aa = clinicalNotes.followUp

        await this.dynamicConnection.query(`update follow_up set
                    count = ?,
                    duration = ?,
                    date = ?,
                    remarks = ?,
                    filled_using = ? where id = ?`, [
          aa.count,
          aa.duration_limit,
          aa.date,
          aa.remarks,
          aa.filled_using,
          aa.id
        ])
        await this.connection.query(`update follow_up set
                    count = ?,
                    duration = ?,
                    date = ?,
                    remarks = ?,
                    filled_using = ? where
                        hospital_id = ? and 
                        hos_follow_up_id = ?`, [
          aa.count,
          aa.duration_limit,
          aa.date,
          aa.remarks,
          aa.filled_using,
          clinicalNotes.hospital_id,
          aa.id
        ])
      }
      return {
        "status": "success",
        "messege": "clinical notes updated successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to update clinical-notes"
      }
    }

  }

  async delCompBasic(id: any, hospital_id: any) {


    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }

    try {
      await this.dynamicConnection.query(`delete from chief_complaints_basic where id = ?`, [id])
      this.connection.query(`delete from chief_complaints_basic where hospital_id = ? and hos_chief_complaints_basic_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "chief complaint basic deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete chief complaint basic"
      }
    }
  }
  async delCompDetail(id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }

    try {
      await this.dynamicConnection.query(`delete from chief_complaint_details where id = ?`, [id])
      this.connection.query(`delete from chief_complaint_details where hospital_id = ? and hos_chief_complaint_details_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "chief complaint detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete chief complaint detail"
      }
    }
  }

  async delTreatHis(id: any, hospital_id: any) {


    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      await this.dynamicConnection.query(`delete from past_history where id = ?`, [id])
      this.connection.query(`delete from past_history where hospital_id = ? and hos_past_history_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "past treatment history detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete past treatment history detail"
      }
    }
  }

  async delTreatHisDocs(id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      await this.dynamicConnection.query(`delete from past_history_docs where id = ?`, [id])
      this.connection.query(`delete from past_history_docs where hospital_id = ? and hos_past_history_docs_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "past treatment history documents detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete past treatment history documents"
      }
    }
  }

  async delTreatmentAdvice(id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      await this.dynamicConnection.query(`delete from treatment_advice where id = ?`, [id])
      this.connection.query(`delete from treatment_advice where hospital_id = ? and hos_treatment_advice_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "treatment advice detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete treatment advice"
      }
    }
  }
  async delDiagReport(id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      await this.dynamicConnection.query(`delete from diagnosis_report where id = ?`, [id])
      this.connection.query(`delete from diagnosis_report where hospital_id = ? and hos_diagnosis_report_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "treatment advice detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete treatment advice"
      }
    }
  }
  async delDietPlan(id: any, hospital_id: any) {


    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }

    try {
      await this.dynamicConnection.query(`delete from diet_plan where id = ?`, [id])
      this.connection.query(`delete from diet_plan where hospital_id = ? and hos_diet_plan_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "diet plan detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete diet plan"
      }
    }
  }
  async delFollowUp(id: any, hospital_id: any) {
    if (!hospital_id) {
      return {
        "status": "failed",
        "messege": "enter hospital_id to post clinical notes"
      }
    }
    try {
      await this.dynamicConnection.query(`delete from follow_up where id = ?`, [id])
      this.connection.query(`delete from follow_up where hospital_id = ? and hos_follow_up_id = ?`, [hospital_id, id])

      return {
        "status": "success",
        "messege": "follow up detail deleted successfully"
      }

    } catch (error) {
      return {
        "status": "failed",
        "messege": "failed to delete follow up"
      }
    }
  }

}
