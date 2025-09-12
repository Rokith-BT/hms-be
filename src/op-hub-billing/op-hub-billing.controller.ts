import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ErrorResponse400,
  ErrorResponse500,
} from 'src/op-hub-appointment/entities/op-hub-appointment.entity';
import {
  AddCharge,
  makepayment,
  makepaymentV3,
  UpdateCharge,
} from './entities/op-hub-billing.entity';
import { OpHubBillingService } from './op-hub-billing.service';

export class ChargeDetailsDto {
  @ApiProperty({ example: 156 })
  id: number;

  @ApiProperty({ example: 'one' })
  name: string;

  @ApiProperty({ example: 'yyyy' })
  chargeCategoryName: string;

  @ApiProperty({ example: 67 })
  chargeCategoryId: number;

  @ApiProperty({ example: 'OPD' })
  chargeTypeName: string;

  @ApiProperty({ example: 130 })
  chargeTypeId: number;

  @ApiProperty({ example: 90 })
  standard_charge: number;

  @ApiProperty({ example: 12 })
  taxPercentage: number;

  @ApiProperty({ example: 10.8 })
  taxAmount: number;

  @ApiProperty({ example: 100.8 })
  totalAmount: number;
}

export class ChargeNameDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  charge_type_id: number;

  @ApiProperty({ example: 'Appointment Charge Cate' })
  name: string;

  @ApiProperty({ example: 'Appointment Charge Cate' })
  description: string;

  @ApiProperty({ example: null })
  short_code: string;

  @ApiProperty({ example: 'yes' })
  is_default: string;

  @ApiProperty({ example: null })
  created_at: Date;
}

export class ChargeCategoryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  charge_category_id: number;

  @ApiProperty({ example: 1 })
  tax_category_id: number;

  @ApiProperty({ example: 1 })
  charge_unit_id: number;

  @ApiProperty({ example: 'Doctor Fee' })
  name: string;

  @ApiProperty({ example: 700 })
  standard_charge: number;

  @ApiProperty({ example: '2024-06-14T00:00:00.000Z', nullable: true })
  date: string | null;

  @ApiProperty({ example: 'Doctor Fee' })
  description: string;

  @ApiProperty({ example: 'nothing' })
  status: string;

  @ApiProperty({ example: '2024-06-14T06:59:50.000Z' })
  created_at: string;

  @ApiProperty({ example: '9.00' })
  taxPercentage: string;

  @ApiProperty({ example: 63 })
  taxAmount: number;

  @ApiProperty({ example: 763 })
  totalAmount: number;
}
export class ChargeTypeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  charge_type: string;

  @ApiProperty()
  is_default: string;

  @ApiProperty()
  is_active: string;

  @ApiProperty()
  created_at: string;
}

class PatientDetaila {
  @ApiProperty()
  patient_name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  mobileno: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  id: number;
}

class PendingDetails {
  @ApiProperty()
  patient_charge_id: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  section_id: string;

  @ApiProperty()
  chargeDescription: string;

  @ApiProperty()
  qty: number;

  @ApiProperty()
  charges: number;

  @ApiProperty()
  taxPercentage: number;

  @ApiProperty()
  total: number;
}

export class FindAllPendingResponse {
  @ApiProperty({ type: [PatientDetaila] })
  patientDetails: PatientDetail[];

  @ApiProperty({ type: [PendingDetails] })
  pendingDetails: PendingDetail[];

  @ApiProperty()
  totalDue: number;
}

// ____________________________________

class PatientDetail {
  @ApiProperty()
  patient_name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  mobileno: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  id: number;
}

class PendingDetail {
  @ApiProperty()
  patient_charge_id: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  section_id: string;

  @ApiProperty()
  chargeDescription: string;

  @ApiProperty()
  qty: number;

  @ApiProperty()
  charges: number;

  @ApiProperty()
  taxPercentage: number;

  @ApiProperty()
  total: number;
}

export class FindOneResponse {
  @ApiProperty({ type: [PatientDetail] })
  patientDetails: PatientDetail[];

