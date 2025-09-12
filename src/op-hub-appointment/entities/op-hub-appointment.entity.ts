import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class Appointment {
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
  Hospital_id: number;
  hos_appointment_id: number;
  txn_id: string;
  pg_ref_id: string;
  bank_ref_id: string;
  appointment_status_id: any;
  cancellationReason: any;
  additional_charge: any;
  additional_charge_note: any;
  discount_percentage: any;
  discount_amount: any;
  total: any;
  payment_gateway?: string;
  payment_id?: string;
  payment_reference_number?: string;
}
export class PostAppointment {
  @ApiProperty({
    required: true,
    description: 'patient id',
    example: 4,
    type: Number,
  })
  patient_id: number;

  @ApiProperty({
    required: true,
    description: 'date of appointment',
    example: '2024-09-09',
    type: Date,
    format: 'date',
  })
  date: any;

  @ApiProperty({
    required: true,
    description: 'staff name of the person who is creating the appointment',
    example: 'Elakkiya S',
    type: 'string',
  })
  received_by_name: string;

  @ApiProperty({
    required: true,
    description: 'Time of appointment',
    example: '11:11:11',
    format: 'time',
  })
  time: string;

  @ApiProperty({
    required: true,
    description:
      'id of the doctor for whom the appointment was going to be sheduled',
    example: 98,
    type: Number,
  })
  doctor: number;

  @ApiProperty({
    required: true,
    description: 'patient id',
    example: 4,
    enum: ['UPI', 'Cash', 'Offline', 'Paylater', 'cheque'],
  })
  payment_mode: string;

  @ApiProperty({
    required: true,
    description: 'timestamp of payment',
    example: '2024-01-30 11:11:11',
  })
  payment_date: string;

  @ApiProperty({
    required: true,
    description: 'global shift id of doctors',
    example: 21,
    type: Number,
  })
  global_shift_id: number;

  @ApiProperty({
    required: true,
    description: 'shift id of doctors (i.e) slot id',
    example: 4,
    type: Number,
  })
  shift_id: number;

  @ApiProperty({
    required: true,
    description: 'live consultation',
    example: 'no',
    enum: ['yes', 'no'],
    type: 'string',
  })
  live_consult: string;

  @ApiProperty({
    required: true,
    description: 'hospital id which is received during login',
    example: 1,
    type: Number,
  })
  Hospital_id: number;

  @ApiProperty({
    required: false,
    description:
      'txn id received after payment used only during payment gateway access',
    example: '20241671721130494230',
    type: 'string',
  })
  @ApiHideProperty()
  txn_id: string;

  @ApiProperty({
    required: false,
    description: 'same as txn id',
    example: '20241671721130494230',
    type: 'string',
  })
  @ApiHideProperty()
  pg_ref_id: string;
  @ApiProperty({
    required: false,
    description: 'same as txn id',
    example: '20241671721130494230',
    type: 'string',
  })
  @ApiHideProperty()
  bank_ref_id: string;
  @ApiProperty({
    required: true,
    description: 'name of the payment gateway',
    example: 'razorpay',
    format: 'string',
  })
  payment_gateway?: string;
  @ApiProperty({
    required: true,
    description: 'payment_id received from payment gateway',
    example: 'pay_0834jljfdh',
    format: 'string',
  })
  payment_id?: string;
  @ApiProperty({
    required: true,
    description:
      'reference number received from payment gateway response after capturing the payment',
    example: '654598326',
    format: 'string',
  })
  payment_reference_number?: string;
}

class InsertedDetails {
  @ApiProperty({
    example: 'APPN553',
    description: 'The unique ID of the appointment',
  })
  id: string;

  @ApiProperty({ example: 3, description: 'The ID of the patient' })
  patient_id: number;

  @ApiProperty({
    example: 'Elakkiya S',
    description: 'The name of the patient',
  })
  patient_name: string;

  @ApiProperty({ example: 'Female', description: 'The gender of the patient' })
  gender: string;

  @ApiProperty({ example: 24, description: 'The age of the patient' })
  age: number;

