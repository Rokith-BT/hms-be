import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class AddCharge {
  @ApiProperty({ description: 'The date of the charge', example: '2024-06-06' })
  date: Date;

  @ApiProperty({ description: 'Quantity of the charge', example: 1 })
  qty: number;

  @ApiProperty({ description: 'Identifier for the charge', example: 156 })
  charge_id: number;

  @ApiProperty({ description: 'Standard charge amount', example: 90 })
  standard_charge: number;

  @ApiProperty({ description: 'Tax amount', example: 12 })
  tax: number;

  @ApiProperty({ description: 'Total amount after tax', example: 100.8 })
  amount: number;

  @ApiProperty({
    description: 'Additional notes about the charge',
    example: 'test',
  })
  note: string;

  @ApiProperty({ description: 'Identifier for the patient', example: 3 })
  patient_id: any; // Replace 'any' with a specific type if available

  @ApiProperty({ description: 'Identifier for the hospital', example: 1 })
  Hospital_id: number;

  @ApiProperty({ description: 'Any additional charges', example: 100 })
  additional_charge: any; // Replace 'any' with a specific type if available

  @ApiProperty({
    description: 'Notes about the additional charge',
    example: '',
  })
  additional_charge_note: any; // Replace 'any' with a specific type if available

  @ApiProperty({ description: 'Discount percentage', example: 5 })
  discount_percentage: any; // Replace 'any' with a specific type if available

  @ApiProperty({ description: 'Discount amount', example: 100 })
  discount_amount: any; // Replace 'any' with a specific type if available

  @ApiProperty({
    description: 'Total amount after discounts and charges',
    example: 100,
  })
  total: any; // Replace 'any' with a specific type if available

  @ApiProperty({
    description: 'section id under which the charge to be added',
    example: 100,
  })
  sectionID: any;
}

export class Billing {
  date: Date;
  ipd_id: number;
  opd_id: number;
  qty: number;
  charge_id: number;
  standard_charge: number;
  tpa_charge: number;
  tax: number;
  apply_charge: number;
  amount: number;
  note: string;
  patient_id: any;
  Hospital_id: number;
  hos_patient_charges_id: number;
  payment_status: string;
  txn_id: any;
  pg_ref_id: any;
  bank_ref_id: any;
  payment_mode: any;
  payment_date: any;
  additional_charge: any;
  additional_charge_note: any;
  discount_percentage: any;
  discount_amount: any;
  total: any;
}
export class makepayment {
  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 2 })
  patient_id: any;

  @ApiProperty({ example: 'cash' })
  payment_mode: any;

  @ApiProperty({ example: '2024-09-06' })
  payment_date: any;

  @ApiProperty({ example: 'Elakkiya S' })
  received_by_name: string;

  @ApiProperty({ example: 'APPPN112' })
  sectionId: string;

  @ApiProperty({
    example: `[
        {
            "patient_charge_id": 1874,
            "date": "25th May 2025",
            "section": "IPD",
            "appointment_status_id": null,
            "section_id": "IPDN51",
            "chargeDescription": "Booking Charges - Booking",
            "qty": 1,
            "charges": 1,
            "taxPercentage": 10,
            "discount_amount": 0,
            "discount_percentage": 0,
            "total": 1.1,
            "additional_charge": 0
        },
        {
            "patient_charge_id": 1875,
            "date": "25th May 2025",
            "section": "APPOINTMENT",
            "appointment_status_id": "5",
            "section_id": "APPN1566",
            "chargeDescription": "Booking Charges - Booking",
            "qty": 1,
            "charges": 1,
            "taxPercentage": 10,
            "discount_amount": 0,
            "discount_percentage": 0,
            "total": 1.1,
            "additional_charge": 0
        }
    ]`,
  })
  paymentDetails: any;

  @ApiProperty({ example: 'Payment for services rendered' })
  totalDue: string;
  @ApiHideProperty()
  txn_id: any;

  @ApiHideProperty()
  pg_ref_id: any;

  @ApiHideProperty()
  bank_ref_id: any;
}