  @ApiProperty({ type: [PendingDetail] })
  pendingDetails: PendingDetail[];

  @ApiProperty()
  totalDue: number;
}

export class PatientDetails {
  @ApiProperty()
  id: number;

  @ApiProperty()
  lang_id: number;

  @ApiProperty()
  patient_name: string;

  @ApiProperty()
  dob: string;

  @ApiProperty()
  age: number;

  @ApiProperty({ nullable: true })
  month: number | null;

  @ApiProperty({ nullable: true })
  day: number | null;

  @ApiProperty({ nullable: true })
  image: string | null;

  @ApiProperty()
  mobileno: string;

  @ApiProperty({ nullable: true })
  email: string;

  @ApiProperty()
  gender: string;

  @ApiProperty({ nullable: true })
  marital_status: string | null;

  @ApiProperty()
  blood_group: string;

  @ApiProperty()
  blood_bank_product_id: number;

  @ApiProperty()
  address: string;

  @ApiProperty({ nullable: true })
  guardian_name: string | null;

  @ApiProperty({ nullable: true })
  patient_type: string | null;

  @ApiProperty({ nullable: true })
  ABHA_number: string | null;

  @ApiProperty({ nullable: true })
  known_allergies: string | null;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty({ nullable: true })
  is_ipd: string | null;

  @ApiProperty({ nullable: true })
  app_key: string | null;

  @ApiProperty({ nullable: true })
  insurance_id: string | null;

  @ApiProperty({ nullable: true })
  insurance_validity: string | null;

  @ApiProperty()
  is_dead: string;

  @ApiProperty()
  is_active: string;

  @ApiProperty({ nullable: true })
  disable_at: string | null;

  @ApiProperty()
  created_at: string;

  @ApiProperty({ nullable: true })
  pincode: string | null;

  @ApiProperty({ nullable: true })
  state_code: string | null;

  @ApiProperty({ nullable: true })
  district_code: string | null;

  @ApiProperty({ nullable: true })
  emergency_mobile_no: string;

  @ApiProperty()
  dial_code: string;

  @ApiProperty()
  salutation: string;

  @ApiProperty({ nullable: true })
  emergency_dial_code: string | null;

  @ApiProperty({ nullable: true })
  state_name: string | null;

  @ApiProperty({ nullable: true })
  district_name: string | null;

  @ApiProperty()
  aayush_unique_id: string;
}

export class HospitalDetails {
  @ApiProperty()
  hospital_name: string;

  @ApiProperty()
  contact_no: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  website: string;

  @ApiProperty({ nullable: true })
  email: string;
}

export class InvoiceDetail {
  @ApiProperty()
  qty: number;

  @ApiProperty()
  standard_charge: number;

  @ApiProperty()
  taxPercentage: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  additional_charge: number;

  @ApiProperty()
  discount_amount: number;

  @ApiProperty()
  discount_percentage: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  chargeName: string;
}

export class InvoiceResponse {
  @ApiProperty()
  status: string;

  @ApiProperty()
  messege: string;

  @ApiProperty({ type: PatientDetails })
  patientDetails: PatientDetails;

  @ApiProperty({ type: HospitalDetails })
  hospitalDetails: HospitalDetails;

  @ApiProperty({ type: [InvoiceDetail] })
  invoiceDetails: InvoiceDetail[];

  @ApiProperty()
  total: number;
}

export class CreateBillingResponse {
  @ApiProperty({
    description: 'Indicates the status of the operation',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Message detailing the result of the operation',
    example: 'charges added successfully.',
  })
  message: string;
}

export class PaymentResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'payment done successfully' })
  message: string;
}

class PaymentDetail {
  @ApiProperty({ example: 3 })
  patientId: number;

  @ApiProperty({ example: 'Elakkiya S' })
  patient_name: string;

  @ApiProperty({ example: 'TRID252' })
  transaction_id: string;

  @ApiProperty({ example: '2024-06-05' })
  payment_date: string;

  @ApiProperty({ example: 'cash' })
  payment_mode: string;