  @ApiProperty({
    example: '7339120466',
    description: 'The mobile number of the patient',
  })
  mobileno: string;

  @ApiProperty({
    example: 'elakkiyas2806@gmail.com',
    description: 'The email of the patient',
  })
  email: string;

  @ApiProperty({ example: null, description: 'The ABHA number of the patient' })
  ABHA_number: string | null;

  @ApiProperty({
    example: 'Offline Consultation',
    description: 'Type of consultation',
  })
  consultingType: string;

  @ApiProperty({
    example: 'Dr. Matheshwari N',
    description: 'The name of the doctor',
  })
  doctorName: string;

  @ApiProperty({ example: 98, description: 'The ID of the doctor' })
  doctor_id: number;

  @ApiProperty({
    example: 'cardiologist',
    description: 'Specialization of the doctor',
  })
  doctorSpecialist: string;

  @ApiProperty({
    example: 'Offline',
    description: 'The source of the appointment',
  })
  source: string;

  @ApiProperty({ example: 21, description: 'The global shift ID' })
  global_shift_id: number;

  @ApiProperty({ example: 387, description: 'The shift ID' })
  shift_id: number;

  @ApiProperty({ example: 'APPN553', description: 'The appointment ID' })
  appointment_id: string;

  @ApiProperty({
    example: '1st Jun 2024',
    description: 'The date of the appointment in a human-readable format',
  })
  appointmentDate: string;

  @ApiProperty({
    example: '2024-06-01',
    description: 'The date of the appointment in ISO format',
  })
  date: string;

  @ApiProperty({
    example: '03:00 PM',
    description: 'The time of the appointment in a human-readable format',
  })
  appointmentTime: string;

  @ApiProperty({
    example: '15:00:00',
    description: 'The time of the appointment in 24-hour format',
  })
  time: string;

  @ApiProperty({
    example: '10:19 AM - 10:47 AM',
    description: 'The appointment slot',
  })
  slot: string;

  @ApiProperty({
    example: 'Reserved',
    description: 'The status of the appointment',
  })
  appointment_status: string;

  @ApiProperty({
    example: '2',
    description: 'The ID of the appointment status',
  })
  appointment_status_id: string;

  @ApiProperty({
    example: 0,
    description: 'Indicates if the token has been verified',
  })
  is_token_verified: number;

  @ApiProperty({
    example: 0,
    description: 'Indicates if the consultation has been closed',
  })
  is_consultation_closed: number;

  @ApiProperty({
    example: '#FFC52F',
    description: 'Color code representing the appointment status',
  })
  color_code: string;

  @ApiProperty({ example: null, description: 'The token number' })
  tokenNumber: string | null;

  @ApiProperty({ example: null, description: 'Any additional messages' })
  message: string | null;

  @ApiProperty({ example: 200, description: 'The consultation fees' })
  consultFees: number;

  @ApiProperty({ example: 12, description: 'Tax percentage applicable' })
  taxPercentage: number;

  @ApiProperty({ example: '24.00', description: 'The tax amount' })
  taxAmount: string;

  @ApiProperty({ example: 224, description: 'The net amount to be paid' })
  netAmount: number;

  @ApiProperty({ example: null, description: 'Balance amount if any' })
  balanceAmount: string | null;

  @ApiProperty({ example: 'TRID808', description: 'The transaction ID' })
  transactionID: string;

  @ApiProperty({ example: 'UPI', description: 'The payment mode used' })
  payment_mode: string;

  @ApiProperty({
    example: '2024-01-30T05:41:11.000Z',
    description: 'The payment date in ISO format',
  })
  payment_date: string;

  @ApiProperty({
    example: 'Payment done.',
    description: 'The status of the payment',
  })
  payment_status: string;
}

export class SuccessResponse {
  @ApiProperty({
    example: 'success',
    description: 'The status of the response',
  })
  status: string;

  @ApiProperty({
    example: 'Appointment booked successfully',
    description: 'A message indicating the success of the operation',
  })
  message: string;

  @ApiProperty({
    type: InsertedDetails,
    description: 'Details of the inserted appointment',
  })
  inserted_details: InsertedDetails;
}

