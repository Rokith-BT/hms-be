export class InternalOpdPayment {
  id: number;
  payment_date: Date;
  note: string;
  payment_mode: string;
  amount: number;
  opd_id: number;
  patient_id: number;
  received_by: number;
  Hospital_id: number;
  hos_transaction_id: number;
  payment_gateway: any;
  payment_reference_number: any;
  payment_id: any;
  payment_status: string;
  balance: string;
  transaction_id: number;
  total: string;
  appointment_id: number;
  received_by_name: string;
}

export class InternalOpdPaymentv3 {
  id: number;
  payment_date: Date;
  note: string;
  payment_mode: string;
  amount: number;
  opd_id: number;
  patient_id: number;
  received_by: number;
  Hospital_id: number;
  hos_transaction_id: number;
  payment_gateway: any;
  payment_reference_number: any;
  payment_id: any;
  payment_status: string;
  balance: string;
  transaction_id: number;
  total: string;
  appointment_id: number;
  received_by_name: string;

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
