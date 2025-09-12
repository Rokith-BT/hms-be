import { Timestamp } from 'typeorm';

export class FinanceIncome {
  id: number;
  inc_head_id: number;
  name: string;
  invoice_no: string;
  date: Date;
  amount: number;
  note: Text;
  is_deleted: string;
  documents: string;
  generated_by: number;
  is_active: string;
  created_at: Timestamp;
  hos_income_id: number;
  hospital_id: number;
}
