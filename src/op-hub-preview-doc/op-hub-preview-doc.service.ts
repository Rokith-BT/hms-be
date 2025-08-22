import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubPreviewDocService { 

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

 async findAll(opd_id : any, hospital_id : any) {

    if(!hospital_id){
      return{
          "status":"failed",
          "messege":"enter hospital_id to post clinical notes"
      }
      }
        try {
          const [getManualVitals] = await this.dynamicConnection.query(`select  coalesce(spo2,"") spo2,
    coalesce(respiration,"") respiration,
    coalesce(temperature,"") temperature,
    coalesce(pulse,"") pulse,
    coalesce(weight,"") weight,
   coalesce(height,"")height,
    coalesce(bp,"")bp from visit_details where opd_details_id = ?`,[opd_id])

    const insertPrescription = await this.dynamicConnection.query(`select * from opd_prescription where opd_id = ?`,[opd_id])


const getComplaintBasic = await this.dynamicConnection.query(`select * from chief_complaints_basic where opd_id = ?`,[opd_id])
const [getComplaintdetails] = await this.dynamicConnection.query(`select * from chief_complaint_details where opd_id = ?`,[opd_id])
const [getPastTreatmentHis] = await this.dynamicConnection.query(`select * from past_history where opd_id = ?`,[opd_id])
const getPastHisDocs = await this.dynamicConnection.query(`select * from past_history_docs where opd_id = ?`,[opd_id])
const getDiagnosisReport = await this.dynamicConnection.query(`select * from diagnosis_report where opd_id = ?`,[opd_id])
const [getDietPlan] = await this.dynamicConnection.query(`select * from diet_plan where opd_id = ?`,[opd_id])
const [getTreatmentAdvice] = await this.dynamicConnection.query(`select * from treatment_advice where opd_id = ?`,[opd_id])
const [getFollowUp] = await this.dynamicConnection.query(`select id,opd_id,
  count,duration,
 DATE_FORMAT(date, '%D %b %Y') date,
 date(date) bundleDate,
  remarks,
  filled_using,
  created_at
   from follow_up where opd_id = ?`,[opd_id])
const [getOpdDetails] = await this.dynamicConnection.query(`
select DATE_FORMAT(visit_details.appointment_date, '%D %b %Y') date,
date(visit_details.appointment_date) bundleDate,
DATE_FORMAT(visit_details.appointment_date, '%h:%i %p') time,
concat("OPDN",visit_details.opd_details_id) opd_no,
concat(staff.name," ",staff.surname) consultant
from visit_details left join staff on staff.id = visit_details.cons_doctor where opd_details_id = ?
`,[
  opd_id
])
const getDeviceVitals = await this.dynamicConnection.query(`select * from VT_Device_Readings where opd_id = ?`,[opd_id])
let out : { OpdDetails: any; [key: string]: any }= {  "OpdDetails":getOpdDetails
}
if(getComplaintBasic.length > 0){
out["chiefComplaintsBasic"] = getComplaintBasic
}
if(getComplaintdetails){
    out["chiefComplaintDetails"] = getComplaintdetails

}
if(getPastTreatmentHis){
    out["pastTreatmentHistory"] = getPastTreatmentHis

}
if(getPastHisDocs.length > 0){
    out["pastTreatmentHistoryDocs"] = getPastHisDocs

}
if(getDiagnosisReport.length > 0){
    out["diagnosisReport"] = getDiagnosisReport

}
if(getDietPlan){
    out["dietPlan"] = getDietPlan

}
if(getTreatmentAdvice){
    out["treatmentAdvice"] = getTreatmentAdvice

}
if(getFollowUp){
    out["followUp"] = getFollowUp

}

const [getAdminPat_id] = await this.dynamicConnection.query(`select patient_id from opd_details where id = ?`,[opd_id])
const [getDocId] = await this.dynamicConnection.query(`select cons_doctor from visit_details where opd_details_id = ?`,[opd_id])
const [getDoctorDetails] = await this.dynamicConnection.query(`select concat(staff.name," ",staff.surname) doctorName,staff.employee_id,staff.gender from staff where id = ?`,[
  getDocId.cons_doctor
])
const [PatDetails] = await this.dynamicConnection.query(`select patients.id,
  coalesce(patients.patient_name,"-") patientName,
  coalesce(DATE_FORMAT(patients.dob, '%D %b %Y'),"-") dob,
  date(patients.dob) bundleDate,
  coalesce(patients.age,"-") age,
  coalesce(patients.mobileno,"-") mobileno,
  coalesce(patients.email,"-") email,
  coalesce(patients.gender,"-") gender,
    coalesce(patients.abha_address,"-") abha_address,
  coalesce(patients.address,"-") address,
  coalesce(blood_bank_products.name,"-") patient_blood_group from patients 
            left join blood_bank_products on 
            patients.blood_bank_product_id = blood_bank_products.id 
            where patients.id = ?`,[getAdminPat_id.patient_id])
const [document_uploaded] = await this.dynamicConnection.query(`SELECT case_sheet_document FROM visit_details WHERE opd_details_id = ?
`,[
  opd_id
]) 
let value = await document_uploaded.case_sheet_document
let Document_status
if(value === null || value === undefined || value.trim() === ''){
  Document_status = false
}else{
  Document_status = true
}
let clinicalnotes =  out
let prescription = insertPrescription
let vitals = getManualVitals
let dispatch = {
  "patient_details":PatDetails,
  "doctor_details":getDoctorDetails,
  "clinical_notes":clinicalnotes,
  "prescription":prescription,
  "vitals":vitals,
  "is_document_uploaded":Document_status
}
if(getDeviceVitals.length > 0){
  dispatch["vitals-from-device"] = getDeviceVitals

}
    return{
      "status":"success",
      "message":"preview fetched succesfully",
      "details":dispatch
    }
        } catch (error) {
          return{
            "status":"failed",
            "message":"unable to fetch document preview",
            error
          }
        }
        }

}
