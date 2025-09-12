import { Timestamp } from "typeorm";

export class EmrAddNewPatientWithAbhaQr {
    hidn:string;
    hid:string;
    name:string;
    gender:string;
    statelgd:number;
    distlgd:number;
    dob:any;
    'state name':string;
    district_name:string;
    mobile:string;
    address:string;
    abha_address:string;
    guardian_name:string;
    blood_bank_product_id:number;
    emergency_mobile_no:string;
    email:string;
    hospital_id:number
}


export class Patient {
    id: number;
    lang_id: number;
    patient_name: string;
    dob: Date;
    age: number;
    month: number;
    day: number;
    image: string;
    mobileno: string;
    email: string;
    gender: string;
    marital_status: string;
    blood_group: string;
    blood_bank_product_id: number;
    address: string;
    guardian_name: string;
    patient_type: string;
    ABHA_number: string;
    known_allergies: string;
    note: string;
    is_ipd: string;
    app_key: string;
    insurance_id: string;
    insurance_validity: Date;
    is_dead: string;
    is_active: string;
    disable_at: Date;
    created_at: Date;
    emergency_mobile_no: string;
    state_code:number;
    state_name:string;
    district_name:string;
    district_code:number;
    pincode:string; 
    dial_code:string
    salutation:string
    emergency_dial_code:string
    abha_address:string
    
    hospital_id:any


}


export class Appointment {
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
}