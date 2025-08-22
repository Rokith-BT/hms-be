import { Timestamp } from 'typeorm';

export class AddAppointment {
  id: number;
  patient_id: number;
  case_reference_id: number;
  visit_details_id: number;
  date: any;
  time: string;
  priority: number;
  specialist: number;
  doctor: number;
  message: string;
  amount: string;
  appointment_status: string;
  source: string;
  is_opd: string;
  payment_mode: string;
  payment_date: string;
  is_ipd: string;
  global_shift_id: number;
  shift_id: number;
  is_queue: number;
  live_consult: string;
  created_at: Timestamp;
  Hospital_id: number;
  hos_appointment_id: number;
  appointment_status_id: any;
  appointment_cancellation_reason: string;
  txn_id: any;
  pg_ref_id: any;
  bank_ref_id: any;
  payment_gateway: any;
  payment_id: any;
  payment_reference_number: any;
  cancellationReason: any;
  received_by_name: string;
}

export enum PaymentMode {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  NEFT = 'NEFT',
  CHEQUE = 'CHEQUE',
  OTHER = 'OTHER',
}

export class AddAppointmentPayment {
  cash_transaction_id: string;
  payment_mode: string;
  Hospital_id: number;
  payment_method: string;
  card_division: string;
  card_bank_name: string;
  card_type: string;
  card_transaction_id: string;
  net_banking_division: string;
  net_banking_transaction_id: string;
  upi_id: string;
  upi_transaction_id: string;
  upi_bank_name: string;
}