export class ErrorResponse400 {
  @ApiProperty({
    example: 'Unexpected end of JSON input',
    description: 'Description of the error that occurred',
  })
  message: string;

  @ApiProperty({ example: 'Bad Request', description: 'General error type' })
  error: string;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;
}

export class ErrorResponse500 {
  @ApiProperty({
    example: 'Internal server error',
    description: 'Description of the error that occurred',
  })
  message: string;

  @ApiProperty({ example: 500, description: 'HTTP status code' })
  statusCode: number;
}

export class UpdateAppointment {
  @ApiProperty({
    required: true,
    description: 'patient id',
    example: 4,
    type: Number,
  })
  patient_id: number;

  @ApiProperty({
    required: true,
    description: 'date of appointment',
    example: '2024-09-09',
    type: Date,
    format: 'date',
  })
  date: any;

  @ApiProperty({
    required: true,
    description: 'Time of appointment',
    example: '11:11:11',
    format: 'time',
  })
  time: string;

  @ApiProperty({
    required: true,
    description:
      'id of the doctor for whom the appointment was going to be sheduled',
    example: 98,
    type: Number,
  })
  doctor: number;

  @ApiProperty({
    required: true,
    description: 'staff name of the person who is creating the appointment',
    example: 'Elakkiya S',
    type: 'string',
  })
  received_by_name: string;

  @ApiProperty({
    required: true,
    description: 'patient id',
    example: 4,
    enum: ['UPI', 'Cash', 'Offline', 'Paylater', 'cheque'],
  })
  payment_mode: string;

  @ApiProperty({
    required: true,
    description: 'timestamp of payment',
    example: '2024-01-30 11:11:11',
  })
  payment_date: string;

  @ApiProperty({
    description: 'The new status of the appointment',
    example: 'Confirmed',
  })
  appointment_status: string;

  @ApiProperty({
    description: 'The ID corresponding to the appointment status',
    example: 1,
  })
  appointment_status_id: any;

  @ApiProperty({
    required: true,
    description: 'global shift id of doctors',
    example: 21,
    type: Number,
  })
  global_shift_id: number;

  @ApiProperty({
    required: true,
    description: 'shift id of doctors (i.e) slot id',
    example: 4,
    type: Number,
  })
  shift_id: number;

  @ApiProperty({
    required: true,
    description: 'live consultation',
    example: 'no',
    enum: ['yes', 'no'],
    type: 'string',
  })
  live_consult: string;

  @ApiProperty({
    required: true,
    description: 'hospital id which is received during login',
    example: 1,
    type: Number,
  })
  Hospital_id: number;

  @ApiProperty({
    required: false,
    description:
      'txn id received after payment used only during payment gateway access',
    example: '20241671721130494230',
    type: 'string',
  })
  @ApiHideProperty()
  txn_id: string;

  @ApiProperty({
    required: false,
    description: 'same as txn id',
    example: '20241671721130494230',
    type: 'string',
  })
  @ApiHideProperty()
  pg_ref_id: string;
  @ApiProperty({
    required: false,
    description: 'same as txn id',
    example: '20241671721130494230',
    type: 'string',
  })
  @ApiHideProperty()
  bank_ref_id: string;
}

export class StatusChangePatch {
  @ApiProperty({
    description: 'The new status of the appointment',
    example: 'Confirmed',
  })
  appointment_status: string;

  @ApiProperty({
    description: 'The ID corresponding to the appointment status',
    example: 1,
  })
  appointment_status_id: any;

  @ApiProperty({
    description: 'The ID of the hospital where the appointment is scheduled',
    example: 123,
  })
  Hospital_id: number;
}

export class UpdateStatusResponse200 {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Appointment Status Updated successfully' })
  message: string;
}

export class CancelAppointment {
  @ApiProperty({
    description: 'The ID of the hospital where the appointment was made.',
    type: Number,
  })
  Hospital_id: number;

  @ApiProperty({
    description: 'The reason for cancelling the appointment.',
    type: String,
  })
  cancellationReason: string; // Change `any` to `string` for better type safety
}