  @ApiProperty({ example: 13574.6 })
  amount: number | null; // Allowing for null values
}

export class FindAllResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'details fetched successfully.' })
  message: string;

  @ApiProperty({ type: [PaymentDetail] })
  details: PaymentDetail[];

  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ example: 13574.6 })
  overallTotal: number;
}

export class UpdateChargeResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'charges updated successfully.' })
  message: string;
}

class PatientChargeDetails {
  @ApiProperty({ example: 58 })
  patientCharge_id: number;

  @ApiProperty({ example: 200 })
  standard_charge: number;

  @ApiProperty({ example: 12 })
  tax: number;

  @ApiProperty({ example: 24 })
  taxAmount: number;

  @ApiProperty({ example: 0 })
  discount_amount: number;

  @ApiProperty({ example: 0 })
  discount_percentage: number;

  @ApiProperty({ example: 0 })
  additional_charge: number;

  @ApiProperty({ example: null })
  additional_charge_note: string | null;

  @ApiProperty({ example: 1 })
  qty: number;

  @ApiProperty({ example: 'charge_for_appointment' })
  chargeName: string;

  @ApiProperty({ example: 194 })
  chargeId: number;

  @ApiProperty({ example: 'charge_category_appointment' })
  chargeCategoryName: string;

  @ApiProperty({ example: 139 })
  chargeCategoryId: number;

  @ApiProperty({ example: 'charge_type_2024' })
  chargeTypeName: string;

  @ApiProperty({ example: 181 })
  chargeTypeId: number;
}

export class GetPatientChargeResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Details fetched successfully' })
  message: string;

  @ApiProperty({ type: PatientChargeDetails })
  details: PatientChargeDetails;
}

