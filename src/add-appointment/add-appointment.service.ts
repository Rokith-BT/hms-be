import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AddAppointment,
  AddAppointmentPayment,
} from './entities/add-appointment.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import axios from 'axios';
import { CountDto } from './add-appointment.dto';
import { FaceAuthService } from 'src/face-auth/face-auth.service';
import { customAlphabet } from 'nanoid';
const Razorpay = require('razorpay');

@Injectable()
export class AddAppointmentService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  @OnEvent('send-email-sms-appointment-create')
  handleOrderCreatedEvent(smsData, emailData) {
    axios.post('https://notifications.plenome.com/sms', smsData);
    axios.post(
      'https://notifications.plenome.com/email-appointment-booked',
      emailData,
    );
  }
  // @OnEvent('razorpay-refund-amount-for-appt-cancel')
  RefundApptCharge(
    payment_id,
    PatientChargesDetailsId,
    AdminPatientChargesDetailsId,
  ) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const refundData: any = {};
      const paymentDetails = razorpay.payments.fetch(payment_id);
      if (paymentDetails.amount) {
        let refndAmt;
        if (paymentDetails.amount <= 100) {
          refndAmt = Math.round(paymentDetails.amount);
        } else {
          refndAmt = Math.round(
            paymentDetails.amount - paymentDetails.amount * 0.052,
          );
        }
        refundData.amount = refndAmt;
      }
      razorpay.payments.refund(payment_id, refundData);
      this.connection.query(
        `update patient_charges set 
  payment_status = 'refunded' where id = ?`,
        [PatientChargesDetailsId],
      );

      this.dynamicConnection.query(
        `update patient_charges set 
        payment_status = 'refunded' where id = ?`,
        [AdminPatientChargesDetailsId],
      );
    } catch (error) {}
  }
  // @OnEvent('razorpay-refund-amount-for-temp-appt-cancel')
  RefundTempApptCharge(payment_id: string) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const refundData: any = {};
      const paymentDetails = razorpay.payments.fetch(payment_id);
      if (paymentDetails.amount) {
        let refndAmt;
        if (paymentDetails.amount <= 100) {
          refndAmt = Math.round(paymentDetails.amount);
        } else {
          refndAmt = Math.round(
            paymentDetails.amount - paymentDetails.amount * 0.052,
          );
        }
        refundData.amount = refndAmt;
      }
    } catch (error) {}
  }
  // @OnEvent('transfer-razorpay-to-sub-merchant')
  async TransferToSubmerchant(payment_id, getPaymentGatewayDetails) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const SubMerchantdetails = JSON.parse(
        JSON.stringify(getPaymentGatewayDetails.gateway_account_details),
      );
      const submerchantAccountId = SubMerchantdetails.id;
      const paymentDetails = razorpay.payments.fetch(payment_id);
      let refndAmt;
      if (paymentDetails.amount) {
        if (paymentDetails.amount <= 100) {
          refndAmt = Math.round(paymentDetails.amount);
        } else {
          refndAmt = Math.round(
            paymentDetails.amount - paymentDetails.amount * 0.052,
          );
        }
      }

      const transferPayload = {
        transfers: [
          {
            account: submerchantAccountId,
            amount: refndAmt,
            currency: 'INR',
            notes: {
              name: 'Gaurav Kumar',
              roll_no: 'IEC2011025',
            },
            linked_account_notes: ['roll_no'],
            on_hold: false,
          },
        ],
      };

      const tree = await razorpay.payments
        .transfer(payment_id, transferPayload)
        .catch();
    } catch (error) {}
  }
  @OnEvent('send-email-sms-appointment-cancel')
  sendnotificationApptDeleteEvent(verifyData, emailData) {
    axios.post(
      'https://notifications.plenome.com/sending-sms-appointment-cancelled',
      verifyData,
    );
    axios.post(
      'https://notifications.plenome.com/email-appointment-cancelled',
      emailData,
    );
  }
  @OnEvent('send-email-sms-temp-appointment-create')
  sendnotificationTempApptCreateEvent(verifyData, emailData) {
    axios.post(
      'https://notifications.plenome.com/temporary-appointment-number',
      verifyData,
    );
    axios.post(
      'https://notifications.plenome.com/email-temporary-appointment',
      emailData,
    );
  }
  @OnEvent('send-email-sms-appointment-update')
  sendnotificationApptUpdateEvent(verifyData, emailData) {
    axios.post(
      'https://notifications.plenome.com/sending-sms-appointment-reschedule',
      verifyData,
    );
    axios.post(
      'https://notifications.plenome.com/email-appointment-rescheduled',
      emailData,
    );
  }

  async create(AppointmentEntity: AddAppointment) {
    AppointmentEntity.payment_mode =
      AppointmentEntity.payment_mode.toLocaleLowerCase();
    if (
      !AppointmentEntity.received_by_name ||
      AppointmentEntity.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }

    try {
      if (AppointmentEntity.payment_mode == 'online') {
        if (!AppointmentEntity.payment_gateway) {
          return {
            status: process.env.ERROR_STATUS,
            message: process.env.PAYMENT_GATEWAY,
          };
        }

        if (
          AppointmentEntity.payment_gateway.toLocaleLowerCase() == 'razorpay'
        ) {
          if (
            !AppointmentEntity.payment_reference_number ||
            !AppointmentEntity.payment_id
          ) {
            if (!AppointmentEntity.payment_reference_number) {
              AppointmentEntity.payment_reference_number = 'NA';
            }
            if (!AppointmentEntity.payment_id) {
              AppointmentEntity.payment_id = 'NA';
            }
            return {
              status: process.env.ERROR_STATUS,
              message: process.env.PAYMENT_REFERENCE,
            };
          }

          try {
            const [getPaymentGatewayDetails] =
              await this.dynamicConnection.query(
                `select * from hospital_payment_gateway_details where hospital_id = ? and payment_gateway = ?`,
                [AppointmentEntity.Hospital_id, 'razorpay'],
              );

            // this.TransferToSubmerchant(AppointmentEntity.payment_id, getPaymentGatewayDetails)
          } catch (error) {
            return error;
          }
        }
      }

      const currentdate = new Date();
      const formattedDate = currentdate.toISOString().split('T')[0];

      let position: number;

      const HOSpatient = await this.connection.query(
        'select * from patients where id =?',
        [AppointmentEntity.patient_id],
      );

      const patientInHos = await this.dynamicConnection.query(
        'select patients.id from patients where aayush_unique_id = ?',
        [HOSpatient[0].aayush_unique_id],
      );

      let HOSpatientId;

      if (patientInHos[0]) {
        HOSpatientId = patientInHos[0].id;
      } else {
        let faceID = null;
        if (HOSpatient[0].image && HOSpatient[0].image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            HOSpatient[0].image,
          );
          faceID = getFaceId?.faceID;
        }
        const createpatient = await this.dynamicConnection.query(
          `insert into patients  (
  patient_name,
  dob,
  image,
  faceId,
  mobileno,
  email,
  gender,
  address,
  ABHA_number
  )
  values(?,?,?,?,?,?,?,?,?)`,
          [
            HOSpatient[0].patient_name,
            HOSpatient[0].dob,
            HOSpatient[0].image,
            faceID,
            HOSpatient[0].mobileno,
            HOSpatient[0].email,
            HOSpatient[0].gender,
            HOSpatient[0].address,
            HOSpatient[0].ABHA_number,
          ],
        );
        HOSpatientId = createpatient.insertId;
      }
      const [staffEmailInHOS] = await this.connection.query(
        `select email from staff where id = ?`,
        [AppointmentEntity.doctor],
      );

      const [adminStaff] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [staffEmailInHOS.email],
      );
      let adminStaffId = adminStaff.id;

      let payment_type;
      if (AppointmentEntity.payment_mode === `cash`) {
        payment_type = `Offline`;
      } else {
        payment_type = `UPI`;
      }

      const [check_duplicate] = await this.connection.query(
        `select * from appointment 
     where patient_id = ? and doctor = ? and shift_id = ? and date = ? and appointment_status_id <> 4`,
        [
          AppointmentEntity.patient_id,
          AppointmentEntity.doctor,
          AppointmentEntity.shift_id,
          AppointmentEntity.date,
        ],
      );

      if (!check_duplicate) {
        let HOStransaction_id: number;
        const HOScaseRef = await this.connection.query(
          'INSERT INTO case_references values(default,default)',
        );

        const HOSopdCreate = await this.connection.query(
          `
insert into opd_details (case_reference_id,patient_id) values (?,?)`,
          [HOScaseRef.insertId, AppointmentEntity.patient_id],
        );

        const HOScharge = await this.connection.query(
          'select charge_id from shift_details where shift_details.staff_id = ?',
          [AppointmentEntity.doctor],
        );

        let HOScharge_id = HOScharge[0].charge_id;

        const HOSamount = await this.connection.query(
          `  select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
  (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ?
`,
          [HOScharge_id],
        );

        let payment_status;
        if (
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `cash` ||
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `upi` ||
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `cheque` ||
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `online` ||
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `card` ||
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `neft` ||
          AppointmentEntity.payment_mode.toLocaleLowerCase() == `net_banking`
        ) {
          payment_status = `paid`;
        } else {
          payment_status = `unpaid`;
        }

        const Patient_charges_insert = await this.connection.query(
          `insert into patient_charges(
  date,
  opd_id,
  qty,
  charge_id,
  standard_charge,
 
  tax,
  apply_charge,
  amount,
  payment_status,
  total,
  patient_id
  ) values(?,?,?,?,?,?,?,?,?,?,?)`,
          [
            AppointmentEntity.date,
            HOSopdCreate.insertId,
            1,
            HOScharge_id,
            HOSamount[0].standard_charge,
            HOSamount[0].tax_percentage,
            HOSamount[0].standard_charge,
            HOSamount[0].amount,
            payment_status,
            HOSamount[0].amount,
            AppointmentEntity.patient_id,
          ],
        );
        if (
          AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater' &&
          AppointmentEntity.payment_mode.toLocaleLowerCase() != 'offline'
        ) {
          const HOStransactions = await this.connection.query(
            `
  insert into transactions (
  type,
  section,
  patient_id,
  case_reference_id,
  amount,
  payment_mode,
  payment_date,
  patient_charges_id,
  opd_id, payment_gateway,
  payment_id,
  payment_reference_number,
  received_by_name
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              'payment',
              'Appointment',
              AppointmentEntity.patient_id,
              HOScaseRef.insertId,
              HOSamount[0].amount,
              AppointmentEntity.payment_mode.toLocaleLowerCase(),
              AppointmentEntity.payment_date,
              Patient_charges_insert.insertId,
              HOSopdCreate.insertId,
              AppointmentEntity.payment_gateway,
              AppointmentEntity.payment_id,
              AppointmentEntity.payment_reference_number,
              AppointmentEntity.received_by_name,
            ],
          );
          HOStransaction_id = HOStransactions.insertId;
        }

        await this.connection.query(
          `update patient_charges SET transaction_id = ? where id = ?`,
          [HOStransaction_id, Patient_charges_insert.insertId],
        );

        const HOSvisitInsert = await this.connection.query(
          `
insert into visit_details(
  opd_details_id,
  patient_charge_id,
  transaction_id,
  case_type,
  cons_doctor,
  appointment_date,
  live_consult,
  payment_mode
  ) values (?,?,?,?,?,?,?,?)`,
          [
            HOSopdCreate.insertId,
            Patient_charges_insert.insertId,
            HOStransaction_id,
            '',
            AppointmentEntity.doctor,
            AppointmentEntity.date + ' ' + AppointmentEntity.time,
            AppointmentEntity.live_consult,
            AppointmentEntity.payment_mode.toLocaleLowerCase(),
          ],
        );

        const [adminGlobalShiftId] = await this.dynamicConnection.query(
          `select * from global_shift where Hospital_id = ? and
hospital_global_shift_id = ?`,
          [AppointmentEntity.Hospital_id, AppointmentEntity.global_shift_id],
        );

        const [adminShiftId] = await this.dynamicConnection.query(
          `select * from doctor_shift where Hospital_id = ? and
hospital_doctor_shift_id = ?`,
          [AppointmentEntity.Hospital_id, AppointmentEntity.shift_id],
        );

        const [status_name] = await this.connection.query(
          `select status from appointment_status where id = ?`,
          [AppointmentEntity.appointment_status_id],
        );

        let hos_appointment_id: string;

        const HOSbookAppnt = await this.connection.query(
          `insert into appointment(
      patient_id,
      case_reference_id,
      visit_details_id,
      date,
      time,
      doctor,
      source,
      global_shift_id,
      shift_id,
      live_consult,
      amount,
      message,
      appointment_status_id,
      appointment_status,
      priority
     
      ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            AppointmentEntity.patient_id,
            HOScaseRef.insertId,
            HOSvisitInsert.insertId,
            AppointmentEntity.date,
            AppointmentEntity.time,
            AppointmentEntity.doctor,
            'Offline',
            AppointmentEntity.global_shift_id,
            AppointmentEntity.shift_id,
            AppointmentEntity.live_consult,
            HOSamount[0].amount,
            AppointmentEntity.message,
            AppointmentEntity.appointment_status_id,
            status_name.status,
            AppointmentEntity.priority,
          ],
        );

        hos_appointment_id = HOSbookAppnt.insertId;

        if (AppointmentEntity.date == formattedDate) {
          const getLastPosition = await this.connection.query(
            `select position from
     appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `,
            [
              AppointmentEntity.date,
              AppointmentEntity.doctor,
              AppointmentEntity.shift_id,
            ],
          );

          if (getLastPosition.length !== 0) {
            position = getLastPosition[0].position + 1;
          } else {
            position = 1;
          }
        } else {
          position = null;
        }

        await this.connection.query(
          `insert into appointment_queue(
    appointment_id,
    staff_id,
    shift_id,
    position,
    date
    ) values (?,?,?,?,?)`,
          [
            HOSbookAppnt.insertId,
            AppointmentEntity.doctor,
            AppointmentEntity.shift_id,
            position,
            AppointmentEntity.date,
          ],
        );

        await this.connection.query(
          `insert into
    appointment_payment
    (appointment_id,
      charge_id,
      paid_amount,
      payment_mode,
      payment_type,
      transaction_id,
      date) values (?,?,?,?,?,?,?)`,
          [
            hos_appointment_id,
            HOScharge_id,
            HOSamount[0].amount,
            AppointmentEntity.payment_mode.toLocaleLowerCase(),
            payment_type,
            HOStransaction_id,
            AppointmentEntity.date + ' ' + AppointmentEntity.time,
          ],
        );

        if (HOStransaction_id) {
          await this.connection.query(
            `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
            [HOSbookAppnt.insertId, HOStransaction_id],
          );
        }

        // #############################################################################################################

        let transaction_id: number;
        const caseRef = await this.dynamicConnection.query(
          'INSERT INTO case_references values(default,default)',
        );
        const opdCreate = await this.dynamicConnection.query(
          `
insert into opd_details (case_reference_id,patient_id,Hospital_id,hos_opd_id) values (?,?,?,?)`,
          [
            caseRef.insertId,
            HOSpatientId,
            AppointmentEntity.Hospital_id,
            HOSopdCreate.insertId,
          ],
        );

        const getAdminChargeId = await this.dynamicConnection.query(
          `select id from charges
where Hospital_id = ?
and hospital_charges_id = ?`,
          [AppointmentEntity.Hospital_id, HOScharge_id],
        );

        const Patient_charges = await this.dynamicConnection.query(
          `insert into patient_charges(
  date,
  opd_id,
  qty,
  charge_id,
  standard_charge, 
tax,
  apply_charge,
  amount,
  Hospital_id,
  hos_patient_charges_id,
  payment_status,
  total,
  patient_id
  ) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            AppointmentEntity.date,
            opdCreate.insertId,
            1,
            getAdminChargeId[0].id,
            HOSamount[0].standard_charge,
            HOSamount[0].tax_percentage,
            HOSamount[0].standard_charge,
            HOSamount[0].amount,
            AppointmentEntity.Hospital_id,
            Patient_charges_insert.insertId,
            payment_status,
            HOSamount[0].amount,
            HOSpatientId,
          ],
        );
        if (
          AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater' &&
          AppointmentEntity.payment_mode.toLocaleLowerCase() != 'offline'
        ) {
          try {
            const transactions = await this.dynamicConnection.query(
              `
  insert into transactions (
  type,
  section,
  patient_id,
  case_reference_id,
  amount,
  payment_mode,
  payment_date,Hospital_id,hos_transaction_id,
  patient_charges_id,
    opd_id,
     payment_gateway,
  payment_id,
  payment_reference_number,
  received_by_name
  
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                'payment',
                'Appointment',
                HOSpatientId,
                caseRef.insertId,
                HOSamount[0].amount,
                AppointmentEntity.payment_mode.toLocaleLowerCase(),
                AppointmentEntity.payment_date,
                AppointmentEntity.Hospital_id,
                HOStransaction_id,
                Patient_charges.insertId,
                opdCreate.insertId,
                AppointmentEntity.payment_gateway,
                AppointmentEntity.payment_id,
                AppointmentEntity.payment_reference_number,
                AppointmentEntity.received_by_name,
              ],
            );
            transaction_id = transactions.insertId;

            await this.dynamicConnection.query(
              `update patient_charges SET transaction_id = ? where id = ?`,
              [transactions.insertId, Patient_charges.insertId],
            );
          } catch (error) {
            return 'error in admin transaction insert';
          }
        }

        const visitInsert = await this.dynamicConnection.query(
          `
insert into visit_details(
opd_details_id,
patient_charge_id,
transaction_id,
case_type,
cons_doctor,
appointment_date,
live_consult,
payment_mode,Hospital_id,hos_visit_id
) values (?,?,?,?,?,?,?,?,?,?)`,
          [
            opdCreate.insertId,
            Patient_charges.insertId,
            transaction_id,
            '',
            adminStaffId,
            AppointmentEntity.date + ' ' + AppointmentEntity.time,
            AppointmentEntity.live_consult,
            AppointmentEntity.payment_mode.toLocaleLowerCase(),
            AppointmentEntity.Hospital_id,
            HOSvisitInsert.insertId,
          ],
        );

        const bookAppnt = await this.dynamicConnection.query(
          `insert into appointment(
    patient_id,
    case_reference_id,
    visit_details_id,
    date,
    time,
    doctor,
    source,
    global_shift_id,
    shift_id,
    live_consult,
    Hospital_id,
    hos_appointment_id,
    amount,
    message,
    appointment_status_id,
    appointment_status,
    priority
    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            HOSpatientId,
            caseRef.insertId,
            visitInsert.insertId,
            AppointmentEntity.date,
            AppointmentEntity.time,
            adminStaffId,
            'Offline',
            adminGlobalShiftId.id,
            adminShiftId.id,
            AppointmentEntity.live_consult,
            AppointmentEntity.Hospital_id,
            hos_appointment_id,
            HOSamount[0].amount,
            AppointmentEntity.message,
            AppointmentEntity.appointment_status_id,
            status_name.status,
            AppointmentEntity.priority,
          ],
        );

        await this.dynamicConnection.query(
          `insert into appointment_queue(
  appointment_id,
  staff_id,
  shift_id,
  position,
  date
  ) values (?,?,?,?,?)`,
          [
            bookAppnt.insertId,
            adminStaffId,
            adminShiftId.id,
            position,
            AppointmentEntity.date,
          ],
        );

        await this.dynamicConnection.query(
          `insert into
appointment_payment
(appointment_id,
  charge_id,
  paid_amount,
  payment_mode,
  payment_type,
  transaction_id,
  date) values (?,?,?,?,?,?,?)`,
          [
            bookAppnt.insertId,
            getAdminChargeId[0].id,
            HOSamount[0].amount,
            AppointmentEntity.payment_mode.toLocaleLowerCase(),
            payment_type,
            transaction_id,
            AppointmentEntity.date + ' ' + AppointmentEntity.time,
          ],
        );

        if (transaction_id) {
          await this.dynamicConnection.query(
            `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
            [bookAppnt.insertId, transaction_id],
          );
        }

        const dokku = `  
select appointment.id, 
patients.patient_name,
patients.aayush_unique_id,
concat('APPN','',appointment.id) as appointment_no,
 appointment.date as appointmentDate,appointment.time as appointmentTime,patients.mobileno as mobile_no,patients.email as patient_email,
 patients.gender,
        CONCAT( staff.name, ' ', staff.surname) AS doctor_name,
        staff.employee_id,
        patients.ABHA_number,
        appointment.source,appoint_priority.priority_status,appoint_priority.id priorityID,appointment.live_consult,
        appointment.appointment_status,appointment.amount,global_shift.id  as shift_id,global_shift.name as shift,doctor_shift.id as slot_id,
        doctor_shift.day as slot,
          transactions.payment_mode,transactions.payment_date,appointment.global_shift_id,appointment.doctor,
          appointment.appointment_status_id,
appointment.created_at, transactions.received_by_name from appointment
        join patients ON appointment.patient_id = patients.id
        left join staff ON appointment.doctor = staff.id
        left join appoint_priority ON appointment.priority = appoint_priority.id
left join visit_details ON appointment.visit_details_id = visit_details.id
left join transactions ON visit_details.transaction_id = transactions.id
        left join global_shift ON appointment.global_shift_id = global_shift.id
        left join doctor_shift ON appointment.shift_id = doctor_shift.id where appointment.id = ?`;

        const madar = await this.connection.query(dokku, [
          HOSbookAppnt.insertId,
        ]);

        const [getHosName] = await this.dynamicConnection.query(
          `select * from hospitals where plenome_id = ?`,
          [AppointmentEntity.Hospital_id],
        );
        const HosName = await getHosName.hospital_name;
        const HosAddress = await getHosName.address;

        const verifysmsData = {
          mobilenumber: '91' + madar[0].mobile_no,
          Patname: ' ' + madar[0].patient_name,
          Date: madar[0].appointmentDate,
          DocName: madar[0].doctor_name,
        };

        const verifyemailData = {
          email: madar[0].patient_email,
          name: ' ' + madar[0].patient_name,
          drname: 'Dr.' + madar[0].doctor_name,
          date: madar[0].appointmentDate,
          time: madar[0].appointmentTime,
          HosName: HosName,
          location: HosAddress,
        };
        this.eventEmitter.emit(
          'send-email-sms-appointment-create',
          verifysmsData,
          verifyemailData,
        );

        return [
          {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.APPOINTMENT_BOOKED,
            inserted_details: madar,
          },
        ];
      } else {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.DUPLICATE_APPOINTMENT,
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<AddAppointment[]> {
    try {
      const appointment = await this.connection.query(`
      
  select appointment.id, patients.id AS patient_id,patients.patient_name,concat('APPN','',appointment.id) as appointment_no, appointment.date,appointment.time,patients.mobileno,patients.gender,patients.age,
          CONCAT( staff.name, ' ', staff.surname )AS doctor,staff.id AS staff_id,appointment.source,appoint_priority.priority_status,appoint_priority.id priorityID,appointment.live_consult,
          appointment.amount,appointment.message,global_shift.id  as shift_id,global_shift.name as shift,doctor_shift.id as slot_id,
          doctor_shift.day as slot,
          doctor_shift.start_time as start_time, doctor_shift.end_time as End_time,
          appointment_status.id as appointment_status_id, appointment_status.status as appointment_status,
          appointment_status.color_code as color_code,
          appointment_queue.position token,
          transactions.payment_mode,
          appointment.created_at from appointment
          join patients ON appointment.patient_id = patients.id
          left join staff ON appointment.doctor = staff.id
          left join appointment_queue on appointment_queue.appointment_id = appointment.id
          left join appoint_priority ON appointment.priority = appoint_priority.id
          left join transactions ON appointment.id = transactions.appointment_id
          left join global_shift ON appointment.global_shift_id = global_shift.id
          left join doctor_shift ON appointment.shift_id = doctor_shift.id
          left join appointment_status ON appointment.appointment_status_id = appointment_status.id`);
      return appointment;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, hospital_id: number) {
    try {
      const appointment = await this.connection.query(
        `   select  
            concat(CASE
            WHEN appointment.doctor IS NOT NULL THEN 'APPN'
            ELSE 'TEMP'
        END,appointment.id) id,
            patients.id patient_id,
            patients.patient_name,patients.salutation as patient_salutation,patients.gender,patients.age,
            patients.mobileno,
            opd_details.id opd_id,
            ipd_details.id ipd_id,
            patients.dial_code,
            patients.email,
            patients.abha_address,
            patients.ABHA_number,
              CASE
              WHEN appointment.module = 'IPD' THEN concat('IPDN', ipd_details.id)
              ELSE concat('OPDN', opd_details.id)
            END as sectionId,
            CASE
                    WHEN appointment.source = 'Online' THEN 'Online Consultation '
                    ELSE 'Offline Consultation'
                END AS consultingType,
            concat("Dr. ",staff.name," ",staff.surname) doctorName,
            staff.id doctor_id,
            coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
            appointment.source,
            appointment.global_shift_id,
            appointment.shift_id,
            department.department_name,
              appointment.module,
				appoint_priority.priority_status,
            patient_charges.total Fees,

            concat(CASE
            WHEN appointment.doctor IS NOT NULL THEN 'APPN'
            ELSE 'TEMP'
        END,appointment.id) appointment_id,
            DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
            (appointment.date) date,
            DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
            time(appointment.time) time,
            global_shift.name as shift,
            concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
            appointment_status.status appointment_status,
            appointment.appointment_status_id,
            appointment.is_token_verified,
            appointment.is_consultation_closed,
            appointment_status.color_code,
            appointment_queue.position tokenNumber,
            
                appointment.message,
                case
                when appointment.doctor is null then
                patient_charges.temp_standard_charge else
                patient_charges.standard_charge end consultFees, --
                case
                when appointment.doctor is null then
                patient_charges.temp_tax else
                patient_charges.tax end taxPercentage, --
                patient_charges.additional_charge additional_charge,
                patient_charges.additional_charge_note additional_charge_note,
                patient_charges.discount_percentage discount_percentage,
                patient_charges.discount_amount discount_amount,
                patient_charges.id patientChargeId,
                case
          when appointment.doctor is null then
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else
 
            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount, --
            patient_charges.total netAmount,
COALESCE(patient_charges.balance, 0) AS balanceAmount,
            concat("TRID",transactions.id) transactionID,
            transactions.card_transaction_id,
            transactions.net_banking_transaction_id,
            transactions.upi_transaction_id,
            transactions.payment_id,
            transactions.payment_reference_number,
            transactions.payment_mode,
            transactions.payment_date,
            concat(COALESCE(transactions.net_banking_transaction_id,""),COALESCE(transactions.card_transaction_id,""),COALESCE(transactions.upi_transaction_id,""),
            COALESCE(transactions.payment_reference_number,""),
            COALESCE(transactions.cash_transaction_id,"")) payment_transaction_id,
            CASE
                    WHEN patient_charges.payment_status = 'paid' THEN  'Payment done.'
                    ELSE 'Need payment.'
                END AS payment_status,
                  case 
                   when coalesce(transactions.amount,0) then transactions.amount
                   else coalesce(transactions.temp_appt_amount,0) end as paid_amount
                
                from appointment
                left join patients on patients.id = appointment.patient_id
                                left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                left join appointment_status on appointment_status.id = appointment.appointment_status_id
                left join staff on staff.id = appointment.doctor
                                left join patient_charges on patient_charges.opd_id = opd_details.id
                left join transactions on transactions.id = patient_charges.transaction_id
                left join doctor_shift on doctor_shift.id = appointment.shift_id
                left join appointment_queue on appointment.id = appointment_queue.appointment_id
            LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
                left join global_shift ON appointment.global_shift_id = global_shift.id
                left join department ON staff.department_id = department.id
                left join appoint_priority ON appointment.priority = appoint_priority.id
                left join ipd_details on ipd_details.case_reference_id = appointment.case_reference_id
                where appointment.id = ?
                
                group by patient_id,patient_name,gender,age,mobileno,email,ABHA_number,consultingType,opd_id,
                doctorName,doctor_id,source,appointment_id,appointmentDate,appointmentTime,slot,abha_address,
                appointment_status,appointment_status_id,color_code,tokenNumber,message,consultFees,taxPercentage,
                taxAmount,netAmount,transactionID,payment_mode,payment_date,balanceAmount,payment_status,date
 `,
        [id],
      );
      const [getHosTimings] = await this.dynamicConnection.query(
        `select hospital_opening_timing,hospital_closing_timing from hospitals where plenome_id = ?`,
        [hospital_id],
      );
      let a = appointment[0];
      if (a.transactionID) {
        const trnID = a.transactionID.replace(/[a-zA-Z]/g, '');
        const [getPlenomeTransactionId] = await this.dynamicConnection.query(
          `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
          [hospital_id, trnID],
        );

        if (getPlenomeTransactionId) {
          a.plenome_transaction_id = getPlenomeTransactionId.id;
        }
      }

      appointment.forEach((a) => {
        if (!a.doctor_id) {
          a.slot =
            getHosTimings.hospital_opening_timing +
            ' - ' +
            getHosTimings.hospital_closing_timing;
          // a.end_time = getHosTimings.hospital_closing_timing;
        }
      });

      return appointment;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(numb: number, Entity: AddAppointment) {
    Entity.payment_mode = Entity.payment_mode.toLocaleLowerCase();
    if (!Entity.received_by_name || Entity.received_by_name.trim() === '') {
      throw new BadRequestException('Missing required field: received_by_name');
    }
    if (Entity.Hospital_id) {
      const [getPatDetails] = await this.connection.query(
        `select * from appointment where id = ?`,
        [numb],
      );

      const [checkDuplicateAppt] = await this.connection.query(
        `select * from appointment where patient_id = ?
         and doctor = ? and shift_id = ? and date = ? and (appointment_status_id <> 4 or appointment_status_id <> 6 ) and id <> ?`,
        [
          getPatDetails.patient_id,
          Entity.doctor,
          Entity.shift_id,
          Entity.date,
          numb,
        ],
      );

      if (checkDuplicateAppt) {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.APPOINTMENT_EXIST,
        };
      }
      const onlyDate = new Date(Entity.date).toLocaleDateString('en-CA');
      const onlyTodayDate = new Date().toLocaleDateString('en-CA');

      if (Entity.appointment_status_id > 4 && onlyDate > onlyTodayDate) {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.FUTURE_STATUS,
        };
      }

      try {
        const [getstaff_id] = await this.connection.query(
          `select * from appointment where id = ?`,
          [numb],
        );
        let adminApptStatusId = Entity.appointment_status_id;

        const doc_id = getstaff_id.doctor;

        const currentDate = new Date();

        const formattedDate = currentDate.toISOString().split('T')[0];

        if (Entity.payment_mode) {
          // if (Entity.payment_mode.toLocaleLowerCase() != "cash" && Entity.payment_mode.toLocaleLowerCase() != "cheque" && Entity.payment_mode.toLocaleLowerCase() != "offline" && Entity.payment_mode.toLocaleLowerCase() != "paylater")
          if (Entity.payment_mode == 'online') {
            if (!Entity.payment_gateway) {
              return {
                status: process.env.ERROR_STATUS,
                message: process.env.PAYMENT_GATEWAY,
              };
            }

            if (Entity.payment_gateway.toLocaleLowerCase() == 'razorpay') {
              try {
                const [getPaymentGatewayDetails] =
                  await this.dynamicConnection.query(
                    `select * from hospital_payment_gateway_details where hospital_id = ? and payment_gateway = ?`,
                    [getstaff_id.Hospital_id, 'razorpay'],
                  );

                // this.TransferToSubmerchant(Entity.payment_id, getPaymentGatewayDetails)
              } catch (error) {
                return error;
              }

              if (!Entity.payment_reference_number || !Entity.payment_id) {
                if (!Entity.payment_reference_number) {
                  Entity.payment_reference_number = 'NA';
                }
                if (!Entity.payment_id) {
                  Entity.payment_id = 'NA';
                }
                return {
                  status: process.env.ERROR_STATUS,
                  message: process.env.PAYMENT_REFERENCE,
                };
              }
            }
          }
        }

        if (doc_id) {
          if (doc_id == Entity.doctor) {
            try {
              const HosVisitDetailsId = await getstaff_id.visit_details_id;
              const [HosPatientCharges] = await this.connection.query(
                `select * from visit_details where id = ?`,
                [HosVisitDetailsId],
              );
              const [HosAppointQueue] = await this.connection.query(
                `select * from appointment_queue where appointment_id = ?`,
                [numb],
              );
              const [HosAppointPayment] = await this.connection.query(
                `select * from appointment_payment where appointment_id = ?`,
                [numb],
              );

              let payment_status;
              const [HossssPatientCharges] = await this.connection.query(
                `select * from patient_charges where id = ?`,
                [HosPatientCharges.patient_charge_id],
              );

              if (
                Entity.payment_mode.toLocaleLowerCase() == `cash` ||
                Entity.payment_mode.toLocaleLowerCase() == `upi` ||
                Entity.payment_mode.toLocaleLowerCase() == `cheque` ||
                Entity.payment_mode.toLocaleLowerCase() == `online` ||
                Entity.payment_mode.toLocaleLowerCase() == `card` ||
                Entity.payment_mode.toLocaleLowerCase() == `neft` ||
                Entity.payment_mode.toLocaleLowerCase() == 'net_banking'
              ) {
                payment_status = `paid`;
              } else {
                payment_status = `unpaid`;
              }

              await this.connection.query(
                `update patient_charges set date= ?,payment_status = ?
            where id = ?`,
                [
                  Entity.date,
                  payment_status,
                  HosPatientCharges.patient_charge_id,
                ],
              );

              await this.connection.query(
                `update visit_details set appointment_date = ?,
            live_consult = ? where id = ?`,
                [
                  Entity.date + ' ' + Entity.time,
                  Entity.live_consult,
                  HosVisitDetailsId,
                ],
              );

              await this.connection.query(
                `update appointment set date = ?,time = ?,
            global_shift_id = ?,shift_id = ?,live_consult = ?,appointment_status_id = ?,appointment_status = ?,message = ? where id = ?`,
                [
                  Entity.date,
                  Entity.time,
                  Entity.global_shift_id,
                  Entity.shift_id,
                  Entity.live_consult,
                  Entity.appointment_status_id,
                  Entity.appointment_status,
                  Entity.message,
                  numb,
                ],
              );

              let position;

              if (Entity.date != formattedDate) {
                position = null;
                await this.connection.query(
                  `update appointment_queue set shift_id = ?,date = ?,position = ?
                where id = ?`,
                  [Entity.shift_id, Entity.date, position, HosAppointQueue.id],
                );
              } else {
                const [getLastPosition] = await this.connection.query(
                  `select position from
                    appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `,
                  [Entity.date, Entity.doctor, Entity.shift_id],
                );

                if (HosAppointQueue.position) {
                  position = HosAppointQueue.position;
                } else {
                  if (getLastPosition) {
                    position = getLastPosition.position + 1;
                  } else {
                    position = 1;
                  }
                }

                await this.connection.query(
                  `update appointment_queue set shift_id = ?,
                    position = ?,date = ?
                  where id = ?`,
                  [Entity.shift_id, position, Entity.date, HosAppointQueue.id],
                );
              }

              await this.connection.query(
                `update appointment_payment set date = ? where id = ?`,
                [Entity.date, HosAppointPayment.id],
              );

              const [getAdminAppointdetails] =
                await this.dynamicConnection.query(
                  `select * from appointment
  where hos_appointment_id = ? and Hospital_id = ?`,
                  [numb, Entity.Hospital_id],
                );
              const AdminAppointmentId = await getAdminAppointdetails.id;

              const AdminVisitDetailsId =
                await getAdminAppointdetails.visit_details_id;
              const [AdminPatientChargeId] = await this.dynamicConnection.query(
                `select * from visit_details where id = ?`,
                [AdminVisitDetailsId],
              );
              const [AdminAppointmentQueue] =
                await this.dynamicConnection.query(
                  `select * from appointment_queue where appointment_id = ?`,
                  [AdminAppointmentId],
                );
              const [AdminAppointmentPayment] =
                await this.dynamicConnection.query(
                  `select * from appointment_payment where appointment_id = ?`,
                  [AdminAppointmentId],
                );

              await this.dynamicConnection.query(
                `update patient_charges set date= ?,payment_status = ?
  where id = ?`,
                [
                  Entity.date,
                  payment_status,
                  AdminPatientChargeId.patient_charge_id,
                ],
              );

              const [getPatientchargesAdmin] =
                await this.dynamicConnection.query(
                  `select * from patient_charges where id = ?`,
                  [AdminPatientChargeId.patient_charge_id],
                );

              if (!Entity.txn_id) {
                Entity.txn_id = 'NA';
              }

              if (!Entity.bank_ref_id) {
                Entity.bank_ref_id = 'NA';
              }

              if (!Entity.pg_ref_id) {
                Entity.pg_ref_id = 'NA';
              }

              if (
                HossssPatientCharges.payment_status == 'partially_paid' &&
                payment_status == 'paid'
              ) {
                const [getAdmintransactionDetails] =
                  await this.dynamicConnection.query(
                    `select * from transactions

      where appointment_id = ? `,
                    [AdminAppointmentId],
                  );

                const [getHosTrdID] = await this.connection.query(
                  `select * from transactions

         where appointment_id = ?`,
                  [numb],
                );

                await this.dynamicConnection.query(
                  `update transactions

      set amount = ?,

       payment_mode = ?,

       payment_date = ?,

       received_by_name = ?

       where id = ?`,
                  [
                    Entity.amount,

                    Entity.payment_mode,

                    Entity.payment_date,

                    Entity.received_by_name,

                    getAdmintransactionDetails.id,
                  ],
                );

                await this.connection.query(
                  `update transactions

        set amount = ?,

        payment_date = ?,

         payment_mode = ?,

         received_by_name = ?

         where id = ?`,
                  [
                    Entity.amount,

                    Entity.payment_date,

                    Entity.payment_mode,

                    Entity.received_by_name,

                    getHosTrdID.id,
                  ],
                );
              }

              if (
                payment_status == 'paid' &&
                HossssPatientCharges.payment_status == 'unpaid'
              ) {
                const [getHosApptDetails] = await this.connection.query(
                  `select * from appointment where id = ?`,
                  [numb],
                );

                const insert_transactionsHos = await this.connection.query(
                  `insert into transactions (

            txn_id,

            pg_ref_id,

            bank_ref_id,

            type,

            section,

            patient_id,

            case_reference_id,

            patient_charges_id,

            appointment_id,

            amount,

            payment_mode,

            payment_date,
            
            received_by_name

            ) values (?,?,?,?,?,?,?,?,?,?,?,?,?)

            `,
                  [
                    Entity.txn_id,

                    Entity.pg_ref_id,

                    Entity.bank_ref_id,

                    'payment',

                    'Appointment',

                    getHosApptDetails.patient_id,

                    getHosApptDetails.case_reference_id,

                    HossssPatientCharges.id,

                    getHosApptDetails.id,

                    Entity.amount,

                    Entity.payment_mode,

                    Entity.payment_date,

                    Entity.received_by_name,
                  ],
                );

                await this.connection.query(
                  `update patient_charges set transaction_id = ? where id = ?`,
                  [
                    insert_transactionsHos.insertId,
                    HosPatientCharges.patient_charge_id,
                  ],
                );

                const insert_transactions = await this.dynamicConnection.query(
                  `insert into transactions (

            txn_id,

            pg_ref_id,

            bank_ref_id,

            type,

            section,

            patient_id,

            case_reference_id,

            patient_charges_id,

            appointment_id,

            amount,

            payment_mode,

            payment_date,

            received_by_name,

            Hospital_id,

            hos_transaction_id)  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)

            `,
                  [
                    Entity.txn_id,

                    Entity.pg_ref_id,

                    Entity.bank_ref_id,

                    'payment',

                    'Appointment',

                    getAdminAppointdetails.patient_id,

                    getAdminAppointdetails.case_reference_id,

                    getAdminAppointdetails.patient_charge_id,

                    getAdminAppointdetails.id,

                    Entity.amount,

                    Entity.payment_mode,

                    Entity.payment_date,

                    Entity.received_by_name,

                    Entity.Hospital_id,

                    insert_transactionsHos.insertId,
                  ],
                );

                await this.dynamicConnection.query(
                  `update patient_charges set transaction_id = ? where id = ?`,
                  [
                    insert_transactions.insertId,
                    AdminPatientChargeId.patient_charge_id,
                  ],
                );
              }

              await this.dynamicConnection.query(
                `update visit_details set appointment_date = ?,
  live_consult = ? where id = ?`,
                [
                  Entity.date + ' ' + Entity.time,
                  Entity.live_consult,
                  AdminVisitDetailsId,
                ],
              );

              const [AdminGlobalShiftdetails] =
                await this.dynamicConnection.query(
                  `select * from global_shift where hospital_global_shift_id = ?`,
                  [Entity.global_shift_id],
                );

              const [AdminShiftDetails] = await this.dynamicConnection.query(
                `select * from doctor_shift where hospital_doctor_shift_id = ?`,
                [Entity.shift_id],
              );

              await this.dynamicConnection.query(
                `update appointment set date = ?,time = ?,
  global_shift_id = ?,shift_id = ?,live_consult = ?,appointment_status_id = ?,appointment_status = ?,  message = ?
   where id = ?`,
                [
                  Entity.date,
                  Entity.time,
                  AdminGlobalShiftdetails.id,
                  AdminShiftDetails.id,
                  Entity.live_consult,
                  adminApptStatusId,
                  Entity.appointment_status,
                  Entity.message,
                  AdminAppointmentId,
                ],
              );

              if (Entity.date != formattedDate) {
                position = null;
                await this.dynamicConnection.query(
                  `update appointment_queue set shift_id = ?,date = ?,position = ?
  where id = ?`,
                  [
                    AdminShiftDetails.id,
                    Entity.date,
                    position,
                    AdminAppointmentQueue.id,
                  ],
                );
              } else {
                await this.dynamicConnection.query(
                  `update appointment_queue set shift_id = ?,position = ?,date = ?
   where id = ?`,
                  [
                    AdminShiftDetails.id,
                    position,
                    Entity.date,
                    AdminAppointmentQueue.id,
                  ],
                );
              }

              await this.dynamicConnection.query(
                `update appointment_payment set date = ? where id = ?`,
                [Entity.date, AdminAppointmentPayment.id],
              );

              const [result] = await this.connection.query(
                `select  
  patients.id patient_id,
  patients.patient_name,patients.gender,patients.age,
  patients.aayush_unique_id,
  patients.mobileno,
  patients.email,
  patients.ABHA_number,
  CASE
        WHEN appointment.live_consult = 'yes' THEN 'Online Consultation '
        ELSE 'Offline Consultation'
    END AS consultingType,
  concat(staff.name,"",staff.surname) doctorName,
  staff.id doctor_id,
  staff.employee_id,
  coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  appointment.source,
  concat("APPN",appointment.id) appointment_id,
  DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
  date(appointment.date) date,
  DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
  concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment_status.color_code,
  appointment_queue.position tokenNumber,
   
    appointment.message,
    patient_charges.standard_charge consultFees,
    patient_charges.tax taxPercentage,
  format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) taxAmount,
  patient_charges.total netAmount,
  patient_charges.balance balanceAmount,
  transactions.id transactionID,
  transactions.payment_mode,
  transactions.payment_date,
  CASE
        WHEN patient_charges.payment_status = 'paid' THEN  'Payment done.'
        ELSE 'Need payment.'
    END AS payment_status
   
   
    from appointment
    left join patients on patients.id = appointment.patient_id
    left join appointment_status on appointment_status.id = appointment.appointment_status_id
    left join staff on staff.id = appointment.doctor
    left join transactions on transactions.appointment_id = appointment.id
    left join doctor_shift on doctor_shift.id = appointment.shift_id
    left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
    left join patient_charges on patient_charges.opd_id = opd_details.id
    left join appointment_queue on appointment.id = appointment_queue.appointment_id
  LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
   
    where appointment.id = ?
   
    group by patient_id,patient_name,gender,age,mobileno,email,ABHA_number,consultingType,employee_id,aayush_unique_id,
    doctorName,doctor_id,source,appointment_id,appointmentDate,appointmentTime,slot,
    appointment_status,appointment_status_id,color_code,tokenNumber,message,consultFees,taxPercentage,
    taxAmount,netAmount,transactionID,payment_mode,payment_date,balanceAmount,payment_status,date
   
    `,
                [numb],
              );
              return [
                {
                  status: process.env.SUCCESS_STATUS_V2,
                  message: process.env.APPOINTMENT_UPDATED,
                  updated_value: result,
                },
              ];
            } catch (error) {
              return 'error is : ' + error;
            }
          } else {
            return {
              status: process.env.ERROR_STATUS,
              message: process.env.CANNOT_CHAGE_DOCTOR,
            };
          }
        } else {
          if (Entity.doctor) {
            const [getHosStaffdetails] = await this.connection.query(
              `select * from staff where id = ?`,
              [Entity.doctor],
            );

            const [HosChargeId] = await this.connection.query(
              `select * from shift_details where staff_id = ?`,
              [Entity.doctor],
            );

            const [getAmountDetails] = await this.connection.query(
              `
    select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
      (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
    charges join tax_category on charges.tax_category_id = tax_category.id
    where charges.id = ?`,
              [HosChargeId.charge_id],
            );

            const HosssVisitDetailsId = await getstaff_id.visit_details_id;
            const [HossPatientCharges] = await this.connection.query(
              `select * from visit_details where id = ?`,
              [HosssVisitDetailsId],
            );

            const [HossAppointQueue] = await this.connection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [numb],
            );
            const [HossAppointPayment] = await this.connection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [numb],
            );

            const [HossssPatientCharges] = await this.connection.query(
              `select * from patient_charges where id = ?`,
              [HossPatientCharges.patient_charge_id],
            );

            let payment_status;

            if (
              Entity.payment_mode.toLocaleLowerCase() == `cash` ||
              Entity.payment_mode.toLocaleLowerCase() == `upi` ||
              Entity.payment_mode.toLocaleLowerCase() == `cheque` ||
              Entity.payment_mode.toLocaleLowerCase() == `online` ||
              Entity.payment_mode.toLocaleLowerCase() == `card` ||
              Entity.payment_mode.toLocaleLowerCase() == `neft` ||
              Entity.payment_mode.toLocaleLowerCase() == 'net_banking'
            ) {
              payment_status = `paid`;
            } else {
              payment_status = `unpaid`;
            }

            const Balance =
              HossssPatientCharges.temp_amount - getAmountDetails.amount;

            await this.connection.query(
              `update patient_charges set date= ?,
    charge_id=?,standard_charge=?,
    tax=?,apply_charge=?,amount=?, total = ?, balance = ?, payment_status = ? where id = ?`,
              [
                Entity.date,
                HosChargeId.charge_id,
                getAmountDetails.standard_charge,
                getAmountDetails.tax_percentage,
                getAmountDetails.standard_charge,
                getAmountDetails.amount,
                getAmountDetails.amount,
                Balance,
                payment_status,
                HossPatientCharges.patient_charge_id,
              ],
            );

            await this.connection.query(
              `update visit_details set appointment_date = ?,cons_doctor = ?,
      live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                Entity.doctor,
                Entity.live_consult,
                HosssVisitDetailsId,
              ],
            );

            await this.connection.query(
              `update appointment set date = ?,time = ?,doctor=?,
      global_shift_id = ?,shift_id = ?,live_consult = ?,amount=?, appointment_status_id = ?,appointment_status = ? where id = ?`,
              [
                Entity.date,
                Entity.time,
                Entity.doctor,
                Entity.global_shift_id,
                Entity.shift_id,
                Entity.live_consult,
                getAmountDetails.amount,
                2,
                'Reserved',
                numb,
              ],
            );

            let position;

            if (Entity.date != formattedDate) {
              position = null;

              await this.connection.query(
                `update appointment_queue set shift_id = ?,
      date = ?,position = ?,staff_id = ?
      where id = ?`,
                [
                  Entity.shift_id,
                  Entity.date,
                  position,
                  Entity.doctor,
                  HossAppointQueue.id,
                ],
              );
            } else {
              const [getlastpsn] = await this.connection.query(
                `SELECT * FROM appointment_queue
           where staff_id = ?
        and date = ? and shift_id = ? order by position desc limit  1 `,
                [Entity.doctor, Entity.date, Entity.shift_id],
              );
              if (HossAppointQueue.position) {
                position = HossAppointQueue.position;
              } else {
                if (getlastpsn) {
                  position = getlastpsn.position + 1;
                } else {
                  position = 1;
                }
              }

              await this.connection.query(
                `update appointment_queue set shift_id = ?,
        date = ?,staff_id = ?,position = ?
        where id = ?`,
                [
                  Entity.shift_id,
                  Entity.date,
                  Entity.doctor,
                  position,
                  HossAppointQueue.id,
                ],
              );
            }

            await this.connection.query(
              `update appointment_payment set date = ? where id = ?`,
              [Entity.date, HossAppointPayment.id],
            );

            //aadmin updattee######################################################################################################3

            const [getAdminnAppointdetails] =
              await this.dynamicConnection.query(
                `select * from appointment where hos_appointment_id = ? and Hospital_id = ?`,
                [numb, Entity.Hospital_id],
              );
            const AdminnnAppointmentId = await getAdminnAppointdetails.id;
            const [getAdminStaffdetails] = await this.dynamicConnection.query(
              `select * from staff where email = ?`,
              [getHosStaffdetails.email],
            );
            const [getAdminnGlobalShiftId] = await this.dynamicConnection.query(
              `select * from global_shift where hospital_global_shift_id = ?`,
              [Entity.global_shift_id],
            );
            const [getAdminnShiftId] = await this.dynamicConnection.query(
              `select * from doctor_shift where hospital_doctor_shift_id = ?`,
              [Entity.shift_id],
            );

            const [getAdminchargeId] = await this.dynamicConnection.query(
              `select * from shift_details where staff_id = ?`,
              [getAdminStaffdetails.id],
            );

            const [getAdminAmountDetails] = await this.dynamicConnection.query(
              `
    select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
      (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
    charges join tax_category on charges.tax_category_id = tax_category.id
    where charges.id = ?`,
              [getAdminchargeId.charge_id],
            );

            const AdminnVisitDetailsId =
              await getAdminnAppointdetails.visit_details_id;

            const [AdminnPatientCharges] = await this.dynamicConnection.query(
              `select * from visit_details where id = ?`,
              [AdminnVisitDetailsId],
            );

            const [AdminnAppointQueue] = await this.dynamicConnection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [AdminnnAppointmentId],
            );
            const [AdminnAppointPayment] = await this.dynamicConnection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [AdminnnAppointmentId],
            );

            await this.dynamicConnection.query(
              `update patient_charges set date= ?,charge_id=?,standard_charge=?,
            tax=?,apply_charge=?,amount=?, total = ?, balance = ?, payment_status = ? where id = ?`,
              [
                Entity.date,
                getAdminchargeId.charge_id,
                getAdminAmountDetails.standard_charge,
                getAdminAmountDetails.tax_percentage,
                getAdminAmountDetails.standard_charge,
                getAdminAmountDetails.amount,
                getAdminAmountDetails.amount,
                Balance,
                payment_status,
                AdminnPatientCharges.patient_charge_id,
              ],
            );

            if (!Entity.txn_id) {
              Entity.txn_id = 'NA';
            }

            if (!Entity.bank_ref_id) {
              Entity.bank_ref_id = 'NA';
            }

            if (!Entity.pg_ref_id) {
              Entity.pg_ref_id = 'NA';
            }

            if (
              HossssPatientCharges.payment_status == 'partially_paid' &&
              payment_status == 'paid'
            ) {
              const [getAdmintransactionDetails] =
                await this.dynamicConnection.query(
                  `select * from transactions
   
                  where appointment_id = ? `,
                  [getAdminnAppointdetails.id],
                );

              const [getHosTrdID] = await this.connection.query(
                `select * from transactions
   
                     where appointment_id = ?`,
                [numb],
              );

              await this.dynamicConnection.query(
                `update transactions
   
                  set amount = ?,
   
                   payment_mode = ?,

                   payment_date = ?,

                   received_by_name = ?
   
                   where id = ?`,
                [
                  Entity.amount,

                  Entity.payment_mode,

                  Entity.payment_date,

                  Entity.received_by_name,

                  getAdmintransactionDetails.id,
                ],
              );

              await this.connection.query(
                `update transactions
   
                    set amount = ?,
   
                     payment_mode = ?,

                     payment_date = ?,

                     received_by_name = ?
   
                     where id = ?`,
                [
                  Entity.amount,

                  Entity.payment_mode,

                  Entity.payment_date,

                  Entity.received_by_name,

                  getHosTrdID.id,
                ],
              );
            }

            if (
              payment_status == 'paid' &&
              HossssPatientCharges.payment_status == 'unpaid'
            ) {
              const [getHosApptDetails] = await this.connection.query(
                `select * from appointment where id = ?`,
                [numb],
              );

              const insert_transactionsHos = await this.connection.query(
                `insert into transactions (
   
                        txn_id,
   
                        pg_ref_id,
   
                        bank_ref_id,
   
                        type,
   
                        section,
   
                        patient_id,
   
                        case_reference_id,
   
                        patient_charges_id,
   
                        appointment_id,
   
                        amount,
   
                        payment_mode,
   
                        payment_date,
                        
                        received_by_name) values (?,?,?,?,?,?,?,?,?,?,?,?,?)
   
                        `,
                [
                  Entity.txn_id,

                  Entity.pg_ref_id,

                  Entity.bank_ref_id,

                  'payment',

                  'Appointment',

                  getHosApptDetails.patient_id,

                  getHosApptDetails.case_reference_id,

                  HossssPatientCharges.id,

                  getHosApptDetails.id,

                  Entity.amount,

                  Entity.payment_mode,

                  Entity.payment_date,

                  Entity.received_by_name,
                ],
              );
              await this.connection.query(
                `update patient_charges set transaction_id = ? where id = ?`,
                [
                  insert_transactionsHos.insertId,
                  HossPatientCharges.patient_charge_id,
                ],
              );

              const insert_transactions = await this.dynamicConnection.query(
                `insert into transactions (
   
                        txn_id,
   
                        pg_ref_id,
   
                        bank_ref_id,
   
                        type,
   
                        section,
   
                        patient_id,
   
                        case_reference_id,
   
                        patient_charges_id,
   
                        appointment_id,
   
                        amount,
   
                        payment_mode,
   
                        payment_date,

                        received_by_name,
   
                        Hospital_id,
   
                        hos_transaction_id)  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
   
                        `,
                [
                  Entity.txn_id,

                  Entity.pg_ref_id,

                  Entity.bank_ref_id,

                  'payment',

                  'Appointment',

                  getAdminnAppointdetails.patient_id,

                  getAdminnAppointdetails.case_reference_id,

                  AdminnPatientCharges.patient_charge_id,

                  getAdminnAppointdetails.id,

                  Entity.amount,

                  Entity.payment_mode,

                  Entity.payment_date,

                  Entity.received_by_name,

                  Entity.Hospital_id,

                  insert_transactionsHos.insertId,
                ],
              );
              await this.dynamicConnection.query(
                `update patient_charges set transaction_id = ? where id = ?`,
                [
                  insert_transactions.insertId,
                  AdminnPatientCharges.patient_charge_id,
                ],
              );
            }

            await this.dynamicConnection.query(
              `update visit_details set appointment_date = ?,cons_doctor = ?,
              live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                getAdminStaffdetails.id,
                Entity.live_consult,
                AdminnVisitDetailsId,
              ],
            );

            await this.dynamicConnection.query(
              `update appointment set date = ?,time = ?,doctor=?,
              global_shift_id = ?,shift_id = ?,live_consult = ?,amount=?,appointment_status_id = ?,appointment_status = ? where id = ?`,
              [
                Entity.date,
                Entity.time,
                getAdminStaffdetails.id,
                getAdminnGlobalShiftId.id,
                getAdminnShiftId.id,
                Entity.live_consult,
                getAdminAmountDetails.amount,
                2,
                'Reserved',
                AdminnnAppointmentId,
              ],
            );

            if (Entity.date != formattedDate) {
              position = null;
              await this.dynamicConnection.query(
                `update appointment_queue set shift_id = ?,
              date = ?,position = ?,staff_id = ?
              where id = ?`,
                [
                  getAdminnShiftId.id,
                  Entity.date,
                  position,
                  getAdminStaffdetails.id,
                  AdminnAppointQueue.id,
                ],
              );
            } else {
              const [getlastpsn] = await this.dynamicConnection.query(
                `SELECT * FROM appointment_queue
                  where staff_id = ?
                and date = ? and shift_id = ? order by position desc limit  1 `,
                [getAdminStaffdetails.id, Entity.date, getAdminnShiftId.id],
              );
              if (AdminnAppointQueue.position) {
                position = AdminnAppointQueue.position;
              } else {
                if (getlastpsn) {
                  position = getlastpsn.position + 1;
                } else {
                  position = 1;
                }
              }
              await this.dynamicConnection.query(
                `update appointment_queue set shift_id = ?,
                date = ?,staff_id = ?, position = ?
                where id = ?`,
                [
                  getAdminnShiftId.id,
                  Entity.date,
                  getAdminStaffdetails.id,
                  position,
                  AdminnAppointQueue.id,
                ],
              );
            }

            await this.dynamicConnection.query(
              `update appointment_payment set date = ? where id = ?`,
              [Entity.date, AdminnAppointPayment.id],
            );

            const [reslt] = await this.connection.query(
              `select  
  patients.id patient_id,
  patients.patient_name,patients.gender,patients.age,
  patients.mobileno,
  patients.email,
  patients.ABHA_number,
  patients.aayush_unique_id,
  staff.employee_id,
  CASE
         WHEN appointment.live_consult = 'yes' THEN 'Online Consultation '
         ELSE 'Offline Consultation'
     END AS consultingType,
  concat(staff.name,"",staff.surname) doctorName,
  staff.id doctor_id,
  coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  appointment.source,
  concat("APPN",appointment.id) appointment_id,
  DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
  date(appointment.date) date,
  DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
  concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment_status.color_code,
  appointment_queue.position tokenNumber,
   
     appointment.message,
     patient_charges.standard_charge consultFees,
     patient_charges.tax taxPercentage,
  format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) taxAmount,
  patient_charges.total netAmount,
  patient_charges.balance balanceAmount,
  transactions.id transactionID,
  transactions.payment_mode,
  transactions.payment_date,
  transactions.received_by_name,
  CASE
         WHEN patient_charges.payment_status = 'paid' THEN  'Payment done.'
         ELSE 'Need payment.'
     END AS payment_status
     
     
     from appointment
     left join patients on patients.id = appointment.patient_id
     left join appointment_status on appointment_status.id = appointment.appointment_status_id
     left join staff on staff.id = appointment.doctor
     left join transactions on transactions.appointment_id = appointment.id
     left join doctor_shift on doctor_shift.id = appointment.shift_id
     left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
     left join patient_charges on patient_charges.opd_id = opd_details.id
     left join appointment_queue on appointment.id = appointment_queue.appointment_id
  LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
     
     where appointment.id = ?
     
     group by patient_id,patient_name,gender,age,mobileno,email,ABHA_number,consultingType,aayush_unique_id,employee_id,
     doctorName,doctor_id,source,appointment_id,appointmentDate,appointmentTime,slot,
     appointment_status,appointment_status_id,color_code,tokenNumber,message,consultFees,taxPercentage,
     taxAmount,netAmount,transactionID,payment_mode,payment_date,balanceAmount,payment_status,date
     
     `,
              [numb],
            );

            return [
              {
                status: process.env.SUCCESS_STATUS_V2,
                message: process.env.APPOINTMENT_UPDATED,
                updated_value: reslt,
              },
            ];
          } else {
            const [getAPPDetails] = await this.connection.query(
              `select * from appointment where id = ?`,
              [numb],
            );
            const HOSSVisitDetailsId = await getAPPDetails.visit_details_id;
            const [HOSSPatientCharges] = await this.connection.query(
              `select * from visit_details where id = ?`,
              [HOSSVisitDetailsId],
            );
            const [HOSSAppointQueue] = await this.connection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [numb],
            );
            const [HOSSAppointPayment] = await this.connection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [numb],
            );

            await this.connection.query(
              `update patient_charges set date= ? where id = ?`,
              [Entity.date, HOSSPatientCharges.patient_charge_id],
            );

            await this.connection.query(
              `update visit_details set appointment_date = ?,
      live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                Entity.live_consult,
                HOSSVisitDetailsId,
              ],
            );

            await this.connection.query(
              `update appointment set date = ?,time = ?,
      live_consult = ?,appointment_status_id = ? ,appointment_status = ? where id = ?`,
              [
                Entity.date,
                Entity.time,
                Entity.live_consult,
                Entity.appointment_status_id,
                Entity.appointment_status,
                numb,
              ],
            );

            await this.connection.query(
              `update appointment_queue set date = ?
      where id = ?`,
              [Entity.date, HOSSAppointQueue.id],
            );

            await this.connection.query(
              `update appointment_payment set date = ? where id = ?`,
              [Entity.date, HOSSAppointPayment.id],
            );

            //update admin temp doctorless appointment

            const [getADMINAPPDetails] = await this.dynamicConnection.query(
              `select * from appointment where hos_appointment_id = ? and Hospital_id = ?`,
              [numb, Entity.Hospital_id],
            );
            const ADMINVisitDetailsId =
              await getADMINAPPDetails.visit_details_id;
            const [ADMINPatientCharges] = await this.dynamicConnection.query(
              `select * from visit_details where id = ?`,
              [ADMINVisitDetailsId],
            );
            const [ADMINAppointQueue] = await this.dynamicConnection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [getADMINAPPDetails.id],
            );
            const [ADMINAppointPayment] = await this.dynamicConnection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [getADMINAPPDetails.id],
            );

            await this.dynamicConnection.query(
              `update patient_charges set date= ? where id = ?`,
              [Entity.date, ADMINPatientCharges.patient_charge_id],
            );

            await this.dynamicConnection.query(
              `update visit_details set appointment_date = ?,
          live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                Entity.live_consult,
                ADMINVisitDetailsId,
              ],
            );

            await this.dynamicConnection.query(
              `update appointment set date = ?,time = ?,live_consult = ?,appointment_status_id = ?,appointment_status = ? where id = ?`,
              [
                Entity.date,
                Entity.time,
                Entity.live_consult,
                adminApptStatusId,
                Entity.appointment_status,
                getADMINAPPDetails.id,
              ],
            );

            await this.dynamicConnection.query(
              `update appointment_queue set date = ?
          where id = ?`,
              [Entity.date, ADMINAppointQueue.id],
            );

            await this.dynamicConnection.query(
              `update appointment_payment
          set date = ? where id = ?`,
              [Entity.date, ADMINAppointPayment.id],
            );

            const [reslt] = await this.connection.query(
              `select  
          patients.id patient_id,
          patients.patient_name,patients.gender,patients.age,
          patients.mobileno,
          patients.email,
          patients.aayush_unique_id,
          staff.employee_id,
          patients.ABHA_number,
          CASE
                  WHEN appointment.live_consult = 'yes' THEN 'Online Consultation '
                  ELSE 'Offline Consultation'
              END AS consultingType,
          concat(staff.name,"",staff.surname) doctorName,
          staff.id doctor_id,
          coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
          appointment.source,
          concat("APPN",appointment.id) appointment_id,
          DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
          date(appointment.date) date,
          DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
          concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
          appointment_status.status appointment_status,
          appointment.appointment_status_id,
          appointment_status.color_code,
          appointment_queue.position tokenNumber,
         
              appointment.message,
              patient_charges.standard_charge consultFees,
              patient_charges.tax taxPercentage,
          format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) taxAmount,
          patient_charges.total netAmount,
          patient_charges.balance balanceAmount,
          transactions.id transactionID,
          transactions.payment_mode,
          transactions.payment_date,
          CASE
                  WHEN patient_charges.payment_status = 'paid' THEN  'Payment done.'
                  ELSE 'Need payment.'
              END AS payment_status
             
             
              from appointment
              left join patients on patients.id = appointment.patient_id
              left join appointment_status on appointment_status.id = appointment.appointment_status_id
              left join staff on staff.id = appointment.doctor
              left join transactions on transactions.appointment_id = appointment.id
              left join doctor_shift on doctor_shift.id = appointment.shift_id
              left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
              left join patient_charges on patient_charges.opd_id = opd_details.id
              left join appointment_queue on appointment.id = appointment_queue.appointment_id
          LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
             
              where appointment.id = ?
             
              group by patient_id,patient_name,gender,age,mobileno,email,ABHA_number,consultingType,
              doctorName,doctor_id,source,appointment_id,appointmentDate,appointmentTime,slot,
              appointment_status,appointment_status_id,color_code,tokenNumber,message,consultFees,taxPercentage,
              taxAmount,netAmount,transactionID,payment_mode,payment_date,balanceAmount,payment_status,date
             
              `,
              [numb],
            );

            return [
              {
                status: process.env.SUCCESS_STATUS_V2,
                message: process.env.APPOINTMENT_UPDATED,
                updated_values: reslt,
              },
            ];
          }
        }
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: process.env.ERROR_MESSAGE,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      return {
        status: process.env.ERROR_STATUS,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
  }

  async remove(id: string, hos_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.dynamicConnection.query(
        `update appointment set is_deleted = 1 where Hospital_id = ?
      and hos_appointment_id = ?`,
        [hos_id, id],
      );

      await this.connection.query(
        'DELETE FROM appointment_status_tracking where appointment_id = ?',
        [id],
      );

      await this.connection.query('DELETE FROM appointment WHERE id = ?', [id]);

      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async set_status_to_approved(appointment_id: number, hos_id: number) {
    try {
      const [appointment] = await this.connection.query(
        `SELECT * FROM appointment WHERE id = ?`,
        [appointment_id],
      );

      if (appointment && parseInt(appointment.appointment_status_id) == 2) {
        await this.connection.query(
          `UPDATE appointment SET appointment_status = 'Approved' , appointment_status_id = '3' WHERE id = ?`,
          [appointment_id],
        );

        await this.dynamicConnection.query(
          `UPDATE appointment SET appointment_status = 'Approved' , 
        appointment_status_id = '3'  where Hospital_id = ? 
       and hos_appointment_id = ?`,
          [hos_id, appointment_id],
        );

        return {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.APPOINTMENT_UPDATED,
        };
      } else if (
        appointment &&
        parseInt(appointment.appointment_status_id) == 3
      ) {
        await this.connection.query(
          `UPDATE appointment SET appointment_status = 'InProcess' , appointment_status_id = '5' WHERE id = ?`,
          [appointment_id],
        );

        await this.dynamicConnection.query(
          `
            UPDATE appointment SET appointment_status = 'InProcess' ,
            appointment_status_id = '5'  where Hospital_id = ?
            and hos_appointment_id = ?`,
          [hos_id, appointment_id],
        );

        return {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.APPOINTMENT_STATUS,
        };
      } else {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.RESERVED_APPOINTMENT,
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelAppointment(id: string, Entity: AddAppointment) {
    let numb = id.replace(/[a-zA-Z]/g, '');

    if (Entity.Hospital_id) {
      try {
        await this.connection.query(
          `update appointment set appointment_status = ?,
      appointment_status_id = ?,appointment_cancellation_reason = ? where id = ?`,
          ['Cancelled', 4, Entity.cancellationReason, numb],
        );

        const [adminApptId] = await this.dynamicConnection.query(
          `select id, patient_id from appointment where Hospital_id = ? and hos_appointment_id = ?`,
          [Entity.Hospital_id, numb],
        );
        await this.dynamicConnection.query(
          `update appointment set appointment_status = ?,
      appointment_status_id = ?,appointment_cancellation_reason = ? where id = ?`,
          ['Cancelled', 4, Entity.cancellationReason, adminApptId.id],
        );

        const [getHosName] = await this.dynamicConnection.query(
          `select * from hospitals where plenome_id = ?`,
          [Entity.Hospital_id],
        );
        const HosName = await getHosName.hospital_name;
        const HosAddress = await getHosName.address;

        const [getTransactionIdUsingApptNo] = await this.connection.query(
          `select * from transactions where appointment_id = ?`,
          [numb],
        );

        if (getTransactionIdUsingApptNo) {
          if (
            getTransactionIdUsingApptNo?.payment_gateway?.toLocaleLowerCase() ==
            'razorpay'
          ) {
            const [getPatientChargesDetails] = await this.connection.query(
              `select * from patient_charges where transaction_id = ?`,
              [getTransactionIdUsingApptNo.id],
            );
            const [getTransactionIdUsingApptNoHMS] =
              await this.connection.query(
                `select * from transactions where appointment_id = ?`,
                [numb],
              );

            const [getTransactionIdUsingApptNoADMIN] =
              await this.dynamicConnection.query(
                `select * from transactions where hos_transaction_id = ? and Hospital_id = ?`,
                [getTransactionIdUsingApptNoHMS.id, Entity.Hospital_id],
              );

            const [getPatientChargesDetailsADMIN] =
              await this.dynamicConnection.query(
                `select * from patient_charges where transaction_id = ?`,
                [getTransactionIdUsingApptNoADMIN.id],
              );

            // this.RefundApptCharge(getTransactionIdUsingApptNo.payment_id, getPatientChargesDetails.id, getPatientChargesDetailsADMIN.id)
          }
          if (
            getTransactionIdUsingApptNo?.temp_appt_payment_gateway?.toLocaleLowerCase() ==
            'razorpay'
          ) {
            // this.RefundTempApptCharge(getTransactionIdUsingApptNo.temp_appt_payment_id)
          }
        }

        const reslt = await this.connection.query(
          `select  
      patients.id,
      patients.patient_name,patients.gender,patients.age,
      patients.mobileno,
      patients.email,
      patients.ABHA_number,
      concat("Dr. ",staff.name," ",staff.surname) doctorName,
      staff.id doctor_id,
      appointment.source,
      concat("APPN",appointment.id) appointment_id,
      DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
      DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
      concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
      appointment.appointment_status,
      appointment_queue.position,
      CASE
      WHEN appointment.live_consult = 'yes' THEN 'online'
      ELSE 'offline'
      END AS consultingType,
      appointment.message,
      patient_charges.standard_charge consultFees,
      patient_charges.tax taxPercentage,
      format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) taxAmount,
      patient_charges.amount netAmount,
      transactions.id transactionID,
      transactions.payment_mode,
      transactions.payment_date,
      CASE
      WHEN transactions.id THEN 'Payment done.'
      ELSE 'Need payment.' 
      END AS payment_status
      
      from appointment
      left join patients on patients.id = appointment.patient_id
      left join staff on staff.id = appointment.doctor
      left join transactions on transactions.appointment_id = appointment.id
      left join doctor_shift on doctor_shift.id = appointment.shift_id
      left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
      left join patient_charges on patient_charges.opd_id = opd_details.id
      left join appointment_queue on appointment.id = appointment_queue.appointment_id

      where appointment.id = ?`,
          [numb],
        );

        reslt[0].hospital_name = HosName;
        reslt[0].hospital_address = HosAddress;

        const verifyData = {
          mobileNumber: '91' + reslt[0].mobileno,
          name: ' ' + reslt[0].patient_name,
          date: reslt[0].appointmentDate + ' With ' + reslt[0].doctorName,
          reason: Entity.cancellationReason,
        };

        const emailData = {
          email: reslt[0].email,
          name: ' ' + reslt[0].patient_name,
          date: reslt[0].appointmentDate + ' ' + reslt[0].appointmentDate,
          reason: Entity.cancellationReason,
        };

        this.eventEmitter.emit(
          'send-email-sms-appointment-cancel',
          verifyData,
          emailData,
        );

        try {
          const notifydata_URL =
            'http://13.200.35.19:7000/send-notification/to-profile';
          const notifyaddress_data = {
            patient_id: await adminApptId.patient_id,
            title: 'Appointment Cancellation',
            body: 'Your appointment has been Cancelled!!',
            module: 'Appointment',
          };

          await axios.post(notifydata_URL, notifyaddress_data);
        } catch (error) {
          throw new HttpException(
            {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_SENDING_NOTIFICATION,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return [
          {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.CANCELLED_APPOINTMENT,
          },
        ];
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: process.env.ERROR_MESSAGE,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      return [
        {
          status: process.env.ERROR_STATUS_V2,
          message: process.env.HOSPITAL_ID_ERR_V2,
        },
      ];
    }
  }

  async findappointment(
    limit: number,
    page: number,
    filter?: string,
    search?: string,
    hospital_id?: number,
  ): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchCondition = '';
      let filterArray = filter.split('|');

      if (filter) {
        const filterArray = filter.split('|');
        for (const filterItem of filterArray) {
          const [key, value] = filterItem.split(':');
          if (key.toLowerCase() === 'period') {
            if (value.toLowerCase() === 'today') {
              dateCondition += ` appointment.date = CURDATE() and (appointment_status_id <> 4 and appointment_status_id <> 6)`;
            } else if (value.toLowerCase() === 'upcoming') {
              dateCondition += ` appointment.date > CURDATE() and (appointment_status_id <> 4 and appointment_status_id <> 6) `;
            } else if (value.toLowerCase() === 'history') {
              dateCondition += ` (appointment.date < CURDATE() OR (appointment_status_id = 4 or appointment_status_id = 6)) `;
            }
          }
        }
      }

      if (search) {
        const searchClause = `
                (patients.patient_name LIKE '%${search}%' OR 
                CONCAT('APPN','',appointment.id) LIKE '%${search}%' OR 
                CONCAT(staff.name, ' ', staff.surname) LIKE '%${search}%' OR 
                staff.id LIKE '%${search}%' OR 
                doctor_shift.day LIKE '%${search}%' OR 
                appointment_queue.position LIKE '%${search}%' OR 
                appointment.appointment_status LIKE '%${search}%' OR 
                appointment.appointment_status_id LIKE '%${search}%' OR   
                appointment.date LIKE '%${search}%' OR
                patients.mobileno LIKE '%${search}%'
                )
            `;

        if (dateCondition) {
          dateCondition += ` AND ${searchClause}`;
        } else {
          dateCondition += `WHERE ${searchClause}`;
        }
      }
      let query = await `

  SELECT DISTINCT
    concat(CASE
            WHEN appointment.doctor IS NOT NULL THEN 'APPN'
            ELSE 'TEMP'
        END,appointment.id) appointment_no, 
    patients.id AS patient_id, 
    patients.patient_name, 
   appointment.id id, 
    appointment.date, 
    appointment.time, 
    patients.mobileno, 
    patients.gender,
    patients.age,
    CONCAT(staff.name, ' ', staff.surname) AS doctor, 
    staff.id AS staff_id, 
    appointment.source, 
    appoint_priority.priority_status, 
    appoint_priority.id AS priorityID, 
    appointment.live_consult, 
    appointment.amount, 
    appointment.message, 
    global_shift.id AS shift_id, 
    global_shift.name AS shift, 
    doctor_shift.id AS slot_id, 
    doctor_shift.day AS slot, 

    CASE 
      WHEN appointment.appointment_status_id = 1 THEN global_shift.start_time 
      ELSE doctor_shift.start_time 
    END AS start_time,

    CASE 
      WHEN appointment.appointment_status_id = 1 THEN global_shift.end_time 
      ELSE doctor_shift.end_time 
    END AS end_time,

    appointment_status.id AS appointment_status_id, 
    appointment_status.status AS appointment_status, 
    appointment_status.color_code AS color_code, 
    appointment_queue.position AS token, 

    CASE 
      WHEN SUM(COALESCE(transactions.amount, 0)) THEN transactions.amount 
      ELSE SUM(COALESCE(transactions.temp_appt_amount, 0)) 
    END AS paid_amount,

    COALESCE(patient_charges.balance * (-1), 0) AS balance,
    patient_charges.total AS actual_amount,            
    transactions.payment_mode, 
    appointment.created_at,
    COALESCE(opd_details.id , " - ") opd_id


  FROM appointment
  JOIN patients ON appointment.patient_id = patients.id
  LEFT JOIN staff ON appointment.doctor = staff.id
  LEFT JOIN appointment_queue ON appointment_queue.appointment_id = appointment.id
  LEFT JOIN appoint_priority ON appointment.priority = appoint_priority.id
  LEFT JOIN visit_details ON visit_details.id = appointment.visit_details_id
  LEFT JOIN patient_charges ON patient_charges.id = visit_details.patient_charge_id
  LEFT JOIN opd_details ON opd_details.id = visit_details.opd_details_id
  LEFT JOIN transactions ON appointment.id = transactions.appointment_id
  LEFT JOIN global_shift ON appointment.global_shift_id = global_shift.id
  LEFT JOIN doctor_shift ON appointment.shift_id = doctor_shift.id
  LEFT JOIN appointment_status ON appointment.appointment_status_id = appointment_status.id

  WHERE ${dateCondition}
  Group By appointment.id
  ORDER BY appointment.id desc
  LIMIT ? OFFSET ?`;

      const appointment = await this.connection.query(query, [
        Number(limit),
        Number(offset),
      ]);
      const [getHosTimings] = await this.dynamicConnection.query(
        `select hospital_opening_timing,hospital_closing_timing from hospitals where plenome_id = ?`,
        [hospital_id],
      );

      appointment.forEach((a) => {
        if (!a.doctor) {
          a.start_time = getHosTimings.hospital_opening_timing;
          a.end_time = getHosTimings.hospital_closing_timing;
        }
      });
      const totalResult = await this.connection.query(`
            SELECT COUNT(appointment.id) AS total
            FROM appointment
            JOIN patients ON appointment.patient_id = patients.id
            LEFT JOIN staff ON appointment.doctor = staff.id
            LEFT JOIN appointment_queue ON appointment_queue.appointment_id = appointment.id
            LEFT JOIN doctor_shift ON appointment.shift_id = doctor_shift.id
            ${' WHERE ' + dateCondition}
        `);

      const total = totalResult[0]?.total || 0;

      return {
        details: appointment,
        total: total,
        limit: limit,
      };
    } catch (error) {
      throw new HttpException(
        {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async V3findappointment(
    limit: number,
    page: number,
    filter?: string,
    search?: string,
    hospital_id?: number,
  ) {
    try {
      const offset = limit * (page - 1);

      let dateCondition = '';
      if (filter) {
        const filterArray = filter.split('|');
        for (const filterItem of filterArray) {
          const [key, value] = filterItem.split(':');
          if (key.toLowerCase() === 'period') {
            if (value.toLowerCase() === 'today') {
              dateCondition += ` where appointment.date = CURDATE() and (appointment_status_id <> 4 and appointment_status_id <> 6)`;
            } else if (value.toLowerCase() === 'upcoming') {
              dateCondition += ` where appointment.date > CURDATE() and (appointment_status_id <> 4 and appointment_status_id <> 6) `;
            } else if (value.toLowerCase() === 'history') {
              dateCondition += ` where (appointment.date < CURDATE() OR (appointment_status_id = 4 or appointment_status_id = 6)) `;
            }
          }
        }
      }
      const appointment_list = await this.connection.query(
        `select id, date, time, source, live_consult, amount, message, appointment_status_id, 
        patient_id, created_at, doctor, priority, visit_details_id, global_shift_id, shift_id from appointment ${dateCondition} limit ${limit} offset ${offset}`,
      );
      const [count] = await this.connection.query(
        `select count(id) as total from appointment ${dateCondition}`,
      );
      if (appointment_list.length > 0) {
        const app_ID = appointment_list.map((app) => app.id);
        const patient_ID = appointment_list.map((app) => app.patient_id);
        const staff_ID = appointment_list.map((app) => app.doctor);
        const shift_ID = appointment_list.map((app) => app.global_shift_id);
        const slot_ID = appointment_list.map((app) => app.shift_id);
        const visit_details_ID = appointment_list.map(
          (app) => app.visit_details_id,
        );
        const appointmnet_status_ID = appointment_list.map(
          (app) => app.appointment_status_id,
        );
        console.log(shift_ID, 'shift_ID');

        const [patient, staff, shift, slot, visit_details, appointment_status] =
          await Promise.all([
            this.connection.query(
              `select id, mobileno, gender, age, patient_name from patients where id in (?) `,
              [patient_ID],
            ),
            this.connection.query(
              `select id, employee_id, name, surname from staff where id in (?) `,
              [staff_ID],
            ),
            this.connection.query(
              `select id, name, start_time, end_time from global_shift where id in (?) `,
              [shift_ID],
            ),
            this.connection.query(
              `select id, day, start_time, end_time from doctor_shift where id in (?) `,
              [slot_ID],
            ),
            this.connection.query(
              `select id,patient_charge_id, COALESCE(opd_details_id , " - ") opd_id from visit_details where id in (?) `,
              [visit_details_ID],
            ),

            this.connection.query(
              `select id, status, color_code from appointment_status where id in (?) `,
              [appointmnet_status_ID],
            ),
          ]);

        const [pat_charge] = await Promise.all([
          this.connection.query(
            `select COALESCE(patient_charges.balance * (-1), 0) AS balance,
                 patient_charges.total AS actual_amount, id
                  from patient_charges where id in (?) `,
            [visit_details.map((app) => app.patient_charge_id)],
          ),
        ]);
        const patient_map = new Map(patient.map((p) => [p.id, p]));
        const staff_map = new Map(staff.map((p) => [p.id, p]));
        console.log(shift, 'shift');

        const shift_map = new Map(shift.map((p) => [p.id, p]));

        const slot_map = new Map(slot.map((p) => [p.id, p]));
        const app_status_map = new Map(
          appointment_status.map((p) => [p.id, p]),
        );

        const visit_details_map = new Map(visit_details.map((p) => [p.id, p]));

        const patient_charges_map = new Map(pat_charge.map((p) => [p.id, p]));
        await Promise.all(
          visit_details.map(async (app) => {
            app.patient_charges_details = patient_charges_map.get(
              app.patient_charge_id,
            );
          }),
        );
        await Promise.all(
          appointment_list.map(async (app) => {
            app.patient_details = patient_map.get(Number(app.patient_id));
            app.staff_details = staff_map.get(Number(app.doctor));
            app.shift_details = shift_map.get(app.global_shift_id);
            app.slot_details = slot_map.get(app.shift_id);
            app.appointment_status_details = app_status_map.get(
              Number(app.appointment_status_id),
            );
            console.log(shift_map, 'app.appointment_status_details');

            app.opd_details = visit_details_map.get(app.patient_id);
          }),
        );
      }
      let out = {
        details: appointment_list,
        count: count.total,
      };
      return out;
    } catch (error) {
      console.log(error, 'err');
      throw new HttpException(
        {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePaymentDetails(
    appointment_id: number,
    Entity: AddAppointmentPayment,
  ) {
    if (Entity.payment_mode.toLocaleLowerCase() == 'cash') {
      const generateUpperAlphaNumId = customAlphabet(
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        10,
      );

      Entity.cash_transaction_id = generateUpperAlphaNumId();
    }
    try {
      console.log('adsf');

      const [getTransactionDetails] = await this.connection.query(
        `
      select id from transactions where appointment_id = ?`,
        [appointment_id],
      );
      const [getAdminTransactionDetails] = await this.dynamicConnection.query(
        `select id from transactions where hos_transaction_id = ? and Hospital_id = ?`,
        [getTransactionDetails.id, Entity.Hospital_id],
      );
      if (!getTransactionDetails && getAdminTransactionDetails) {
        return {
          status_code: 400,
          status: 'Failed',
          message: 'Transaction details not found for the appointment',
        };
      }

      const updateTransaction = await this.connection.query(
        `update transactions set  payment_method = ?,
  card_division = ?,
  card_bank_name = ?,
  card_type = ?,
  card_transaction_id = ?,
  net_banking_division = ?,
  net_banking_transaction_id = ?,
  upi_id = ?,
  upi_transaction_id = ?,
  upi_bank_name = ?,cash_transaction_id = ? where id = ?`,
        [
          Entity.payment_method,
          Entity.card_division,
          Entity.card_bank_name,
          Entity.card_type,
          Entity.card_transaction_id,
          Entity.net_banking_division,
          Entity.net_banking_transaction_id,
          Entity.upi_id,
          Entity.upi_transaction_id,
          Entity.upi_bank_name,
          Entity.cash_transaction_id,
          getTransactionDetails.id,
        ],
      );
      const updateAdminTransaction = await this.dynamicConnection.query(
        `update transactions set  payment_method = ?,
  card_division = ?,
  card_bank_name = ?,
  card_type = ?,
  card_transaction_id = ?,
  net_banking_division = ?,
  net_banking_transaction_id = ?,
  upi_id = ?,
  upi_transaction_id = ?,
  upi_bank_name = ?,cash_transaction_id = ? where id = ?`,
        [
          Entity.payment_method,
          Entity.card_division,
          Entity.card_bank_name,
          Entity.card_type,
          Entity.card_transaction_id,
          Entity.net_banking_division,
          Entity.net_banking_transaction_id,
          Entity.upi_id,
          Entity.upi_transaction_id,
          Entity.upi_bank_name,
          Entity.cash_transaction_id,
          getAdminTransactionDetails.id,
        ],
      );
      if (
        updateTransaction.affectedRows > 0 &&
        updateAdminTransaction.affectedRows > 0
      ) {
        return {
          status_code: 200,
          status: 'Success',
          message: 'Payment details updated successfully',
        };
      }

      return Promise.resolve([
        {
          status_code: 400,
          status: 'Failed',
          message: 'Failed to update payment details',
        },
      ]);
    } catch (error) {
      return {
        status_code: 500,
        status: 'Error',
        message: 'API SERVICE TEMPORARILY UNAVAILABLE,CHECK BACK LATER',
      };
    }
  }
  async getPatAppoint(aayush_unique_id: number) {
    try {
      const [getPatId] = await this.connection.query(
        `select id from patients where aayush_unique_id = ?`,
        [aayush_unique_id],
      );
      if (!getPatId) {
        return {
          statusCode: 400,
          status: 'failed',
          message: 'Invalid aayush_unique_id',
        };
      }
      const getPendingAppointments = await this.connection.query(
        ` SELECT distinct
  appointment.id as appointment_id,
  appointment.appointment_status
  FROM appointment 
  left join visit_details on visit_details.id = appointment.visit_details_id
LEFT JOIN patient_charges ON patient_charges.id = visit_details.patient_charge_id
WHERE appointment.patient_id = ?
  AND appointment.appointment_status_id = 5
                             AND patient_charges.payment_status = 'unpaid';`,
        [getPatId.id],
      );
      if (getPendingAppointments.length == 0) {
        return {
          statusCode: 200,
          status: 'success',
          message: 'No Data Found',
        };
      }
      return {
        statusCode: 200,
        status: 'success',
        message: 'Details Fetched Successfully',
        data: getPendingAppointments,
      };
    } catch (error) {
      throw new HttpException(
        {
          status_code: process.env.ERROR_STATUS_CODE,
          status: process.env.ERROR_STATUS,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
