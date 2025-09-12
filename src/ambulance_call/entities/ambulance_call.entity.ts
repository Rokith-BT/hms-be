export class AmbulanceCall {

    id:number;
    vehicle_id:number;
    patient_id:number;
    call_from:string;
    call_to:string;
    case_reference_id:number;
    contact_no:string;
    address:string;
    vehicle_model:string;
    driver:string;
    date:Date;
    charge_category_id:number;
    charge_id:number;
    standard_charge:any;
    note:string;
    tax_percentage:any;
    amount:any;
    net_amount:any;
    transaction_id:number;
    generated_by:number;
    type:string;
    section:string;
    ambulance_call_id:number;
    payment_mode:string;
    cheque_no:string;
    cheque_date:Date;
    payment_date:Date;
    attachment:string;
    attachment_name:string;
    received_by:number;
    hospital_id:number;

}