@ApiTags('op-hub-billing')
@Controller('op-hub-billing')
export class OpHubBillingController {
  constructor(private readonly billingService: OpHubBillingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new billing charge' })
  @ApiResponse({
    status: 201,
    description: 'Charges added successfully.',
    type: CreateBillingResponse, // Specify the response type
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  create(@Body() createBillingDto: AddCharge) {
    return this.billingService.create(createBillingDto);
  }

  @Post('/getOnePatCharge')
  @ApiOperation({ summary: 'Fetch details of a specific patient charge' })
  @ApiResponse({
    status: 200,
    description: 'Details fetched successfully.',
    type: GetPatientChargeResponse, // Specify the response type
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  createAdditional(
    @Query('hospital_id') hospital_id: number,
    @Query('patient_charge_id') patient_charge_id: number,
  ) {
    return this.billingService.findonePatCharge(hospital_id, patient_charge_id);
  }

  @Post('/makePayment')
  @ApiOperation({ summary: 'Make a payment for a patient' })
  @ApiResponse({
    status: 201,
    description: 'Payment made successfully.',
    type: PaymentResponse, // Use the response DTO here
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  makePayment(@Body() createBillingDto: makepayment) {
    if (!createBillingDto.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
      };
    }
    return this.billingService.makePayment(createBillingDto);
  }
  @Get()
  @ApiOperation({ summary: 'Fetch billing details based on query parameters' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    type: String,
    description: 'Start date for filtering',
  })
  @ApiQuery({
    name: 'to_date',
    required: false,
    type: String,
    description: 'End date for filtering',
  })
  @ApiQuery({
    name: 'patient_id',
    required: false,
    type: Number,
    description: 'ID of the patient',
  })
  @ApiQuery({
    name: 'payment_method',
    required: false,
    type: String,
    description: 'Method of payment',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Specific date for filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Details fetched successfully.',
    type: FindAllResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findAll(
    @Query('hospital_id') hospital_id: number,
    @Query('from_date') from_date: any,
    @Query('to_date') to_date: any,
    @Query('patient_id') patient_id: any,
    @Query('payment_method') payment_method: any,
    @Query('date') date: any,
  ) {
    if (hospital_id && (date || from_date || to_date)) {
      return this.billingService.findAll(
        hospital_id,
        from_date,
        to_date,
        patient_id,
        payment_method,
        date,
      );
    }
    return {
      status: 'failed',
      message: 'enter hospital_id and date',
    };
  }

  @Get('/getInvoice')
  @ApiOperation({
    summary: 'Fetch invoice details by transaction ID and hospital ID',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiQuery({
    name: 'transaction_id',
    required: true,
    type: String,
    description: 'Transaction ID of the invoice',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice details fetched successfully.',
    type: InvoiceResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findinvoice(
    @Query('hospital_id') hospital_id: any,
    @Query('transaction_id') transaction_id: any,
  ) {
    return this.billingService.getInvoice(transaction_id, hospital_id);
  }

  @Get('/individualpending')
  @ApiOperation({
    summary:
      'Fetch pending billing details for a specific patient and hospital',
  })
  @ApiQuery({
    name: 'patient_id',
    required: true,
    type: Number,
    description: 'ID of the patient',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending billing details fetched successfully.',
    type: FindOneResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findOne(
    @Query('patient_id') patient_id: any,
    @Query('hospital_id') hospital_id: any,
    @Query('filter') filter: any,
  ) {
    return this.billingService.findOne(patient_id, hospital_id, filter);
  }

  @Get('/pending')
  @ApiOperation({
    summary: 'Fetch all pending billing details for a specific hospital',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending billing details fetched successfully.',
    type: FindAllPendingResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findAllPending(@Query('hospital_id') hospital_id: any) {
    return this.billingService.findpending(hospital_id);
  }

  @Get('/chargeType')
  @ApiOperation({ summary: 'Fetch all charge types for a specific hospital' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Charge types fetched successfully.',
    type: [ChargeTypeDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findchargeType(@Query('hospital_id') hospital_id: any) {
    return this.billingService.findChargeType(hospital_id);
  }

  @Get('/chargeCategory')
  @ApiOperation({ summary: 'Find charge categories' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    example: '1',
    description: 'ID of the hospital',
  })
  @ApiQuery({
    name: 'charge_type_id',
    required: true,
    example: '2',
    description: 'ID of the charge type',
  })
  @ApiResponse({
    status: 200,
    description: 'The charge categories have been successfully retrieved.',
    type: ChargeNameDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findchargeCategory(
    @Query('hospital_id') hospital_id: any,
    @Query('charge_type_id') charge_type_id: any,
  ) {
    return this.billingService.findChargeCategory(hospital_id, charge_type_id);
  }

  @Get('/chargeName')
  @ApiOperation({ summary: 'Find charge names by hospital and category' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    example: '1',
    description: 'ID of the hospital',
  })
  @ApiQuery({
    name: 'charge_category_id',
    required: true,
    example: '1',
    description: 'ID of the charge category',
  })
  @ApiResponse({
    status: 200,
    description: 'The charge names have been successfully retrieved.',
    type: ChargeCategoryDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findchargeName(
    @Query('hospital_id') hospital_id: any,
    @Query('charge_category_id') charge_category_id: any,
  ) {
    return this.billingService.findChargeName(hospital_id, charge_category_id);
  }

  @Get('/chargeName/:id')
  @ApiOperation({ summary: 'Get Charge Details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Charge details retrieved successfully',
    type: ChargeDetailsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  @ApiQuery({ name: 'hospital_id', required: true })
  findchargeDetails(
    @Param('id') id: any,
    @Query('hospital_id') hospital_id: any,
  ) {
    return this.billingService.findChargeDetails(id, hospital_id);
  }
  //      _________________________________________________________________________________________________________

  @Patch(':id')
  @ApiOperation({ summary: 'Update charges for a specific billing entry' })
  @ApiResponse({
    status: 200,
    description: 'Charges updated successfully.',
    type: UpdateChargeResponse, // Use the response DTO here
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  update(@Param('id') id: string, @Body() updateBillingDto: UpdateCharge) {
    return this.billingService.update(+id, updateBillingDto);
  }

  @Get('/pending/v2')
  @ApiOperation({
    summary: 'Fetch all pending billing details for a specific hospital',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending billing details fetched successfully.',
    type: FindAllPendingResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  async findAllPendingV2(@Query('limit') limit: any, @Query('page') page: any) {
    try {
      let final_out = await this.billingService.findpendingV2(
        limit || 10,
        page || 1,
      );
      if (final_out?.PendingList.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.PendingList,
          totalCount: final_out.Count,
          totalAmount: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('/v2/paid')
  @ApiOperation({ summary: 'Fetch billing details based on query parameters' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    type: String,
    description: 'Start date for filtering',
  })
  @ApiQuery({
    name: 'to_date',
    required: false,
    type: String,
    description: 'End date for filtering',
  })
  @ApiQuery({
    name: 'patient_id',
    required: false,
    type: Number,
    description: 'ID of the patient',
  })
  @ApiQuery({
    name: 'payment_method',
    required: false,
    type: String,
    description: 'Method of payment',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Specific date for filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Details fetched successfully.',
    type: FindAllResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  async findAllV2(
    @Query('from_date') from_date: any,
    @Query('to_date') to_date: any,
    @Query('patient_id') patient_id: any,
    @Query('payment_method') payment_method: any,
    @Query('date') date: any,
    @Query('limit') limit: any,
    @Query('page') page: any,
  ) {
    if (date || from_date || to_date) {
      try {
        let final_out = await this.billingService.findAllV2(
          from_date,
          to_date,
          patient_id,
          payment_method,
          date,
          limit || 10,
          page || 1,
        );

        if (final_out?.details.length > 0) {
          return {
            status_code: process.env.SUCCESS_STATUS_CODE_V2,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.SUCCESS_MESSAGE_V2,
            data: final_out.details,
            totalCount: final_out.Totalcount,
            totalAmount: final_out.TotalAmount,
          };
        } else {
          return {
            status_code: process.env.SUCCESS_STATUS_CODE_V2,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.DATA_NOT_FOUND_V2,
            data: [],
          };
        }
      } catch (error) {
        return {
          status_code: process.env.ERROR_STATUS_CODE_V2,
          status: process.env.ERROR_STATUS_V2,
          message: process.env.ERROR_MESSAGE_V2,
        };
      }
    }
    return {
      status: 'failed',
      message: 'enter hospital_id and date',
    };
  }

  @Get('v2/getPendingSectionList')
  async getOnePatChargeV2(@Query('patient_id') patient_id: number) {
    if (!patient_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    try {
      let final_out = await this.billingService.getpendingApptofPat(patient_id);
      if (final_out?.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Post('/makePayment/v2')
  @ApiOperation({ summary: 'Make a payment for a patient' })
  @ApiResponse({
    status: 201,
    description: 'Payment made successfully.',
    type: PaymentResponse, // Use the response DTO here
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  makePaymentV2(@Body() createBillingDto: makepayment) {
    if (!createBillingDto.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
      };
    }
    if (!createBillingDto.paymentDetails) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }

    return this.billingService.makePaymentV2(createBillingDto);
  }

  @Post('/v2/addCharge')
  @ApiOperation({ summary: 'Create a new billing charge' })
  @ApiResponse({
    status: 201,
    description: 'Charges added successfully.',
    type: CreateBillingResponse, // Specify the response type
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  createV2(@Body() createBillingDto: AddCharge) {
    try {
      if (
        !createBillingDto.Hospital_id ||
        !createBillingDto.patient_id ||
        !createBillingDto.sectionID
      ) {
        return {
          status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
          status: process.env.ERROR_STATUS,
          message: process.env.ERROR_MESSAGE_PARAM_MISSING,
        };
      }

      return this.billingService.createV2(createBillingDto);
    } catch (error) {
      console.log(error, 'error');
    }
  }

  @Get('/individualpending/bySectionId')
  @ApiOperation({
    summary:
      'Fetch pending billing details for a specific patient and hospital',
  })
  @ApiQuery({
    name: 'patient_id',
    required: true,
    type: Number,
    description: 'ID of the patient',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending billing details fetched successfully.',
    type: FindOneResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  findOnev2(
    @Query('patient_id') patient_id: any,
    @Query('hospital_id') hospital_id: any,
    @Query('sectionId') filter: string,
  ) {
    if (!filter) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    return this.billingService.findOnev2(patient_id, hospital_id, filter);
  }

  @Get('/pending/v3')
  @ApiOperation({
    summary: 'Fetch all pending billing details for a specific hospital',
  })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending billing details fetched successfully.',
    type: FindAllPendingResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  async findAllPendingV3(@Query('limit') limit: any, @Query('page') page: any) {
    try {
      let final_out = await this.billingService.findpendingV3(
        limit || 10,
        page || 1,
      );
      if (final_out?.PendingList.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.PendingList,
          totalCount: final_out.Count,
          totalAmount: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('/v3/paid')
  @ApiOperation({ summary: 'Fetch billing details based on query parameters' })
  @ApiQuery({
    name: 'hospital_id',
    required: true,
    type: Number,
    description: 'ID of the hospital',
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    type: String,
    description: 'Start date for filtering',
  })
  @ApiQuery({
    name: 'to_date',
    required: false,
    type: String,
    description: 'End date for filtering',
  })
  @ApiQuery({
    name: 'patient_id',
    required: false,
    type: Number,
    description: 'ID of the patient',
  })
  @ApiQuery({
    name: 'payment_method',
    required: false,
    type: String,
    description: 'Method of payment',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Specific date for filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Details fetched successfully.',
    type: FindAllResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  async findAllV3(
    @Query('from_date') from_date: any,
    @Query('to_date') to_date: any,
    @Query('patient_id') patient_id: any,
    @Query('payment_method') payment_method: any,
    @Query('date') date: any,
    @Query('limit') limit: any,
    @Query('page') page: any,
  ) {
    if (date || from_date || to_date) {
      try {
        let final_out = await this.billingService.findAllV3(
          from_date,
          to_date,
          patient_id,
          payment_method,
          date,
          limit || 10,
          page || 1,
        );

        if (final_out?.details.length > 0) {
          return {
            status_code: process.env.SUCCESS_STATUS_CODE_V2,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.SUCCESS_MESSAGE_V2,
            data: final_out.details,
            totalCount: final_out.Totalcount,
            totalAmount: final_out.TotalAmount,
          };
        } else {
          return {
            status_code: process.env.SUCCESS_STATUS_CODE_V2,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.DATA_NOT_FOUND_V2,
            data: [],
          };
        }
      } catch (error) {
        return {
          status_code: process.env.ERROR_STATUS_CODE_V2,
          status: process.env.ERROR_STATUS_V2,
          message: process.env.ERROR_MESSAGE_V2,
        };
      }
    }
    return {
      status: 'failed',
      message: 'enter hospital_id and date',
    };
  }

  @Post('/makePayment/v3')
  @ApiOperation({ summary: 'Make a payment for a patient' })
  @ApiResponse({
    status: 201,
    description: 'Payment made successfully.',
    type: PaymentResponse, // Use the response DTO here
  })
  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  makePaymentV3(@Body() createBillingDto: makepaymentV3) {
    if (!createBillingDto.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
      };
    }
    if (!createBillingDto.paymentDetails) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (!createBillingDto.payment_method) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      createBillingDto.payment_mode.toLocaleLowerCase() == 'card' &&
      !createBillingDto.card_division &&
      !createBillingDto.card_bank_name &&
      !createBillingDto.card_type &&
      !createBillingDto.card_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }

    if (
      createBillingDto.payment_mode.toLocaleLowerCase() == 'net_banking' &&
      !createBillingDto.net_banking_division &&
      !createBillingDto.net_banking_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      createBillingDto.payment_mode.toLocaleLowerCase() == 'upi' &&
      !createBillingDto.upi_id &&
      !createBillingDto.upi_transaction_id &&
      !createBillingDto.upi_bank_name
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    return this.billingService.makePaymentV3(createBillingDto);
  }
}