export class CancelAppointmentResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Appointment Status Updated successfully' })
  message: string;
}
export class CancelAppointmentResponse200 {
  @ApiProperty({ type: [CancelAppointmentResponse] }) // Specify that it's an array of responses
  data: CancelAppointmentResponse[];
}

export class charge {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'charges modified successfully' })
  message: string;
}
export class chargeout {
  @ApiProperty({ type: [charge] }) // Specify that it's an array of responses
  data: charge[];
}

export class UpdateAppointmentcharge {
  @ApiProperty({ example: 1, description: 'ID of the hospital' })
  Hospital_id: number;

  @ApiProperty({ example: 200, description: 'Additional charge amount' })
  additional_charge: any; // You can specify a more specific type if known

  @ApiProperty({
    example: 'Late evening consult charge',
    description: 'Notes for the additional charge',
  })
  additional_charge_note: any; // You can specify a more specific type if known

  @ApiProperty({ example: 10, description: 'Discount percentage to apply' })
  discount_percentage: any; // You can specify a more specific type if known

  @ApiProperty({ example: 50, description: 'Total discount amount' })
  discount_amount: any; // You can specify a more specific type if known

  @ApiProperty({
    example: 500,
    description: 'Total amount after charges and discounts',
  })
  total: any; // You can specify a more specific type if known
}

// [
//     {
//         "status": "success",
//         "message": "charges modified successfully"
//     }
// ]

export class UpdatedValue {
  @ApiProperty({ example: 3 })
  patient_id: number;

  @ApiProperty({ example: 'Elakkiya S' })
  patient_name: string;

  @ApiProperty({ example: 'Female' })
  gender: string;

  @ApiProperty({ example: 24 })
  age: number;

  @ApiProperty({ example: '7339120466' })
  mobileno: string;

  @ApiProperty({ example: 'elakkiyas2806@gmail.com' })
  email: string;

  @ApiProperty({ nullable: true, example: null })
  ABHA_number: string | null;

  @ApiProperty({ example: 'Offline Consultation' })
  consultingType: string;

  @ApiProperty({ example: 'Dr. Matheshwari N' })
  doctorName: string;

  @ApiProperty({ example: 98 })
  doctor_id: number;

  @ApiProperty({ example: 'cardiologist' })
  doctorSpecialist: string;

  @ApiProperty({ example: 'Offline' })
  source: string;

  @ApiProperty({ example: 'APPN554' })
  appointment_id: string;

  @ApiProperty({ example: '16th May 2024' })
  appointmentDate: string;

  @ApiProperty({ example: '2024-05-15T18:30:00.000Z' })
  date: string;

  @ApiProperty({ example: '11:11 AM' })
  appointmentTime: string;

  @ApiProperty({ example: '10:19 AM - 10:47 AM' })
  slot: string;

  @ApiProperty({ example: 'Requested' })
  appointment_status: string;

  @ApiProperty({ example: '1' })
  appointment_status_id: string;

  @ApiProperty({ example: '#F59E0B' })
  color_code: string;

  @ApiProperty({ nullable: true, example: null })
  tokenNumber: string | null;

  @ApiProperty({ nullable: true, example: null })
  message: string | null;

  @ApiProperty({ example: 200 })
  consultFees: number;

  @ApiProperty({ example: 12 })
  taxPercentage: number;

  @ApiProperty({ example: '24.00' })
  taxAmount: string;

  @ApiProperty({ example: 224 })
  netAmount: number;

  @ApiProperty({ nullable: true, example: null })
  balanceAmount: number | null;

  @ApiProperty({ example: 809 })
  transactionID: number;

  @ApiProperty({ example: 'UPI' })
  payment_mode: string;

  @ApiProperty({ example: '2024-01-30T05:41:11.000Z' })
  payment_date: string;

  @ApiProperty({ example: 'Payment done.' })
  payment_status: string;
}

export class UpdateAppointmentResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Appointment updated successfully.' })
  message: string;

  @ApiProperty({ type: UpdatedValue })
  updated_value: UpdatedValue;
}

export class AddAppointmentPayment {
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
  cash_transaction_id: string;
}