export class UpdateCharge {
  @ApiProperty({ description: 'Quantity of the charge', example: 1 })
  qty: number;

  @ApiProperty({ description: 'Identifier for the charge', example: 156 })
  charge_id: number;

  @ApiProperty({ description: 'Standard charge amount', example: 90 })
  standard_charge: number;

  @ApiProperty({ description: 'Tax amount', example: 12 })
  tax: number;

  @ApiProperty({ description: 'Total amount after tax', example: 100.8 })
  amount: number;

  @ApiProperty({ description: 'Identifier for the hospital', example: 1 })
  Hospital_id: number;

  @ApiProperty({ description: 'Any additional charges', example: 100 })
  additional_charge: any; // Replace 'any' with a specific type if available

  @ApiProperty({
    description: 'Notes about the additional charge',
    example: '',
  })
  additional_charge_note: any; // Replace 'any' with a specific type if available

  @ApiProperty({ description: 'Discount percentage', example: 5 })
  discount_percentage: any; // Replace 'any' with a specific type if available

  @ApiProperty({ description: 'Discount amount', example: 100 })
  discount_amount: any; // Replace 'any' with a specific type if available

  @ApiProperty({
    description: 'Total amount after discounts and charges',
    example: 100,
  })
  total: any; // Replace 'any' with a specific type if available
}

export class makepaymentV3 {
  @ApiProperty({ example: 1 })
  Hospital_id: number;

  @ApiProperty({ example: 2 })
  patient_id: any;

  @ApiProperty({ example: 'cash' })
  payment_mode: any;

  @ApiProperty({ example: '2024-09-06' })
  payment_date: any;

  @ApiProperty({ example: 'Elakkiya S' })
  received_by_name: string;

  @ApiProperty({ example: 'APPPN112' })
  sectionId: string;

  @ApiProperty({
    example: `[
        {
            "patient_charge_id": 1874,
            "date": "25th May 2025",
            "section": "IPD",
            "appointment_status_id": null,
            "section_id": "IPDN51",
            "chargeDescription": "Booking Charges - Booking",
            "qty": 1,
            "charges": 1,
            "taxPercentage": 10,
            "discount_amount": 0,
            "discount_percentage": 0,
            "total": 1.1,
            "additional_charge": 0
        },
        {
            "patient_charge_id": 1875,
            "date": "25th May 2025",
            "section": "APPOINTMENT",
            "appointment_status_id": "5",
            "section_id": "APPN1566",
            "chargeDescription": "Booking Charges - Booking",
            "qty": 1,
            "charges": 1,
            "taxPercentage": 10,
            "discount_amount": 0,
            "discount_percentage": 0,
            "total": 1.1,
            "additional_charge": 0
        }
    ]`,
  })
  paymentDetails: any;

  @ApiProperty({ example: 'Payment for services rendered' })
  totalDue: string;
  @ApiHideProperty()
  txn_id: any;

  @ApiHideProperty()
  pg_ref_id: any;

  @ApiHideProperty()
  bank_ref_id: any;

  @ApiProperty({ example: 'APPPN112' })
  payment_method: string;

  @ApiProperty({ example: 'APPPN112' })
  card_division: string;

  @ApiProperty({ example: 'APPPN112' })
  card_bank_name: string;

  @ApiProperty({ example: 'APPPN112' })
  card_type: string;
  @ApiProperty({ example: 'APPPN112' })
  card_transaction_id: string;
  @ApiProperty({ example: 'APPPN112' })
  net_banking_division: string;
  @ApiProperty({ example: 'APPPN112' })
  net_banking_transaction_id: string;
  @ApiProperty({ example: 'APPPN112' })
  upi_id: string;
  @ApiProperty({ example: 'APPPN112' })
  upi_transaction_id: string;
  @ApiProperty({ example: 'APPPN112' })
  upi_bank_name: string;
}
