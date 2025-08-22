export class ComponentIssue {

    id:number;
    patient_id:number;
    case_reference_id:number;
    blood_donor_cycle_id:number;
    date_of_issue:Date;
    hospital_doctor:number;
    reference:string;
    charge_id:number;
    standard_charge:any;
    tax_percentage:any;
    discount_percentage:any;
    amount:any;
    net_amount:any;
    institution:string;
    technician:string;
    remark:string;
    generated_by:number;
    type:string;
    section:string;
    payment_mode:string;
    opd_id:number;
    ipd_id:number;
    blood_issue_id:number;
    cheque_no:string;
    cheque_date:Date;
    payment_date:Date;
    attachment:string;
    attachment_name:string;
    note:string;
    received_by:number;
    hospital_id:number;

}
