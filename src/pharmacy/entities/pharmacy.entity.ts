export class Pharmacy {
  id: number;
  medicine_name: string;
  medicine_category_id: number;
  medicine_image: string;
  medicine_company: string;
  medicine_composition: string;
  medicine_group: string;
  unit: string;
  min_level: string;
  reorder_level: string;
  vat: any;
  unit_packing: string;
  vat_ac: string;
  note: string;
  is_active: string;
  Hospital_id: number;
  hos_pharmacy_id: number;
  medicine_batch_details_id: number;
  pharmacy_id: number;
  outward_date: Date;
  expiry_date: Date;
  batch_no: string;
  quantity: string;
  hos_medicine_bad_stock_id: number;
}
