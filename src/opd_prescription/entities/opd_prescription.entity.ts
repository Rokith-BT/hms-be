export class OpdPrescription {

    id:number;
    ipd_id:number;
    visit_details_id:number;
    header_note:string;
    footer_note:string;
    finding_description:string;
    is_finding_print:string;
    date:Date;
    generated_by:number;
    prescribe_by:number;
    Hospital_id:number;
    hos_ipd_prescription_basic_id:number;
    ipd_prescription_basic_id:number;
    pathology_id:number;
    radiology_id:number;
    hos_ipd_prescription_test_id:number;
    basic_id:number;
    pharmacy_id:number;
    dosage:number;
    dose_interval_id:number;
    dose_duration_id:number;
    instruction:string;
    hos_ipd_prescription_details_id:number;
    prescriptions:[{
        dosage:string;
        pharmacy_id:number;
        dose_interval_id:number;
        dose_duration_id:number;
        instruction:string;

    }];
}
