import { Timestamp } from "typeorm";

export class EmrAppointment {
    id:number;
    patient_id:number;
    case_reference_id:number;
    visit_details_id:number;
    date:any;
    time:string;
    priority:number;
    specialist:number;
    doctor:number;
    message:string;
    amount:string;
    appointment_status:string;
    source:string;
    is_opd:string;
    payment_mode:string;
    payment_date:string;
    is_ipd:string;
    global_shift_id:number;
    shift_id:number;
    is_queue:number;
    live_consult:string;
    created_at:Timestamp;
    Hospital_id:number;
    hos_appointment_id:number;
    appointment_status_id:number;
    appointment_cancellation_reason:string;
    txn_id:any;
    pg_ref_id:any;
    bank_ref_id:any;
    abha_address:string;
    updateValues:any
    
    payment_gateway:any
    payment_id:any
    payment_reference_number:any
}
