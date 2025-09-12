import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
const Razorpay = require('razorpay');
import { DataSource } from 'typeorm';
import { customAlphabet } from 'nanoid';
import {
  PostAppointment,
  StatusChangePatch,
  UpdateAppointment,
  UpdateAppointmentcharge,
  CancelAppointment,
  AddAppointmentPayment,
} from './entities/op-hub-appointment.entity';
import { upcomingApptCountResponseDto } from './dto/create-op-hub-appointment.dto';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class OpHubAppointmentService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async create(AppointmentEntity: PostAppointment) {
    if (!AppointmentEntity.Hospital_id) {
      return {
        status: 'failed',
        message: 'Enter Hospital_id to book appointment',
      };
    }
    if (!AppointmentEntity.txn_id) {
      AppointmentEntity.txn_id = 'NA';
    }
    if (!AppointmentEntity.bank_ref_id) {
      AppointmentEntity.bank_ref_id = 'NA';
    }
    if (!AppointmentEntity.pg_ref_id) {
      AppointmentEntity.pg_ref_id = 'NA';
    }
    if (AppointmentEntity.time) {
      try {
        const timeString = AppointmentEntity.time;
        const startTime = timeString.split(' - ')[0];
        AppointmentEntity.time = startTime;
      } catch (error) {
        AppointmentEntity.time = AppointmentEntity.time;
      }
    }
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    let position;
    let apptDetails: any;
    try {
      const [check_duplicate] = await this.dynamicConnection.query(
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
        let appointment_status;
        let appointment_status_id;
        if (AppointmentEntity.date == formattedDate) {
          appointment_status_id = 3;
          appointment_status = 'Approved';
        } else {
          appointment_status_id = 2;
          appointment_status = 'Reserved';
        }
        const HosPatient = await this.dynamicConnection.query(
          `select * from patients where id = ?`,
          [AppointmentEntity.patient_id],
        );
        const patientInAdmin = await this.connection.query(
          `select * from patients where aayush_unique_id = ?`,
          [HosPatient[0].aayush_unique_id],
        );

        let AdminPatientId;
        if (patientInAdmin[0]) {
          AdminPatientId = patientInAdmin[0].id;
        } else {
          let timestamp: any;
          if (HosPatient[0].dob) {
            const dateString = HosPatient[0].dob;
            const dateObject = new Date(dateString);
            timestamp = new Date(
              dateObject.getFullYear(),
              dateObject.getMonth(),
              dateObject.getDate(),
            );
          }
          let faceID = null;
          if (HosPatient[0].image && HosPatient[0].image.trim() != '') {
            const getFaceId = await this.addAppointmentService.getfaceID(
              HosPatient[0].image,
            );
            faceID = getFaceId?.faceID;
          }
          const createPatient = await this.connection.query(
            `insert into patients (
          patient_name,
          dob,
          image,
          faceId,
          mobileno,
          email,
          gender,
          address,
          ABHA_number,
          dial_code,
          blood_bank_product_id,
          aayush_unique_id
                  )
        values
        (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              HosPatient[0].patient_name,
              timestamp,
              HosPatient[0].image,
              faceID,
              HosPatient[0].mobileno,
              HosPatient[0].email,
              HosPatient[0].gender,
              HosPatient[0].address,
              HosPatient[0].ABHA_number,
              HosPatient[0].dial_code,
              HosPatient[0].blood_bank_product_id,
              HosPatient[0].aayush_unique_id,
            ],
          );
          AdminPatientId = createPatient.insertId;
        }

        const [staffEmailHos] = await this.dynamicConnection.query(
          `select email from staff where id = ?`,
          [AppointmentEntity.doctor],
        );
        const [AdminStaff] = await this.connection.query(
          `select id from staff where email = ?`,
          [staffEmailHos.email],
        );
        let AdminStaffId = AdminStaff.id;
        let paymentStatus;
        if (
          AppointmentEntity.payment_mode == 'Paylater' ||
          AppointmentEntity.payment_mode == 'Offline' ||
          AppointmentEntity.payment_mode == 'cheque' ||
          AppointmentEntity.payment_mode == 'offline'
        ) {
          paymentStatus = 'unpaid';
        } else {
          paymentStatus = 'paid';
        }
        if (AppointmentEntity.payment_mode) {
          if (
            AppointmentEntity.payment_mode.toLocaleLowerCase() != 'cash' &&
            AppointmentEntity.payment_mode.toLocaleLowerCase() != 'cheque' &&
            AppointmentEntity.payment_mode.toLocaleLowerCase() != 'offline'
          ) {
            if (!AppointmentEntity.payment_gateway) {
              return {
                status: 'failed',
                message: 'enter payment gateway to book appointment',
              };
            }
            if (
              AppointmentEntity.payment_gateway.toLocaleLowerCase() ==
              'razorpay'
            ) {
              const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
              });
              try {
                const [getPaymentGatewayDetails] = await this.connection.query(
                  `select * from hospital_payment_gateway_details where hospital_id = ? and payment_gateway = ?`,
                  [AppointmentEntity.Hospital_id, 'razorpay'],
                );
                const SubMerchantdetails = JSON.parse(
                  JSON.stringify(
                    getPaymentGatewayDetails.gateway_account_details,
                  ),
                );
                const submerchantAccountId = SubMerchantdetails.id;
                const paymentDetails = await razorpay.payments.fetch(
                  AppointmentEntity.payment_id,
                );
                let refndAmt;
                if (paymentDetails.amount) {
                  if (paymentDetails.amount <= 100) {
                    refndAmt = Math.round(await paymentDetails.amount);
                  } else {
                    refndAmt = Math.round(
                      (await paymentDetails.amount) -
                        paymentDetails.amount * 0.052,
                    );
                  }
                }
                const transferPayload = {
                  transfers: [
                    {
                      account: submerchantAccountId,
                      amount: await refndAmt,
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
                await razorpay.payments.transfer(
                  AppointmentEntity.payment_id,
                  transferPayload,
                );
              } catch (error) {
                return error;
              }
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
                  status: 'failed',
                  message:
                    'enter the payment reference number and payment_id received from razorpay for booking appointment',
                };
              }
            }
          }
        }
        let HOStransaction_id: number;
        const HOScaseRef = await this.dynamicConnection.query(
          'INSERT INTO case_references values(default,default)',
        );
        const HOSopdCreate = await this.dynamicConnection.query(
          `insert into opd_details (case_reference_id,patient_id) values (?,?)`,
          [HOScaseRef.insertId, AppointmentEntity.patient_id],
        );
        const HOScharge = await this.dynamicConnection.query(
          'select charge_id from shift_details where shift_details.staff_id = ?',
          [AppointmentEntity.doctor],
        );

        let HOScharge_id = await HOScharge[0].charge_id;
        const HOSamount = await this.dynamicConnection.query(
          `
     select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
       (charges.standard_charge*((tax_category.percentage)/100))),2) amount from 
     charges join tax_category on charges.tax_category_id = tax_category.id
   where charges.id = ?`,
          [HOScharge_id],
        );
        const Patient_charges_insert = await this.dynamicConnection.query(
          `insert into patient_charges(
       date,
       opd_id,
       qty,
       charge_id,
       standard_charge,       
       tax,
       apply_charge,
       amount,
       total,
       payment_status,
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
            HOSamount[0].amount,
            paymentStatus,
            AppointmentEntity.patient_id,
          ],
        );
        if (
          AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater' &&
          AppointmentEntity.payment_mode.toLocaleLowerCase() != 'offline'
        ) {
          const HOStransactions = await this.dynamicConnection.query(
            `
   insert into transactions (
     type,
     section,
     patient_id,
     case_reference_id,
     amount,
     payment_mode,
     payment_date,txn_id,pg_ref_id,bank_ref_id,patient_charges_id,received_by_name
     ) values
     (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              'payment',
              'Appointment',
              AppointmentEntity.patient_id,
              HOScaseRef.insertId,
              HOSamount[0].amount,
              AppointmentEntity.payment_mode,
              AppointmentEntity.payment_date,
              AppointmentEntity.txn_id,
              AppointmentEntity.pg_ref_id,
              AppointmentEntity.bank_ref_id,
              Patient_charges_insert.insertId,
              AppointmentEntity.received_by_name,
            ],
          );
          HOStransaction_id = await HOStransactions.insertId;
          await this.dynamicConnection.query(
            `update patient_charges set transaction_id = ? where id = ?`,
            [HOStransactions.insertId, Patient_charges_insert.insertId],
          );
        }
        const HOSvisitInsert = await this.dynamicConnection.query(
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
            AppointmentEntity.payment_mode,
          ],
        );
        let hos_appointment_id;
        const [AdminGlobalShiftId] = await this.connection.query(
          `select * from global_shift where hospital_global_shift_id = ? and hospital_id = ?`,
          [AppointmentEntity.global_shift_id, AppointmentEntity.Hospital_id],
        );

        const [AdminShiftId] = await this.connection.query(
          `select * from doctor_shift where hospital_doctor_shift_id = ? and Hospital_id = ?`,
          [AppointmentEntity.shift_id, AppointmentEntity.Hospital_id],
        );
        try {
          const HOSbookAppnt = await this.dynamicConnection.query(
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
           appointment_status,
           appointment_status_id
           ) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
              appointment_status,
              appointment_status_id,
            ],
          );
          hos_appointment_id = HOSbookAppnt.insertId;
          if (AppointmentEntity.date == formattedDate) {
            const getLastPosition = await this.dynamicConnection.query(
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
          await this.dynamicConnection.query(
            `insert into appointment_queue(
       appointment_id,
       staff_id,
       shift_id,
       position,
       date
       ) values (?,?,?,?,?)`,
            [
              hos_appointment_id,
              AppointmentEntity.doctor,
              AppointmentEntity.shift_id,
              position,
              AppointmentEntity.date,
            ],
          );
          if (HOStransaction_id) {
            await this.dynamicConnection.query(
              `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
              [HOSbookAppnt.insertId, HOStransaction_id],
            );
          }
          let payment_type;
          if (AppointmentEntity.payment_mode == `cash`) {
            payment_type = `Offline`;
          } else {
            payment_type = `Online`;
          }
          let hosTransId;
          if (HOStransaction_id) {
            hosTransId = HOStransaction_id;
          }
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
              hos_appointment_id,
              HOScharge_id,
              HOSamount[0].amount,
              AppointmentEntity.payment_mode,
              payment_type,
              hosTransId,
              AppointmentEntity.date + ' ' + AppointmentEntity.time,
            ],
          );
          apptDetails = await this.dynamicConnection.query(
            `select  
            concat("APPN",appointment.id) id,
            patients.id patient_id,
                concat("PT",patients.id) plenome_patient_id,

            patients.patient_name,patients.gender,patients.age,
            patients.mobileno,
            patients.email,
            patients.ABHA_number,
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
            concat("APPN",appointment.id) appointment_id,
            DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
            (appointment.date) date,
            DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
            time(appointment.time) time,
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
                case 
					when appointment.doctor is null then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else

            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount, -- 
            patient_charges.total netAmount,
            patient_charges.balance balanceAmount,
            concat("TRID",transactions.id) transactionID,
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
                taxAmount,netAmount,transactionID,payment_mode,payment_date,balanceAmount,payment_status,date`,
            [hos_appointment_id],
          );
        } catch (error) {
          return 'errhos_appor in Appointment insert :' + error;
        }

        let transaction_id: number;
        const caseRef = await this.connection.query(
          'INSERT INTO case_references values(default,default)',
        );
        const opdCreate = await this.connection.query(
          `
insert into opd_details (case_reference_id,patient_id,Hospital_id,hos_opd_id) values (?,?,?,?)`,
          [
            caseRef.insertId,
            AdminPatientId,
            AppointmentEntity.Hospital_id,
            HOSopdCreate.insertId,
          ],
        );
        const getAdminChargeId = await this.connection.query(
          `select id from charges 
where Hospital_id = ? 
and hospital_charges_id = ?`,
          [AppointmentEntity.Hospital_id, HOScharge_id],
        );

        const patient_charges = await this.connection.query(
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
      total,
      payment_status,
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
            HOSamount[0].amount,
            paymentStatus,
            AdminPatientId,
          ],
        );
        try {
          if (
            AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater' &&
            AppointmentEntity.payment_mode.toLocaleLowerCase() != 'offline'
          ) {
            const transactions = await this.connection.query(
              `
  insert into transactions (
  type,
  section,
  patient_id,
  case_reference_id,
  amount,
  payment_mode,
  payment_date,Hospital_id,
  hos_transaction_id,txn_id,pg_ref_id,bank_ref_id,patient_charges_id,received_by_name
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                'payment',
                'Appointment',
                AdminPatientId,
                await caseRef.insertId,
                await HOSamount[0].amount,
                AppointmentEntity.payment_mode,
                AppointmentEntity.payment_date,
                AppointmentEntity.Hospital_id,
                HOStransaction_id,
                AppointmentEntity.txn_id,
                AppointmentEntity.pg_ref_id,
                AppointmentEntity.bank_ref_id,
                patient_charges.insertId,
                AppointmentEntity.received_by_name,
              ],
            );
            transaction_id = await transactions.insertId;
            await this.connection.query(
              `update patient_charges set transaction_id = ? where id = ?`,
              [transactions.insertId, patient_charges.insertId],
            );
          }
        } catch (error) {
          return 'error in Admin transaction insert';
        }
        const visitInsert = await this.connection.query(
          `
insert into visit_details(
  opd_details_id,
  patient_charge_id,
  transaction_id,
  case_type,
  cons_doctor,
  appointment_date,
  live_consult,
  payment_mode,Hospital_id,
  hos_visit_id
  ) values (?,?,?,?,?,?,?,?,?,?)`,
          [
            await opdCreate.insertId,
            await patient_charges.insertId,
            transaction_id,
            '',
            AdminStaffId,
            AppointmentEntity.date + ' ' + AppointmentEntity.time,
            AppointmentEntity.live_consult,
            AppointmentEntity.payment_mode,
            AppointmentEntity.Hospital_id,
            await HOSvisitInsert.insertId,
          ],
        );
        try {
          const bookAppnt = await this.connection.query(
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
      Hospital_id,hos_appointment_id,amount,
      appointment_status,
      appointment_status_id
      ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              AdminPatientId,
              await caseRef.insertId,
              await visitInsert.insertId,
              AppointmentEntity.date,
              AppointmentEntity.time,
              AdminStaffId,
              'Offline',
              AdminGlobalShiftId.id,
              AdminShiftId.id,
              AppointmentEntity.live_consult,
              AppointmentEntity.Hospital_id,
              hos_appointment_id,
              await HOSamount[0].amount,
              appointment_status,
              appointment_status_id,
            ],
          );
          await this.connection.query(
            `insert into appointment_queue(
    appointment_id,
    staff_id,
    shift_id,
    position,
    date
    ) values (?,?,?,?,?)`,
            [
              bookAppnt.insertId,
              AdminStaffId,
              AdminShiftId.id,
              position,
              AppointmentEntity.date,
            ],
          );
          let payment_type;
          if (AppointmentEntity.payment_mode == `cash`) {
            payment_type = `Offline`;
          } else {
            payment_type = `Online`;
          }
          if (transaction_id) {
            await this.connection.query(
              `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
              [bookAppnt.insertId, transaction_id],
            );
          }
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
              bookAppnt.insertId,
              getAdminChargeId[0].id,
              HOSamount[0].amount,
              AppointmentEntity.payment_mode,
              payment_type,
              transaction_id,
              AppointmentEntity.date + ' ' + AppointmentEntity.time,
            ],
          );
          if (!position) {
            position = ' - ';
          }
          const verifyData = {
            mobilenumber: '91' + apptDetails[0].mobileno,
            Patname: ' ' + apptDetails[0].patient_name,
            Date:
              apptDetails[0].appointmentDate +
              ' With ' +
              apptDetails[0].doctorName,
            DocName: 'AppointmentNo : ' + apptDetails[0].id,
          };
          const emailData = {
            email: apptDetails[0].email,
            name: ' ' + apptDetails[0].patient_name,
            drname: 'Dr.' + apptDetails[0].doctorName,
            date: apptDetails[0].appointmentDate,
            time: apptDetails[0].appointmentTime,
            HosName: apptDetails[0].hospital_name,
            location: apptDetails[0].hospital_address,
          };
          axios.post('https://notifications.plenome.com/sms', verifyData);
          axios.post(
            'https://notifications.plenome.com/email-appointment-booked',
            emailData,
          );
          try {
            const notifydata_URL =
              'http://13.200.35.19:7000/send-notification/to-profile';
            const notifyaddress_data = {
              patient_id: await AdminPatientId,
              title: 'Regarding Your Appointment Booking',
              body: 'Your appointment has been booked successfully!!',
              module: 'Appointment',
            };
            axios.post(notifydata_URL, notifyaddress_data);
          } catch (error) {
            console.error('Error while sending notification:', error);
          }
          return [
            {
              status: 'success',
              messege: 'Appointment booked successfully',
              inserted_details: apptDetails[0],
            },
          ];
        } catch (error) {
          throw new Error('error is : ' + error);
        }
      } else {
        return [
          {
            status: 'failed',
            messege: 'cannot book duplicate Appointment',
          },
        ];
      }
    } catch (error) {
      throw new Error('error is : ' + error);
    }
  }

  async findAll(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
  ) {
    if (hospital_id) {
      try {
        let query = ` SELECT
  patients.patient_name,
  patients.id AS patient_id,
      concat("PT",patients.id) plenome_patient_id,
  CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
  CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
  CONCAT( patients.mobileno) AS Mobile,
              coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  patients.dial_code,
  opd_details.id opd_id,
  appointment.doctor,
  coalesce(patients.salutation,"") salutation,
  CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment.module,
  appointment_status.color_code,
   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
  patient_charges.payment_status,
  patient_charges.total apptFees,
  CASE
      WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
      ELSE CONCAT(" ", "- ")
  END AS appointment_token 
FROM
  appointment
LEFT JOIN
  patients ON patients.id = appointment.patient_id
LEFT JOIN
  staff ON staff.id = appointment.doctor
LEFT JOIN
  appointment_queue ON appointment_queue.appointment_id = appointment.id
  left join 
  appointment_status on appointment_status.id = appointment.appointment_status_id
  LEFT JOIN
  visit_details ON visit_details.id = appointment.visit_details_id
  left join opd_details on opd_details.id = visit_details.opd_details_id
  left join patient_charges on patient_charges.id = visit_details.patient_charge_id
              LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `;
        let date;
        let values = [];

        if (fromDate && toDate) {
          date =
            ` date(appointment.date) >= date( '` +
            fromDate +
            `' ) and date(appointment.date) <= date( '` +
            toDate +
            `' ) `;
        } else if (fromDate) {
          date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
        } else if (toDate) {
          date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
        } else {
          date = ` appointment.date > DATE(NOW()) `;
        }
        let where = `WHERE  ` + date;
        if (doctorId) {
          where += ` and appointment.doctor = ?`;
          values.push(doctorId);
        }
        if (appointStatus) {
          where += ` and appointment.appointment_status_id = ?`;
          values.push(appointStatus);
        } else {
          where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
        }
        if (paymentStatus) {
          where += ` and patient_charges.payment_status = ?`;
          values.push(paymentStatus);
        }
        let order = `ORDER BY
  date(appointment.date) ASC, time(appointment.date) ASC `;
        let group = `
 GROUP BY
    patients.patient_name, 
    patients.id, 
    appointment.date, 
    appointment.time, 
    patients.mobileno, 
    patients.dial_code, 
    appointment.doctor, 
    staff.name, 
    staff.surname, 
    appointment_status.status, 
    appointment.appointment_status_id, 
    appointment_status.color_code, 
    appointment.id, 
    apptFees,
    opd_id,
    patient_charges.payment_status, 
    appointment_queue.position `;
        let final = query + where + group + order;
        const GetTodayAppointment = await this.dynamicConnection.query(
          final,
          values,
        );
        return GetTodayAppointment;
      } catch (error) {
        throw new Error(error);
      }
    } else {
      return {
        status: 'failed',
        message: 'Enter hospital_id to get the values',
      };
    }
  }

  async Today(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
  ) {
    if (hospital_id) {
      try {
        let query = ` SELECT
    patients.patient_name,
    patients.id AS patient_id,
        concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    opd_details.id opd_id,
    appointment.doctor,
    coalesce(patients.salutation,"") salutation,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
      appointment.module,
    appointment.appointment_status_id,
    appointment_status.color_code,
     concat(CASE 
              WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
              ELSE 'TEMP' 
          END,appointment.id) appointment_id,
    patient_charges.payment_status,
    patient_charges.total apptFees,
    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT(" ", "- ")
    END AS appointment_token 
  FROM
    appointment
  LEFT JOIN
    patients ON patients.id = appointment.patient_id
  LEFT JOIN
    staff ON staff.id = appointment.doctor
  LEFT JOIN
    appointment_queue ON appointment_queue.appointment_id = appointment.id
    left join 
    appointment_status on appointment_status.id = appointment.appointment_status_id
    LEFT JOIN
    visit_details ON visit_details.id = appointment.visit_details_id
    left join opd_details on opd_details.id = visit_details.opd_details_id
    left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `;
        let date;
        let values = [];
        if (fromDate && toDate) {
          date =
            ` date(appointment.date) >= date( '` +
            fromDate +
            `' ) and date(appointment.date) <= date( '` +
            toDate +
            `' ) `;
        } else if (fromDate) {
          date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
        } else if (toDate) {
          date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
        } else {
          date = ` appointment.date = DATE(NOW()) `;
        }
        let where = `WHERE  ` + date;
        if (doctorId) {
          where += ` and appointment.doctor = ?`;
          values.push(doctorId);
        }
        if (appointStatus) {
          where += ` and appointment.appointment_status_id = ?`;
          values.push(appointStatus);
        } else {
          where += ` and ((appointment.appointment_status_id <> 6) and (appointment.appointment_status_id <> 4))`;
        }
        if (paymentStatus) {
          where += ` and patient_charges.payment_status = ?`;
          values.push(paymentStatus);
        }
        let order = `ORDER BY
    date(appointment.date) ASC, time(appointment.date) ASC `;
        let group = `
   GROUP BY
      patients.patient_name, 
      patients.id, 
      appointment.date, 
      appointment.time, 
      patients.mobileno, 
      patients.dial_code, 
      appointment.doctor, 
      staff.name, 
      staff.surname, 
      appointment_status.status, 
      appointment.appointment_status_id, 
      appointment_status.color_code, 
      appointment.id, 
      apptFees,
      opd_id,
      patient_charges.payment_status, 
      appointment_queue.position `;
        let final = query + where + group + order;
        const GetTodayAppointment = await this.dynamicConnection.query(
          final,
          values,
        );
        return GetTodayAppointment;
      } catch (error) {
        throw new Error(error);
      }
    } else {
      return {
        status: 'failed',
        message: 'Enter hospital_id to get the values',
      };
    }
  }

  async findAllHistory(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    payment_status: string,
  ) {
    if (hospital_id) {
      try {
        let query = `SELECT
    patients.patient_name,
    patients.id AS patient_id,
        concat("PT",patients.id) plenome_patient_id,
    CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
    CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
    CONCAT( patients.mobileno) AS Mobile,
                coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
    patients.dial_code,
    appointment.doctor,
    coalesce(patients.salutation,"") salutation,
    CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
    appointment_status.status appointment_status,
    appointment.appointment_status_id,
    appointment_status.color_code,
      appointment.module,
     concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
    patient_charges.payment_status,
      patient_charges.total apptFees,

    CASE
        WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
        ELSE CONCAT(" ", "- ")
    END AS appointment_token 
  FROM
    appointment
  LEFT JOIN
    patients ON patients.id = appointment.patient_id
  LEFT JOIN
    staff ON staff.id = appointment.doctor
  LEFT JOIN
    appointment_queue ON appointment_queue.appointment_id = appointment.id
    left join 
    appointment_status on appointment_status.id = appointment.appointment_status_id
    LEFT JOIN
    visit_details ON visit_details.id = appointment.visit_details_id
    left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `;
        let date;
        let values = [];
        if (fromDate && toDate) {
          date =
            ` (date(appointment.date) >= date( '` +
            fromDate +
            `' ) and date(appointment.date) <= date( '` +
            toDate +
            `' )  or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4))`;
        } else if (fromDate) {
          date =
            ` (date(appointment.date) >= date( '` +
            fromDate +
            `' ) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4))`;
        } else if (toDate) {
          date =
            `  (date(appointment.date) <= date( '` +
            toDate +
            `' ) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4)) `;
        } else {
          date = ` (appointment.date < DATE(NOW()) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4)) `;
        }
        let where = ` WHERE  ` + date;
        if (doctorId) {
          where += ` and appointment.doctor = ?`;
          values.push(doctorId);
        }
        if (appointStatus) {
          where += ` and appointment.appointment_status_id = ?`;
          values.push(appointStatus);
        }
        if (payment_status) {
          where += ` and patient_charges.payment_status = ?`;
          values.push(payment_status);
        }
        let order = `ORDER BY
  appointment.date DESC, appointment.time ASC `;

        let group = `
   GROUP BY
      patients.patient_name, 
      patients.id, 
      appointment.date, 
      appointment.time, 
      patients.mobileno, 
      patients.dial_code, 
      appointment.doctor, 
      staff.name, 
      apptFees,
      staff.surname, 
      appointment_status.status, 
      appointment.appointment_status_id, 
      appointment_status.color_code, 
      appointment.id, 
      patient_charges.payment_status, 
      appointment_queue.position `;
        let final = query + where + group + order;
        const GetTodayAppointment = await this.dynamicConnection.query(
          final,
          values,
        );
        return GetTodayAppointment;
      } catch (err) {
        return err;
      }
    } else {
      return {
        status: 'failed',
        message: 'Enter hospital_id to get the values',
      };
    }
  }

  async findOne(token: string, hospital_id: number) {
    if (hospital_id) {
      let ApptType = token.replace(/[0-9]/g, '');
      let numb: number;
      try {
        numb = parseInt(token.replace(/[a-zA-Z]/g, ''), 10);
      } catch (err) {
        return err;
      }
      try {
        if (ApptType == 'APPN' || ApptType == 'TEMP') {
          let query = `select  
             concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) id,
            patients.id patient_id,
              concat("PT",patients.id) plenome_patient_id,
            patients.patient_name,patients.gender,patients.age,
            patients.mobileno,
            opd_details.id opd_id,
            patients.dial_code,
            patients.email,
            patients.image,
            patients.abha_address,
            patients.ABHA_number,
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
              appointment.module,
            concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
            DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
            (appointment.date) date,
            DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
            time(appointment.time) time,
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
            patient_charges.balance balanceAmount,
            concat("TRID",transactions.id) transactionID,
            transactions.payment_mode,
            transactions.payment_date,
            	transactions.payment_method,
        transactions.card_division,
        transactions.card_type,
        transactions.card_transaction_id,
        transactions.card_bank_name,
        transactions.net_banking_division,
        transactions.net_banking_transaction_id,
        transactions.upi_id,
        transactions.upi_bank_name,
        transactions.upi_transaction_id,
        transactions.cash_transaction_id,
                    concat(COALESCE(transactions.net_banking_transaction_id,""),COALESCE(transactions.card_transaction_id,""),COALESCE(transactions.upi_transaction_id,""),
            COALESCE(transactions.payment_reference_number,""),
            COALESCE(transactions.cash_transaction_id,"")) payment_transaction_id,
            CASE 
                    WHEN patient_charges.payment_status = 'paid' THEN  'Payment done.'
                    ELSE 'Need payment.'
                END AS payment_status
                
                
                from appointment
                left join patients on patients.id = appointment.patient_id
                                left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                left join appointment_status on appointment_status.id = appointment.appointment_status_id
                left join staff on staff.id = appointment.doctor
                LEFT JOIN (
                SELECT pc.*
                FROM (
                SELECT *
                FROM patient_charges
                ORDER BY date ASC    
              ) pc
                GROUP BY pc.opd_id   
              ) AS patient_charges       
              ON patient_charges.opd_id = opd_details.id 
               left join transactions on transactions.id = patient_charges.transaction_id
                left join doctor_shift on doctor_shift.id = appointment.shift_id
                left join appointment_queue on appointment.id = appointment_queue.appointment_id
            LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
                
                where appointment.id = ?
                
                group by patient_id,patient_name,gender,age,mobileno,email,ABHA_number,consultingType,opd_id,
                doctorName,doctor_id,source,appointment_id,appointmentDate,appointmentTime,slot,abha_address,
                appointment_status,appointment_status_id,color_code,tokenNumber,message,consultFees,taxPercentage,
                taxAmount,netAmount,transactionID,payment_mode,payment_date,balanceAmount,payment_status,date
                
                `;
          let values = [numb];
          const [phrApptID] = await this.connection.query(
            `select * from appointment 
                  where Hospital_id = ? and hos_appointment_id = ?`,
            [hospital_id, numb],
          );
          let [ans] = await this.dynamicConnection.query(query, values);
          if (ans) {
            if (!ans.slot) {
              const [getHosTimings] = await this.connection.query(
                `select concat(DATE_FORMAT(time(hospitals.hospital_opening_timing), '%h:%i %p')," - ",DATE_FORMAT(time(hospitals.hospital_closing_timing), '%h:%i %p')) as time from hospitals where plenome_id = ?`,
                [hospital_id],
              );
              ans.slot = getHosTimings.time;
            }

            ans.phr_appointment_id = phrApptID.id;
            const razorpay = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            if (ans.transactionID) {
              const trnID = ans.transactionID.replace(/[a-zA-Z]/g, '');
              const [getPlenomeTransactionId] = await this.connection.query(
                `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
                [hospital_id, trnID],
              );
              if (getPlenomeTransactionId) {
                ans.plenome_transaction_id = getPlenomeTransactionId.id;
              }
              const [GetPaymentIdFromTrans] =
                await this.dynamicConnection.query(
                  `select * from transactions where id = ?`,
                  [trnID],
                );
              if (GetPaymentIdFromTrans) {
                if (GetPaymentIdFromTrans.payment_gateway) {
                  try {
                    if (
                      GetPaymentIdFromTrans.payment_gateway.toLocaleLowerCase() ==
                      'razorpay'
                    ) {
                      const paymentDetails = await razorpay.payments.fetch(
                        GetPaymentIdFromTrans.payment_id,
                      );
                      ans.paymentDetails = paymentDetails;
                      const RefundDetails = await razorpay.refunds.all({
                        payment_id: GetPaymentIdFromTrans.payment_id,
                      });
                      if (RefundDetails.count > 0) {
                        ans.refundDetails = RefundDetails.items;
                      }
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }
                if (GetPaymentIdFromTrans.temp_appt_payment_gateway) {
                  try {
                    if (
                      GetPaymentIdFromTrans.payment_gateway.toLocaleLowerCase() ==
                      'razorpay'
                    ) {
                      const paymentDetails = await razorpay.payments.fetch(
                        GetPaymentIdFromTrans.temp_appt_payment_id,
                      );
                      ans.tempAppointmentPaymentDetails = paymentDetails;
                      const RefundDetails = await razorpay.refunds.all({
                        payment_id: GetPaymentIdFromTrans.temp_appt_payment_id,
                      });
                      if (RefundDetails.count > 0) {
                        ans.tempAppointmentRefundDetails = RefundDetails.items;
                      }
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }
              }
            }
            return {
              QR_Type_ID: 3,
              QR_Type: 'Appointment_QR',
              Appointment_details: ans,
            };
          } else {
            return {
              status: 'failed',
              message: 'appointment not found.',
            };
          }
        } else {
          return {
            status: 'failed',
            message: 'enter appointment_id to get the values',
          };
        }
      } catch (error) {
        console.error(error, 'error');
        return [error];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get the appointment information',
        },
      ];
    }
  }

  async findQR(token: string, hospital_id: number) {
    if (hospital_id) {
      let ApptType = token.replace(/[0-9]/g, '');
      let numb;
      try {
        numb = token.replace(/[a-zA-Z]/g, '');
      } catch (err) {
        return err;
      }

      try {
        if (ApptType == 'APPN' || ApptType == 'TEMP') {
          let query = `select  
              concat("APPN",appointment.id) hos_appointment_id,
              patients.id patient_id,
              patients.mobileno,
              patients.aayush_unique_id,
              staff.id doctor_id,
              concat("APPN",appointment.id) appointment_id,
              appointment_queue.position tokenNumber
                  from appointment
                  left join patients on patients.id = appointment.patient_id
                  left join staff on staff.id = appointment.doctor
                  left join appointment_queue on appointment.id = appointment_queue.appointment_id                  
                  where appointment.id = ? `;
          let values = [numb];
          const [phrApptID] = await this.connection.query(
            `select * from appointment 
                    where Hospital_id = ? and hos_appointment_id = ?`,
            [hospital_id, numb],
          );
          let [ans] = await this.dynamicConnection.query(query, values);
          ans.phr_appointment_id = phrApptID.id;
          ans.Hospital_id = phrApptID.Hospital_id;
          if (!ans.aayush_unique_id) {
            ans.aayush_unique_id = 'NA';
          }
          return {
            QR_Type_ID: 3,
            QR_Type: 'Appointment_QR',
            Appointment_details: ans,
          };
        } else {
          return {
            status: 'failed',
            message: 'enter appointment_id to get the values',
          };
        }
      } catch (error) {
        return [error];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get the appointment information',
        },
      ];
    }
  }

  async updateStatus(id: string, Entity: StatusChangePatch) {
    let numb: number;
    try {
      numb = parseInt(id.replace(/[a-zA-Z]/g, ''));
    } catch (error) {
      numb = parseInt(id);
    }
    if (Entity.Hospital_id) {
      try {
        await this.dynamicConnection.query(
          `update appointment set appointment_status = ?,
    appointment_status_id = ? where id = ?`,
          [Entity.appointment_status, Entity.appointment_status_id, numb],
        );

        const [adminApptId] = await this.connection.query(
          `select id from appointment where Hospital_id = ? and hos_appointment_id = ?`,
          [Entity.Hospital_id, numb],
        );
        await this.connection.query(
          `update appointment set appointment_status = ?,
   appointment_status_id = ? where id = ?`,
          [
            Entity.appointment_status,
            Entity.appointment_status_id,
            adminApptId.id,
          ],
        );
        return [
          {
            status: 'success',
            message: 'Appointment Status Updated successfully',
          },
        ];
      } catch (error) {
        return [error];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to update the appointment ',
        },
      ];
    }
  }

  async reshedule(id: string, Entity: UpdateAppointment) {
    if (Entity.Hospital_id) {
      let numb: number;
      try {
        numb = parseInt(id.replace(/[a-zA-Z]/g, ''));
      } catch (error) {
        numb = parseInt(id);
      }
      try {
        const [getstaff_id] = await this.dynamicConnection.query(
          `select * from appointment where id = ?`,
          [numb],
        );
        let adminApptStatusId = Entity.appointment_status_id;
        const doc_id = getstaff_id.doctor;
        const currentDate = new Date();
        const datePart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        );

        const formattedDate = currentDate.toISOString().split('T')[0];
        if (!doc_id) {
          const [getPatId] = await this.dynamicConnection.query(
            `select patient_id from appointment where id = ?`,
            [numb],
          );
          const [checkForDuplicate] = await this.dynamicConnection.query(
            `select id from appointment where
    shift_id = ? and  date = ?  and doctor = ? and patient_id = ? and (appointment_status_id <> 4 or appointment_status_id <> 6 )`,
            [Entity.shift_id, Entity.date, doc_id, await getPatId.patient_id],
          );
          if (checkForDuplicate) {
            return {
              status: 'failed',
              message: 'Appointment already exists for this date and time',
            };
          }
        }
        if (doc_id) {
          if (doc_id == Entity.doctor) {
            try {
              const HosVisitDetailsId = await getstaff_id.visit_details_id;
              const [HosPatientCharges] = await this.dynamicConnection.query(
                `select patient_charge_id from visit_details where id = ?`,
                [HosVisitDetailsId],
              );
              const [HosAppointQueue] = await this.dynamicConnection.query(
                `select id from appointment_queue where appointment_id = ?`,
                [numb],
              );
              const [HosAppointPayment] = await this.dynamicConnection.query(
                `select id from appointment_payment where appointment_id = ?`,
                [numb],
              );

              const [getHosPAtCid] = await this.dynamicConnection.query(
                `select payment_status from 
  patient_charges where id = ?`,
                [HosPatientCharges.patient_charge_id],
              );
              let payment_status: string;

              if (
                Entity.payment_mode == 'Paylater' ||
                Entity.payment_mode == 'Offline' ||
                Entity.payment_mode == 'cheque' ||
                Entity.payment_mode == 'offline' ||
                !Entity.payment_mode
              ) {
                payment_status = getHosPAtCid.payment_status;
              } else {
                payment_status = 'paid';
              }
              this.dynamicConnection.query(
                `update patient_charges set date= ?,payment_status = ?
            where id = ?`,
                [
                  Entity.date,
                  payment_status,
                  HosPatientCharges.patient_charge_id,
                ],
              );
              this.dynamicConnection.query(
                `update visit_details set appointment_date = ?,
            live_consult = ? where id = ?`,
                [
                  Entity.date + ' ' + Entity.time,
                  Entity.live_consult,
                  HosVisitDetailsId,
                ],
              );
              this.dynamicConnection.query(
                `update appointment set date = ?,time = ?,
            global_shift_id = ?,shift_id = ?,live_consult = ?,appointment_status_id = ?,appointment_status = ? where id = ?`,
                [
                  Entity.date,
                  Entity.time,
                  Entity.global_shift_id,
                  Entity.shift_id,
                  Entity.live_consult,
                  Entity.appointment_status_id,
                  Entity.appointment_status,
                  numb,
                ],
              );
              let position: number;
              if (Entity.date != formattedDate) {
                position = null;
                this.dynamicConnection.query(
                  `update appointment_queue set 
                  shift_id = ?,date = ?,position = ?
                where id = ?`,
                  [Entity.shift_id, Entity.date, position, HosAppointQueue.id],
                );
              } else {
                const [checkPreviousToken] = await this.dynamicConnection.query(
                  `select position,staff_id,
                  shift_id,
                  date
                  from appointment_queue where id = ?`,
                  [HosAppointQueue.id],
                );
                if (
                  checkPreviousToken.position &&
                  checkPreviousToken.staff_id == Entity.doctor &&
                  checkPreviousToken.shift_id == Entity.shift_id &&
                  checkPreviousToken.date == Entity.date
                ) {
                  position = checkPreviousToken.position;
                  await this.dynamicConnection.query(
                    `update appointment_queue set 
                                  shift_id = ?,position = ?,date = ?
                                where id = ?`,
                    [
                      Entity.shift_id,
                      position,
                      Entity.date,
                      HosAppointQueue.id,
                    ],
                  );
                } else {
                  const [getLastPosition] = await this.dynamicConnection.query(
                    `select position from
                      appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `,
                    [Entity.date, Entity.doctor, Entity.shift_id],
                  );
                  if (getLastPosition) {
                    position = getLastPosition.position + 1;
                  } else {
                    position = 1;
                  }
                  this.dynamicConnection.query(
                    `update appointment_queue set 
                        shift_id = ?,position = ?,date = ?
                      where id = ?`,
                    [
                      Entity.shift_id,
                      position,
                      Entity.date,
                      HosAppointQueue.id,
                    ],
                  );
                }
              }
              this.dynamicConnection.query(
                `update appointment_payment set date = ? where id = ?`,
                [Entity.date, HosAppointPayment.id],
              );
              const [getAdminAppointdetails] = await this.connection.query(
                `select * from appointment 
where hos_appointment_id = ? and Hospital_id = ?`,
                [numb, Entity.Hospital_id],
              );
              const AdminAppointmentId = await getAdminAppointdetails.id;
              const AdminPatId = await getAdminAppointdetails.patient_id;
              const AdminVisitDetailsId =
                await getAdminAppointdetails.visit_details_id;
              const [AdminPatientChargeId] = await this.connection.query(
                `select * from visit_details where id = ?`,
                [AdminVisitDetailsId],
              );
              const [AdminAppointmentQueue] = await this.connection.query(
                `select * from appointment_queue where appointment_id = ?`,
                [AdminAppointmentId],
              );
              const [AdminAppointmentPayment] = await this.connection.query(
                `select * from appointment_payment where appointment_id = ?`,
                [AdminAppointmentId],
              );
              const [getPatientChargesAdmin] = await this.connection.query(
                `select * from 
  patient_charges where id = ?`,
                [AdminPatientChargeId.patient_charge_id],
              );
              await this.connection.query(
                `update patient_charges set date= ?,payment_status = ?
where id = ?`,
                [
                  Entity.date,
                  payment_status,
                  AdminPatientChargeId.patient_charge_id,
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
                payment_status == 'paid' &&
                getPatientChargesAdmin.payment_status == 'unpaid'
              ) {
                const [getHosApptDetails] = await this.dynamicConnection.query(
                  `select * from appointment where id = ?`,
                  [numb],
                );

                const insert_transactionsHos =
                  await this.dynamicConnection.query(
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
          payment_date,received_by_name) values (?,?,?,?,?,?,?,?,?,?,?,?,?)
          `,
                    [
                      Entity.txn_id,
                      Entity.pg_ref_id,
                      Entity.bank_ref_id,
                      'payment',
                      'Appointment',
                      getHosApptDetails.patient_id,
                      getHosApptDetails.case_reference_id,
                      HosPatientCharges.patient_charge_id,
                      getHosApptDetails.id,
                      getPatientChargesAdmin.total,
                      Entity.payment_mode,
                      Entity.payment_date,
                      Entity.received_by_name,
                    ],
                  );
                await this.dynamicConnection.query(
                  `update patient_charges set transaction_id = ? where id = ?`,
                  [
                    insert_transactionsHos.insertId,
                    HosPatientCharges.patient_charge_id,
                  ],
                );
                const insert_transactions = await this.connection.query(
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
          Hospital_id,
          hos_transaction_id,received_by_name)  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
                    getPatientChargesAdmin.total,
                    Entity.payment_mode,
                    Entity.payment_date,
                    Entity.Hospital_id,
                    insert_transactionsHos.insertId,
                    Entity.received_by_name,
                  ],
                );
                await this.connection.query(
                  `update patient_charges set transaction_id = ? where id = ?`,
                  [
                    insert_transactions.insertId,
                    AdminPatientChargeId.patient_charge_id,
                  ],
                );
              } else if (
                payment_status == 'paid' &&
                getPatientChargesAdmin.payment_status == 'partially_paid'
              ) {
                await this.dynamicConnection.query(
                  `update transactions set amount = ?,
                  received_by_name = ?,
                   payment_mode = ?, payment_date = ? where
                    appointment_id = ?`,
                  [
                    getPatientChargesAdmin.total,
                    Entity.received_by_name,
                    Entity.payment_mode,
                    Entity.payment_date,
                    numb,
                  ],
                );

                await this.connection.query(
                  `update transactions set amount = ?,
                  received_by_name = ?,
                   payment_mode = ?, payment_date = ? where
                    appointment_id = ?`,
                  [
                    getPatientChargesAdmin.total,
                    Entity.received_by_name,
                    Entity.payment_mode,
                    Entity.payment_date,
                    AdminAppointmentId,
                  ],
                );
              }

              await this.connection.query(
                `update visit_details set appointment_date = ?,
live_consult = ? where id = ?`,
                [
                  Entity.date + ' ' + Entity.time,
                  Entity.live_consult,
                  AdminVisitDetailsId,
                ],
              );
              const [AdminGlobalShiftdetails] = await this.connection.query(
                `select * from global_shift where hospital_global_shift_id = ?`,
                [Entity.global_shift_id],
              );
              const [AdminShiftDetails] = await this.connection.query(
                `select * from doctor_shift where hospital_doctor_shift_id = ?`,
                [Entity.shift_id],
              );
              await this.connection.query(
                `update appointment set date = ?,time = ?,
global_shift_id = ?,shift_id = ?,live_consult = ?,appointment_status_id = ?,appointment_status = ? where id = ?`,
                [
                  Entity.date,
                  Entity.time,
                  AdminGlobalShiftdetails.id,
                  AdminShiftDetails.id,
                  Entity.live_consult,
                  adminApptStatusId,
                  Entity.appointment_status,
                  AdminAppointmentId,
                ],
              );
              if (Entity.date != formattedDate) {
                position = null;
                await this.connection.query(
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
                await this.connection.query(
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
              await this.connection.query(
                `update appointment_payment set date = ? where id = ?`,
                [Entity.date, AdminAppointmentPayment.id],
              );
              const [result] = await this.dynamicConnection.query(
                `select  
patients.id patient_id,
    concat("PT",patients.id) plenome_patient_id,
patients.patient_name,patients.gender,patients.age,
patients.mobileno,
patients.email,
patients.ABHA_number,
CASE 
        WHEN appointment.live_consult = 'yes' THEN 'Online Consultation '
        ELSE 'Offline Consultation'
    END AS consultingType,
concat("Dr. ",staff.name," ",staff.surname) doctorName,
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
   case when appointment.doctor is null then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else

            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount,
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

              const verifyData = {
                mobilenumber: '91' + result.mobileno,
                patname: ' ' + result.patient_name,
                date: result.appointmentDate,
                doctor: result.doctorName,
              };

              const emailData = {
                email: result.email,
                name: ' ' + result.patient_name,
                drname: 'Dr.' + result.doctorName,
                date: result.appointmentDate,
                time: result.appointmentTime,
                HosName: result.hospital_name,
                location: result.hospital_address,
              };
              axios.post(
                'https://notifications.plenome.com/sending-sms-appointment-reschedule',
                verifyData,
              );
              axios.post(
                'https://notifications.plenome.com/email-appointment-rescheduled',
                emailData,
              );

              try {
                const notifydata_URL =
                  'http://13.200.35.19:7000/send-notification/to-profile';
                const notifyaddress_data = {
                  patient_id: AdminPatId,
                  title: 'Regarding Your Appointment Reschedule',
                  body: 'Your appointment has been booked successfully!!',
                  module: 'Appointment',
                };
                axios.post(notifydata_URL, notifyaddress_data);
              } catch (error) {
                console.error('Error while sending notification:', error);
              }
              return [
                {
                  status: 'success',
                  message: 'Appointment updated successfully.',
                  transactionId: result.transactionID
                    ? result.transactionID.toString()
                    : null,
                  updated_value: result,
                },
              ];
            } catch (error) {
              throw new Error('error is : ' + error);
            }
          } else {
            return {
              status: 'failed',
              message: 'cannot change doctor.',
            };
          }
        } else {
          if (Entity.doctor) {
            const [getHosStaffdetails] = await this.dynamicConnection.query(
              `select * from staff where id = ?`,
              [Entity.doctor],
            );
            const [HosChargeId] = await this.dynamicConnection.query(
              `select * from shift_details where staff_id = ?`,
              [Entity.doctor],
            );
            const [getAmountDetails] = await this.dynamicConnection.query(
              `
    select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
      (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
    charges join tax_category on charges.tax_category_id = tax_category.id
    where charges.id = ?`,
              [HosChargeId.charge_id],
            );
            const HosssVisitDetailsId = await getstaff_id.visit_details_id;
            const [HossPatientCharges] = await this.dynamicConnection.query(
              `select * from visit_details where id = ?`,
              [HosssVisitDetailsId],
            );
            const [HossAppointQueue] = await this.dynamicConnection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [numb],
            );
            const [HossAppointPayment] = await this.dynamicConnection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [numb],
            );
            const [HossssPatientCharges] = await this.dynamicConnection.query(
              `select * from patient_charges where id = ?`,
              [HossPatientCharges.patient_charge_id],
            );
            let payment_status;
            if (
              Entity.payment_mode == 'Paylater' ||
              Entity.payment_mode == 'Offline' ||
              Entity.payment_mode == 'cheque' ||
              Entity.payment_mode == 'offline' ||
              !Entity.payment_mode
            ) {
              payment_status = HossssPatientCharges.payment_status;
            } else {
              payment_status = 'paid';
            }
            const total =
              Number(getAmountDetails.amount) +
              Number(HossssPatientCharges.additional_charge);
            let Balance;
            if (
              HossssPatientCharges?.payment_status?.toLocaleLowerCase() ==
              'partially_paid'
            ) {
              Balance = Number(HossssPatientCharges.temp_amount) - total;
            } else {
              Balance = total;
            }
            await this.dynamicConnection.query(
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
                total,
                Balance,
                payment_status,
                HossPatientCharges.patient_charge_id,
              ],
            );
            await this.dynamicConnection.query(
              `update visit_details set appointment_date = ?,cons_doctor = ?,
      live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                Entity.doctor,
                Entity.live_consult,
                HosssVisitDetailsId,
              ],
            );
            await this.dynamicConnection.query(
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
            let position: number;
            if (Entity.date != formattedDate) {
              position = null;
              await this.dynamicConnection.query(
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
              const [getlastpsn] = await this.dynamicConnection.query(
                `SELECT * FROM appointment_queue
           where staff_id = ? 
        and date = ? and shift_id = ? order by position desc limit  1 `,
                [Entity.doctor, Entity.date, Entity.shift_id],
              );
              if (getlastpsn) {
                position = getlastpsn.position + 1;
              } else {
                position = 1;
              }
              await this.dynamicConnection.query(
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
            await this.dynamicConnection.query(
              `update appointment_payment set date = ? where id = ?`,
              [Entity.date, HossAppointPayment.id],
            );
            const [getAdminnAppointdetails] = await this.connection.query(
              `select * from appointment where hos_appointment_id = ? and Hospital_id = ?`,
              [numb, Entity.Hospital_id],
            );
            const AdminnnAppointmentId = await getAdminnAppointdetails.id;
            const [getAdminStaffdetails] = await this.connection.query(
              `select * from staff where email = ?`,
              [getHosStaffdetails.email],
            );
            const [getAdminnGlobalShiftId] = await this.connection.query(
              `select * from global_shift where hospital_global_shift_id = ?`,
              [Entity.global_shift_id],
            );
            const [getAdminnShiftId] = await this.connection.query(
              `select * from doctor_shift where hospital_doctor_shift_id = ?`,
              [Entity.shift_id],
            );
            const [getAdminchargeId] = await this.connection.query(
              `select * from shift_details where staff_id = ?`,
              [getAdminStaffdetails.id],
            );
            const [getAdminAmountDetails] = await this.connection.query(
              `
    select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
      (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
    charges join tax_category on charges.tax_category_id = tax_category.id
    where charges.id = ?`,
              [getAdminchargeId.charge_id],
            );
            const AdminnVisitDetailsId =
              await getAdminnAppointdetails.visit_details_id;
            const [AdminnPatientCharges] = await this.connection.query(
              `select * from visit_details where id = ?`,
              [AdminnVisitDetailsId],
            );
            const [AdminnAppointQueue] = await this.connection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [AdminnnAppointmentId],
            );
            const [AdminnAppointPayment] = await this.connection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [AdminnnAppointmentId],
            );
            await this.connection.query(
              `update patient_charges set date= ?,charge_id=?,standard_charge=?,
            tax=?,apply_charge=?,amount=?, total = ?, balance = ?, payment_status = ? where id = ?`,
              [
                Entity.date,
                getAdminchargeId.charge_id,
                getAdminAmountDetails.standard_charge,
                getAdminAmountDetails.tax_percentage,
                getAdminAmountDetails.standard_charge,
                getAdminAmountDetails.amount,
                total,
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
              const [getAdmintransactionDetails] = await this.connection.query(
                `select * from transactions 
                  where appointment_id = ? `,
                [getAdminnAppointdetails.id],
              );
              const [getHosTrdID] = await this.dynamicConnection.query(
                `select * from transactions
                     where appointment_id = ?`,
                [numb],
              );
              await this.connection.query(
                `update transactions 
                  set amount = ?,
                  received_by_name = ?,
                   payment_mode = ? 
                   where id = ?`,
                [
                  getAdminAmountDetails.amount,
                  Entity.received_by_name,
                  Entity.payment_mode,
                  getAdmintransactionDetails.id,
                ],
              );
              await this.dynamicConnection.query(
                `update transactions 
                    set amount = ?,
                    received_by_name = ?,
                     payment_mode = ? 
                     where id = ?`,
                [
                  getAdminAmountDetails.amount,
                  Entity.received_by_name,
                  Entity.payment_mode,
                  getHosTrdID.id,
                ],
              );
            }
            if (
              payment_status == 'paid' &&
              HossssPatientCharges.payment_status == 'unpaid'
            ) {
              const [getHosApptDetails] = await this.dynamicConnection.query(
                `select * from appointment where id = ?`,
                [numb],
              );
              const insert_transactionsHos = await this.dynamicConnection.query(
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
                  getAdminAmountDetails.amount,
                  Entity.payment_mode,
                  Entity.payment_date,
                  Entity.received_by_name,
                ],
              );
              await this.dynamicConnection.query(
                `update patient_charges set transaction_id = ? where id = ?`,
                [
                  insert_transactionsHos.insertId,
                  HossPatientCharges.patient_charge_id,
                ],
              );
              const insert_transactions = await this.connection.query(
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
                        Hospital_id,
                        hos_transaction_id,received_by_name)  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
                  getAdminAmountDetails.amount,
                  Entity.payment_mode,
                  Entity.payment_date,
                  Entity.Hospital_id,
                  insert_transactionsHos.insertId,
                  Entity.received_by_name,
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
            await this.connection.query(
              `update visit_details set appointment_date = ?,cons_doctor = ?,
              live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                getAdminStaffdetails.id,
                Entity.live_consult,
                AdminnVisitDetailsId,
              ],
            );
            await this.connection.query(
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
            if (Entity.date != datePart) {
              position = null;
              await this.connection.query(
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
              const [getlastpsn] = await this.connection.query(
                `SELECT * FROM appointment_queue 
                  where staff_id = ? 
                and date = ? and shift_id = ? order by position desc limit  1 `,
                [getAdminStaffdetails.id, Entity.date, getAdminnShiftId.id],
              );
              if (getlastpsn) {
                position = getlastpsn.position + 1;
              } else {
                position = 1;
              }
              await this.connection.query(
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
            await this.connection.query(
              `update appointment_payment set date = ? where id = ?`,
              [Entity.date, AdminnAppointPayment.id],
            );
            const [reslt] = await this.dynamicConnection.query(
              `select  
 patients.id patient_id,
     concat("PT",patients.id) plenome_patient_id,
 patients.patient_name,patients.gender,patients.age,
 patients.mobileno,
 patients.email,
 patients.ABHA_number,
 CASE 
         WHEN appointment.live_consult = 'yes' THEN 'Online Consultation '
         ELSE 'Offline Consultation'
     END AS consultingType,
 concat("Dr. ",staff.name," ",staff.surname) doctorName,
 staff.id doctor_id,
 coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
 appointment.source,
  concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
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
case when appointment.doctor is null then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else

            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount,
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
            const verifyData = {
              mobilenumber: '91' + reslt.mobileno,
              patname: ' ' + reslt.patient_name,
              date: reslt.appointmentDate,
              doctor: reslt.doctorName,
            };
            const emailData = {
              email: reslt.email,
              name: ' ' + reslt.patient_name,
              drname: 'Dr.' + reslt.doctorName,
              date: reslt.appointmentDate,
              time: reslt.appointmentTime,
              HosName: reslt.hospital_name,
              location: reslt.hospital_address,
            };
            axios.post(
              'https://notifications.plenome.com/sending-sms-appointment-reschedule',
              verifyData,
            );
            axios.post(
              'https://notifications.plenome.com/email-appointment-rescheduled',
              emailData,
            );
            try {
              const notifydata_URL =
                'http://13.200.35.19:7000/send-notification/to-profile';
              const notifyaddress_data = {
                patient_id: getAdminnAppointdetails.patient_id,
                title: 'Regarding Your Appointment Reschedule',
                body: 'Your appointment has been booked successfully!!',
                module: 'Appointment',
              };
              axios.post(notifydata_URL, notifyaddress_data);
            } catch (error) {
              console.error('Error while sending notification:', error);
            }
            let trans_id: any;
            if (reslt.trans_id) {
              trans_id = reslt.transactionID.toString();
            }
            return [
              {
                status: 'success',
                message: 'Appointment Updated successfully',
                transactionId: trans_id,
                updated_value: reslt,
              },
            ];
          } else {
            const [getAPPDetails] = await this.dynamicConnection.query(
              `select * from appointment where id = ?`,
              [numb],
            );
            const HOSSVisitDetailsId = await getAPPDetails.visit_details_id;
            const [HOSSPatientCharges] = await this.dynamicConnection.query(
              `select * from visit_details where id = ?`,
              [HOSSVisitDetailsId],
            );
            const [HOSSAppointQueue] = await this.dynamicConnection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [numb],
            );
            const [HOSSAppointPayment] = await this.dynamicConnection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [numb],
            );
            await this.dynamicConnection.query(
              `update patient_charges set date= ? where id = ?`,
              [Entity.date, HOSSPatientCharges.patient_charge_id],
            );
            await this.dynamicConnection.query(
              `update visit_details set appointment_date = ?,
      live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                Entity.live_consult,
                HOSSVisitDetailsId,
              ],
            );
            await this.dynamicConnection.query(
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
            await this.dynamicConnection.query(
              `update appointment_queue set date = ?
      where id = ?`,
              [Entity.date, HOSSAppointQueue.id],
            );
            await this.dynamicConnection.query(
              `update appointment_payment set date = ? where id = ?`,
              [Entity.date, HOSSAppointPayment.id],
            );
            const [getADMINAPPDetails] = await this.connection.query(
              `select * from appointment where hos_appointment_id = ? and Hospital_id = ?`,
              [numb, Entity.Hospital_id],
            );
            const ADMINVisitDetailsId =
              await getADMINAPPDetails.visit_details_id;
            const [ADMINPatientCharges] = await this.connection.query(
              `select * from visit_details where id = ?`,
              [ADMINVisitDetailsId],
            );
            const [ADMINAppointQueue] = await this.connection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [getADMINAPPDetails.id],
            );
            const [ADMINAppointPayment] = await this.connection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [getADMINAPPDetails.id],
            );
            await this.connection.query(
              `update patient_charges set date= ? where id = ?`,
              [Entity.date, ADMINPatientCharges.patient_charge_id],
            );
            await this.connection.query(
              `update visit_details set appointment_date = ?,
          live_consult = ? where id = ?`,
              [
                Entity.date + ' ' + Entity.time,
                Entity.live_consult,
                ADMINVisitDetailsId,
              ],
            );
            await this.connection.query(
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
            const [reslt] = await this.dynamicConnection.query(
              `select  
          patients.id patient_id,
              concat("PT",patients.id) plenome_patient_id,
          patients.patient_name,patients.gender,patients.age,
          patients.mobileno,
          patients.email,
          patients.ABHA_number,
          CASE 
                  WHEN appointment.live_consult = 'yes' THEN 'Online Consultation '
                  ELSE 'Offline Consultation'
              END AS consultingType,
          concat("Dr. ",staff.name," ",staff.surname) doctorName,
          staff.id doctor_id,
          coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
          appointment.source,
           concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id)  appointment_id,
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
case when appointment.doctor is null then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else

            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount,
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
            const verifyData = {
              mobilenumber: '91' + reslt.mobileno,
              patname: ' ' + reslt.patient_name,
              date: reslt.appointmentDate,
              doctor: reslt.doctorName,
            };
            const emailData = {
              email: reslt.email,
              name: ' ' + reslt.patient_name,
              drname: 'Dr.' + reslt.doctorName,
              date: reslt.appointmentDate,
              time: reslt.appointmentTime,
              HosName: reslt.hospital_name,
              location: reslt.hospital_address,
            };
            axios.post(
              'https://notifications.plenome.com/sending-sms-appointment-reschedule',
              verifyData,
            );
            axios.post(
              'https://notifications.plenome.com/email-appointment-rescheduled',
              emailData,
            );
            try {
              const notifydata_URL =
                'http://13.200.35.19:7000/send-notification/to-profile';
              const notifyaddress_data = {
                patient_id: getAPPDetails.patient_id,
                title: 'Regarding Your Appointment Reschedule',
                body: 'Your appointment has been booked successfully!!',
                module: 'Appointment',
              };
              axios.post(notifydata_URL, notifyaddress_data);
            } catch (error) {
              console.error('Error while sending notification:', error);
            }
            return [
              {
                status: 'success',
                message: 'Appointment Updated successfully',
                transactionId: reslt.transactionID.toString(),
                updated_values: reslt,
              },
            ];
          }
        }
      } catch (error) {
        return [{ error: error }];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to update the appointment ',
        },
      ];
    }
  }

  async updateChargeDetails(id: number, Entity: UpdateAppointmentcharge) {
    if (Entity.Hospital_id) {
      try {
        const [getAdminPatChargeDetails] = await this.connection.query(
          `select id from patient_charges where Hospital_id = ? and hos_patient_charges_id = ?`,
          [Entity.Hospital_id, id],
        );

        await this.dynamicConnection.query(
          `update patient_charges set additional_charge = ?,
          additional_charge_note = ?,
          discount_percentage = ?,
          discount_amount = ?,
          total = ? 
          where id = ?`,
          [
            Entity.additional_charge,
            Entity.additional_charge_note,
            Entity.discount_percentage,
            Entity.discount_amount,
            Entity.total,
            id,
          ],
        );

        await this.connection.query(
          `update patient_charges set additional_charge = ?,
            additional_charge_note = ?,
            discount_percentage = ?,
            discount_amount = ?,
            total = ? 
            where id = ?`,
          [
            Entity.additional_charge,
            Entity.additional_charge_note,
            Entity.discount_percentage,
            Entity.discount_amount,
            Entity.total,
            getAdminPatChargeDetails.id,
          ],
        );

        return [
          {
            status: 'success',
            message: 'charges modified successfully',
          },
        ];
      } catch (error) {
        throw new Error(error);
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to get the appointment information',
        },
      ];
    }
  }

  async cancelAppointment(id: string, Entity: CancelAppointment) {
    let numb = id.replace(/[a-zA-Z]/g, '');
    if (Entity.Hospital_id) {
      try {
        await this.dynamicConnection.query(
          `update appointment set appointment_status = ?,
      appointment_status_id = ?,appointment_cancellation_reason = ? where id = ?`,
          ['Cancelled', 4, Entity.cancellationReason, numb],
        );

        const [adminApptId] = await this.connection.query(
          `select id, patient_id from appointment where Hospital_id = ? and hos_appointment_id = ?`,
          [Entity.Hospital_id, numb],
        );
        await this.connection.query(
          `update appointment set appointment_status = ?,
      appointment_status_id = ?,appointment_cancellation_reason = ? where id = ?`,
          ['Cancelled', 4, Entity.cancellationReason, adminApptId.id],
        );
        const [getHosName] = await this.connection.query(
          `select * from hospitals where plenome_id = ?`,
          [Entity.Hospital_id],
        );
        const HosName = await getHosName.hospital_name;
        const HosAddress = await getHosName.address;
        const [getTransactionIdUsingApptNo] =
          await this.dynamicConnection.query(
            `select * from transactions where appointment_id = ?`,
            [numb],
          );
        if (getTransactionIdUsingApptNo) {
          if (getTransactionIdUsingApptNo.payment_gateway) {
            if (
              getTransactionIdUsingApptNo.payment_gateway.toLocaleLowerCase() ==
              'razorpay'
            ) {
              const [getPatientChargesDetails] =
                await this.dynamicConnection.query(
                  `select * from patient_charges where transaction_id = ?`,
                  [getTransactionIdUsingApptNo.id],
                );
              const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
              });
              const refundData: any = {}; // Default full refund
              const paymentDetails = await razorpay.payments.fetch(
                getTransactionIdUsingApptNo.payment_id,
              );
              if (paymentDetails.amount) {
                let refndAmt;
                if (paymentDetails.amount <= 100) {
                  refndAmt = paymentDetails.amount;
                } else {
                  refndAmt =
                    paymentDetails.amount - paymentDetails.amount * 0.052;
                }
                refundData.amount = refndAmt;
              }
              await razorpay.payments.refund(
                getTransactionIdUsingApptNo.payment_id,
                refundData,
              );
              await this.dynamicConnection.query(
                `update patient_charges set 
                payment_status = 'refunded' where id = ?`,
                [getPatientChargesDetails.id],
              );
              const [getTransactionIdUsingApptNoHMS] =
                await this.dynamicConnection.query(
                  `select * from transactions where appointment_id = ?`,
                  [numb],
                );
              const [getTransactionIdUsingApptNoADMIN] =
                await this.connection.query(
                  `select * from transactions where hos_transaction_id = ? and Hospital_id = ?`,
                  [getTransactionIdUsingApptNoHMS.id, Entity.Hospital_id],
                );
              const [getPatientChargesDetailsADMIN] =
                await this.connection.query(
                  `select * from patient_charges where transaction_id = ?`,
                  [getTransactionIdUsingApptNoADMIN.id],
                );
              await this.connection.query(
                `update patient_charges set 
                      payment_status = 'refunded' where id = ?`,
                [getPatientChargesDetailsADMIN.id],
              );
            }
          }
        }
        const reslt = await this.dynamicConnection.query(
          `select  
      patients.id,
          concat("PT",patients.id) plenome_patient_id,
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
case when appointment.doctor is null then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else

            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount,      patient_charges.amount netAmount,
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
        axios.post(
          'https://notifications.plenome.com/sending-sms-appointment-cancelled',
          verifyData,
        );
        axios.post(
          'https://notifications.plenome.com/email-appointment-cancelled',
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

          axios.post(notifydata_URL, notifyaddress_data);
        } catch (error) {
          console.error('Error while sending notification:', error);
        }
        return [
          {
            status: 'success',
            message: 'Appointment Cancelled successfully',
          },
        ];
      } catch (error) {
        return [error];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter hospital_id to update the appointment ',
        },
      ];
    }
  }

  async makepayment(paymentDetails: PostAppointment, transaction_id: any) {
    if (paymentDetails.Hospital_id) {
      let numb: number;
      try {
        numb = transaction_id.replace(/[a-zA-Z]/g, '');
      } catch (err) {
        numb = transaction_id;
      }
      try {
        // if (paymentDetails.payment_gateway) {
        //   if (
        //     paymentDetails.payment_gateway.toLocaleLowerCase() == 'razorpay'
        //   ) {
        //     const razorpay = new Razorpay({
        //       key_id: process.env.RAZORPAY_KEY_ID,
        //       key_secret: process.env.RAZORPAY_KEY_SECRET,
        //     });
        //     try {
        //       const [getPaymentGatewayDetails] = await this.connection.query(
        //         `select * from hospital_payment_gateway_details where hospital_id = ? and payment_gateway = ?`,
        //         [paymentDetails.Hospital_id, 'razorpay'],
        //       );
        //       const SubMerchantdetails = JSON.parse(
        //         JSON.stringify(
        //           getPaymentGatewayDetails.gateway_account_details,
        //         ),
        //       );
        //       const submerchantAccountId = SubMerchantdetails.id;
        //       const paymentDetail = await razorpay.payments.fetch(
        //         paymentDetails.payment_id,
        //       );
        //       let routeAmount = await paymentDetail.amount;
        //       const transferPayload = {
        //         transfers: [
        //           {
        //             account: submerchantAccountId,
        //             amount: Math.round(routeAmount - routeAmount * 0.052),
        //             currency: 'INR',
        //             notes: {
        //               name: 'Gaurav Kumar',
        //               roll_no: 'IEC2011025',
        //             },
        //             linked_account_notes: ['roll_no'],
        //             on_hold: false,
        //           },
        //         ],
        //       };

        //       const makeRoute = await razorpay.payments.transfer(
        //         paymentDetails.payment_id,
        //         transferPayload,
        //       );
        //     } catch (error) {
        //       console.log('error : ', error);
        //     }
        //     if (
        //       !paymentDetails.payment_id ||
        //       !paymentDetails.payment_reference_number
        //     ) {
        //       return {
        //         status: 'failed',
        //         message:
        //           'enter payment_id and payment_reference_number received form razorpay to update values',
        //       };
        //     }
        //   }
        // }
        await this.dynamicConnection.query(
          `update transactions set 
              payment_reference_number = ?,
              received_by_name = ?,
              payment_id = ?,
              payment_gateway = ? where id = ?`,
          [
            paymentDetails.payment_reference_number,
            paymentDetails.received_by_name,
            paymentDetails.payment_id,
            paymentDetails.payment_gateway,
            numb,
          ],
        );

        const [getAdminTransactionId] = await this.connection.query(
          `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
          [paymentDetails.Hospital_id, numb],
        );

        await this.connection.query(
          `update transactions set 
                payment_reference_number = ?,
                received_by_name = ?,
                payment_id = ?,
                payment_gateway = ? where id = ?`,
          [
            paymentDetails.payment_reference_number,
            paymentDetails.received_by_name,
            paymentDetails.payment_id,
            paymentDetails.payment_gateway,
            getAdminTransactionId.id,
          ],
        );
        return {
          status: 'success',
          message: 'updated payment details successfully',
        };
      } catch (error) {
        return {
          success: 'failed',
          message: 'unable to update payment details',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'enter Hospital_id to get update transaction details',
      };
    }
  }

  async V2findAllUpcoming(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
    limit: number,
    page: number,
  ): Promise<upcomingApptCountResponseDto> {
    const offset = limit * (page - 1);

    try {
      let query = ` SELECT
  patients.patient_name,
  patients.id AS patient_id,
    concat("PT",patients.id) plenome_patient_id,
  CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
  CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
  CONCAT( patients.mobileno) AS Mobile,
              coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  patients.dial_code,
  opd_details.id opd_id,
  appointment.doctor,
  coalesce(patients.salutation,"") salutation,
  CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment.module,
  appointment_status.color_code,
   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
  patient_charges.payment_status,
  patient_charges.total apptFees,
  CASE
      WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
      ELSE CONCAT(" ", "- ")
  END AS appointment_token 
FROM
  appointment
LEFT JOIN
  patients ON patients.id = appointment.patient_id
LEFT JOIN
  staff ON staff.id = appointment.doctor
LEFT JOIN
  appointment_queue ON appointment_queue.appointment_id = appointment.id
  left join 
  appointment_status on appointment_status.id = appointment.appointment_status_id
  LEFT JOIN
  visit_details ON visit_details.id = appointment.visit_details_id
  left join opd_details on opd_details.id = visit_details.opd_details_id
  left join patient_charges on patient_charges.id = visit_details.patient_charge_id
              LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `;

      let countQuery = `SELECT COUNT(*) as totalCount from appointment left join visit_details on visit_details.id = appointment.visit_details_id 
              left join patient_charges on patient_charges.id = visit_details.patient_charge_id `;

      let date;
      let values = [];

      if (fromDate && toDate) {
        date =
          ` date(appointment.date) >= date( '` +
          fromDate +
          `' ) and date(appointment.date) <= date( '` +
          toDate +
          `' ) `;
      } else if (fromDate) {
        date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
      } else if (toDate) {
        date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
      } else {
        date = ` appointment.date > DATE(NOW()) `;
      }
      let where = `WHERE ` + date;
      if (doctorId) {
        where += ` and appointment.doctor = ?`;
        values.push(doctorId);
      }
      if (appointStatus) {
        where += ` and appointment.appointment_status_id = ?`;
        values.push(appointStatus);
      } else {
        where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
      }
      if (paymentStatus) {
        where += ` and patient_charges.payment_status = ?`;
        values.push(paymentStatus);
      }
      let order = ` ORDER BY
  date(appointment.date) DESC, time(appointment.date) ASC  limit ${limit} offset ${offset} `;
      let group = `
 GROUP BY
    patients.patient_name, 
    patients.id, 
    appointment.date, 
    appointment.time, 
    patients.mobileno, 
    patients.dial_code, 
    appointment.doctor, 
    staff.name, 
    staff.surname, 
    appointment_status.status, 
    appointment.appointment_status_id, 
    appointment_status.color_code, 
    appointment.id,
    apptFees,
    opd_id,
    patient_charges.payment_status, 
    appointment_queue.position  
   `;
      let final = query + where + group + order;
      let finalCount = countQuery + where;
      const GetTodayAppointment = await this.dynamicConnection.query(
        final,
        values,
      );
      const [getCount] = await this.dynamicConnection.query(finalCount, values);
      let output = {
        details: GetTodayAppointment,
        count: getCount.totalCount,
      };
      return output;
    } catch (error) {
      throw new Error(error);
    }
  }

  async V2findAllHistory(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
    limit: number,
    page: number,
  ): Promise<upcomingApptCountResponseDto> {
    const offset = limit * (page - 1);

    try {
      let query = ` SELECT
  patients.patient_name,
  patients.id AS patient_id,
    concat("PT",patients.id) plenome_patient_id,
  CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
  CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
  CONCAT( patients.mobileno) AS Mobile,
              coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  patients.dial_code,
  opd_details.id opd_id,
  appointment.doctor,
  coalesce(patients.salutation,"") salutation,
  CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment.module,
  appointment_status.color_code,
   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
  patient_charges.payment_status,
  patient_charges.total apptFees,
  CASE
      WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
      ELSE CONCAT(" ", "- ")
  END AS appointment_token 
FROM
  appointment
LEFT JOIN
  patients ON patients.id = appointment.patient_id
LEFT JOIN
  staff ON staff.id = appointment.doctor
LEFT JOIN
  appointment_queue ON appointment_queue.appointment_id = appointment.id
  left join 
  appointment_status on appointment_status.id = appointment.appointment_status_id
  LEFT JOIN
  visit_details ON visit_details.id = appointment.visit_details_id
  left join opd_details on opd_details.id = visit_details.opd_details_id
  left join patient_charges on patient_charges.id = visit_details.patient_charge_id
              LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `;

      let countQuery = `SELECT COUNT(*) as totalCount from appointment left join visit_details on visit_details.id = appointment.visit_details_id 
              left join patient_charges on patient_charges.id = visit_details.patient_charge_id `;

      let date;
      let values = [];

      if (fromDate && toDate) {
        date =
          ` date(appointment.date) >= date( '` +
          fromDate +
          `' ) and date(appointment.date) <= date( '` +
          toDate +
          `' ) `;
      } else if (fromDate) {
        date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
      } else if (toDate) {
        date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
      } else {
        date = ` (appointment.date < DATE(NOW()) or (appointment.appointment_status_id = 6 or appointment.appointment_status_id = 4)) `;
      }
      let where = `WHERE ` + date;
      if (doctorId) {
        where += ` and appointment.doctor = ?`;
        values.push(doctorId);
      }
      if (appointStatus) {
        where += ` and appointment.appointment_status_id = ?`;
        values.push(appointStatus);
      } else {
        where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
      }
      if (paymentStatus) {
        where += ` and patient_charges.payment_status = ?`;
        values.push(paymentStatus);
      }
      let order = `ORDER BY
  date(appointment.date) DESC, time(appointment.date) ASC  limit ${limit} offset ${offset} `;
      let group = `
 GROUP BY
    patients.patient_name, 
    patients.id, 
    appointment.date, 
    appointment.time, 
    patients.mobileno, 
    patients.dial_code, 
    appointment.doctor, 
    staff.name, 
    staff.surname, 
    appointment_status.status, 
    appointment.appointment_status_id, 
    appointment_status.color_code, 
    appointment.id, 
    apptFees,
    opd_id,
    patient_charges.payment_status, 
    appointment_queue.position  
   `;
      let final = query + where + group + order;
      let finalCount = countQuery + where;
      const GetTodayAppointment = await this.dynamicConnection.query(
        final,
        values,
      );
      const [getCount] = await this.dynamicConnection.query(finalCount, values);
      let output = {
        details: GetTodayAppointment,
        count: getCount.totalCount,
      };
      return output;
    } catch (error) {
      throw new Error(error);
    }
  }

  async V2findAllToday(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
    limit: number,
    page: number,
  ): Promise<upcomingApptCountResponseDto> {
    const offset = limit * (page - 1);

    try {
      let query = ` SELECT
  patients.patient_name,
  patients.id AS patient_id,
  concat("PT",patients.id) plenome_patient_id,
  CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
  CONCAT(date(appointment.date), " ", time(appointment.time)) AS comp,
  CONCAT( patients.mobileno) AS Mobile,
              coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
  patients.dial_code,
  opd_details.id opd_id,
  appointment.doctor,
  coalesce(patients.salutation,"") salutation,
  CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
  appointment_status.status appointment_status,
  appointment.appointment_status_id,
  appointment.module,
  appointment_status.color_code,
   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
  patient_charges.payment_status,
  patient_charges.total apptFees,
  CASE
      WHEN appointment_queue.position IS NOT NULL THEN appointment_queue.position
      ELSE CONCAT(" ", "- ")
  END AS appointment_token 
FROM
  appointment
LEFT JOIN
  patients ON patients.id = appointment.patient_id
LEFT JOIN
  staff ON staff.id = appointment.doctor
LEFT JOIN
  appointment_queue ON appointment_queue.appointment_id = appointment.id
  left join 
  appointment_status on appointment_status.id = appointment.appointment_status_id
  LEFT JOIN
  visit_details ON visit_details.id = appointment.visit_details_id
  left join opd_details on opd_details.id = visit_details.opd_details_id
  left join patient_charges on patient_charges.id = visit_details.patient_charge_id
              LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `;

      let countQuery = `SELECT COUNT(*) as totalCount from appointment left join visit_details on visit_details.id = appointment.visit_details_id 
              left join patient_charges on patient_charges.id = visit_details.patient_charge_id `;

      let date;
      let values = [];

      if (fromDate && toDate) {
        date =
          ` date(appointment.date) >= date( '` +
          fromDate +
          `' ) and date(appointment.date) <= date( '` +
          toDate +
          `' ) `;
      } else if (fromDate) {
        date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
      } else if (toDate) {
        date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
      } else {
        date = ` appointment.date = DATE(NOW()) `;
      }
      let where = `WHERE ` + date;
      if (doctorId) {
        where += ` and appointment.doctor = ?`;
        values.push(doctorId);
      }
      if (appointStatus) {
        where += ` and appointment.appointment_status_id = ?`;
        values.push(appointStatus);
      } else {
        where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
      }
      if (paymentStatus) {
        where += ` and patient_charges.payment_status = ?`;
        values.push(paymentStatus);
      }
      let order = `ORDER BY
  date(appointment.date) DESC, time(appointment.date) ASC  limit ${limit} offset ${offset} `;
      let group = `
 GROUP BY
    patients.patient_name, 
    patients.id, 
    appointment.date, 
    appointment.time, 
    patients.mobileno, 
    patients.dial_code, 
    appointment.doctor, 
    staff.name, 
    staff.surname, 
    appointment_status.status, 
    appointment.appointment_status_id, 
    appointment_status.color_code, 
    appointment.id, 
    apptFees,
    opd_id,
    patient_charges.payment_status, 
    appointment_queue.position  
   `;
      let final = query + where + group + order;
      let finalCount = countQuery + where;
      const GetTodayAppointment = await this.dynamicConnection.query(
        final,
        values,
      );
      const [getCount] = await this.dynamicConnection.query(finalCount, values);
      let output = {
        details: GetTodayAppointment,
        count: getCount.totalCount,
      };
      return output;
    } catch (error) {
      throw new Error(error);
    }
  }

  async V3findAllUpcoming(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
    limit: number,
    page: number,
  ) {
    const offset = limit * (page - 1);
    let query = `SELECT id,   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id, date, time, doctor, appointment_status, appointment_status_id, module, patient_id, visit_details_id 
       FROM appointment ORDER BY
  date(appointment.date) DESC, time(appointment.date) ASC `;
    let date;
    let values = [];

    if (fromDate && toDate) {
      date =
        ` date(appointment.date) >= date( '` +
        fromDate +
        `' ) and date(appointment.date) <= date( '` +
        toDate +
        `' ) `;
    } else if (fromDate) {
      date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
    } else if (toDate) {
      date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
    } else {
      date = ` appointment.date < DATE(NOW()) `;
    }
    let where = `WHERE ` + date;
    if (doctorId) {
      where += ` and appointment.doctor = ?`;
      values.push(doctorId);
    }
    if (appointStatus) {
      where += ` and appointment.appointment_status_id = ?`;
      values.push(appointStatus);
    } else {
      where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
    }
    // if (paymentStatus) {
    //   where += ` and patient_charges.payment_status = ?`;
    //   values.push(paymentStatus);
    // }
    try {
      const app_list = await this.dynamicConnection.query(
        query + where + ` LIMIT ${limit} OFFSET ${offset}`,
        values,
      );
      const [count] = await this.dynamicConnection.query(
        `select count(*) as totalCount from appointment ` + where,
        values,
      );
      if (app_list.length > 0) {
        const patientIds = app_list.map((app) => app.patient_id);
        const doctorIds = app_list.map((app) => app.doctor);
        const visitIds = app_list.map((app) => app.visit_details_id);
        const apptIds = app_list.map((app) => app.id);
        const statusIds = app_list.map((app) => app.appointment_status_id);
        const [patients, staffs, queues, statuses, opds, charges] =
          await Promise.all([
            this.dynamicConnection.query(
              `SELECT id, patient_name, mobileno, dial_code, salutation FROM patients WHERE id IN (?)`,
              [patientIds],
            ),
            this.dynamicConnection.query(
              `SELECT id, name, surname, specialist FROM staff WHERE id IN (?)`,
              [doctorIds],
            ),
            this.dynamicConnection.query(
              `SELECT appointment_id, position FROM appointment_queue WHERE appointment_id IN (?)`,
              [apptIds],
            ),
            this.dynamicConnection.query(
              `SELECT id, status, color_code FROM appointment_status WHERE id IN (?)`,
              [statusIds],
            ),
            this.dynamicConnection.query(
              `
        SELECT opd_details.id AS opd_id, visit_details.id AS visit_id 
        FROM opd_details 
        LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id 
        WHERE visit_details.id IN (?)`,
              [visitIds],
            ),
            this.dynamicConnection.query(
              `
        SELECT payment_status, total, visit_details.id AS visit_id 
        FROM patient_charges 
        LEFT JOIN visit_details ON visit_details.patient_charge_id = patient_charges.id 
        WHERE visit_details.id IN (?)`,
              [visitIds],
            ),
          ]);

        const patientMap = new Map(patients.map((p) => [p.id, p]));
        const staffMap = new Map(staffs.map((s) => [s.id, s]));
        const queueMap = new Map();
        queues.forEach((q) => queueMap.set(q.appointment_id, q));
        const statusMap = new Map(statuses.map((s) => [s.id, s]));
        const opdMap = new Map(opds.map((o) => [o.visit_id, o.opd_id]));
        const chargeMap = new Map(charges.map((c) => [c.visit_id, c]));

        await Promise.all(
          app_list.map(async (app) => {
            app.patient_details = patientMap.get(app.patient_id);
            const staff_details: any = staffMap.get(app.doctor);

            if (staff_details?.specialist) {
              const specIds = staff_details.specialist.filter(
                (id) => typeof id === 'number',
              );
              const specNames = await Promise.all(
                specIds.map(async (id) => {
                  try {
                    const [row] = await this.dynamicConnection.query(
                      `SELECT specialist_name FROM specialist WHERE id = ?`,
                      [id],
                    );
                    return row?.specialist_name || id;
                  } catch (err) {
                    return id;
                  }
                }),
              );
              staff_details.specialist = specNames;
            }

            app.staff_details = staff_details;
            app.appointment_token_details = queueMap.get(app.id);
            app.app_status = statusMap.get(Number(app.appointment_status_id));
            app.opd_details = opdMap.get(app.visit_details_id);
            app.payment_details = chargeMap.get(app.visit_details_id);
          }),
        );

        let out = {
          details: app_list,
          count: count.totalCount,
        };
        return out;
      } else {
        return {
          details: [],
          count: 0,
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async V3findAllHistory(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
    limit: number,
    page: number,
  ) {
    const offset = limit * (page - 1);
    let query = `SELECT id,   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id, date, time, doctor, appointment_status, appointment_status_id, module, patient_id, visit_details_id 
       FROM appointment ORDER BY
  date(appointment.date) DESC, time(appointment.date) ASC `;
    let date;
    let values = [];

    if (fromDate && toDate) {
      date =
        ` date(appointment.date) >= date( '` +
        fromDate +
        `' ) and date(appointment.date) <= date( '` +
        toDate +
        `' ) `;
    } else if (fromDate) {
      date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
    } else if (toDate) {
      date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
    } else {
      date = ` appointment.date < DATE(NOW()) `;
    }
    let where = `WHERE ` + date;
    if (doctorId) {
      where += ` and appointment.doctor = ?`;
      values.push(doctorId);
    }
    if (appointStatus) {
      where += ` and appointment.appointment_status_id = ?`;
      values.push(appointStatus);
    } else {
      where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
    }
    // if (paymentStatus) {
    //   where += ` and patient_charges.payment_status = ?`;
    //   values.push(paymentStatus);
    // }
    try {
      const app_list = await this.dynamicConnection.query(
        query + where + ` LIMIT ${limit} OFFSET ${offset}`,
        values,
      );
      const [count] = await this.dynamicConnection.query(
        `select count(*) as totalCount from appointment ` + where,
        values,
      );
      if (app_list.length > 0) {
        const patientIds = app_list.map((app) => app.patient_id);
        const doctorIds = app_list.map((app) => app.doctor);
        const visitIds = app_list.map((app) => app.visit_details_id);
        const apptIds = app_list.map((app) => app.id);
        const statusIds = app_list.map((app) => app.appointment_status_id);
        const [patients, staffs, queues, statuses, opds, charges] =
          await Promise.all([
            this.dynamicConnection.query(
              `SELECT id, patient_name, mobileno, dial_code, salutation FROM patients WHERE id IN (?)`,
              [patientIds],
            ),
            this.dynamicConnection.query(
              `SELECT id, name, surname, specialist FROM staff WHERE id IN (?)`,
              [doctorIds],
            ),
            this.dynamicConnection.query(
              `SELECT appointment_id, position FROM appointment_queue WHERE appointment_id IN (?)`,
              [apptIds],
            ),
            this.dynamicConnection.query(
              `SELECT id, status, color_code FROM appointment_status WHERE id IN (?)`,
              [statusIds],
            ),
            this.dynamicConnection.query(
              `
        SELECT opd_details.id AS opd_id, visit_details.id AS visit_id 
        FROM opd_details 
        LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id 
        WHERE visit_details.id IN (?)`,
              [visitIds],
            ),
            this.dynamicConnection.query(
              `
        SELECT payment_status, total, visit_details.id AS visit_id 
        FROM patient_charges 
        LEFT JOIN visit_details ON visit_details.patient_charge_id = patient_charges.id 
        WHERE visit_details.id IN (?)`,
              [visitIds],
            ),
          ]);

        const patientMap = new Map(patients.map((p) => [p.id, p]));
        const staffMap = new Map(staffs.map((s) => [s.id, s]));
        const queueMap = new Map();
        queues.forEach((q) => queueMap.set(q.appointment_id, q));
        const statusMap = new Map(statuses.map((s) => [s.id, s]));
        const opdMap = new Map(opds.map((o) => [o.visit_id, o.opd_id]));
        const chargeMap = new Map(charges.map((c) => [c.visit_id, c]));

        await Promise.all(
          app_list.map(async (app) => {
            app.patient_details = patientMap.get(app.patient_id);
            const staff_details: any = staffMap.get(app.doctor);

            if (staff_details?.specialist) {
              const specIds = staff_details.specialist.filter(
                (id) => typeof id === 'number',
              );
              const specNames = await Promise.all(
                specIds.map(async (id) => {
                  try {
                    const [row] = await this.dynamicConnection.query(
                      `SELECT specialist_name FROM specialist WHERE id = ?`,
                      [id],
                    );
                    return row?.specialist_name || id;
                  } catch (err) {
                    return id;
                  }
                }),
              );
              staff_details.specialist = specNames;
            }

            app.staff_details = staff_details;
            app.appointment_token_details = queueMap.get(app.id);
            app.app_status = statusMap.get(Number(app.appointment_status_id));
            app.opd_details = opdMap.get(app.visit_details_id);
            app.payment_details = chargeMap.get(app.visit_details_id);
          }),
        );

        let out = {
          details: app_list,
          count: count.totalCount,
        };
        return out;
      } else {
        return {
          details: [],
          count: 0,
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async V3findAllToday(
    fromDate: string,
    toDate: string,
    doctorId: number,
    appointStatus: string,
    hospital_id: number,
    paymentStatus: string,
    limit: number,
    page: number,
  ) {
    const offset = limit * (page - 1);
    let query = `SELECT id,   concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id, date, time, doctor, appointment_status, appointment_status_id, module, patient_id, visit_details_id 
       FROM appointment ORDER BY
  date(appointment.date) DESC, time(appointment.date) ASC `;
    let date;
    let values = [];

    if (fromDate && toDate) {
      date =
        ` date(appointment.date) >= date( '` +
        fromDate +
        `' ) and date(appointment.date) <= date( '` +
        toDate +
        `' ) `;
    } else if (fromDate) {
      date = ` date(appointment.date) >= date( '` + fromDate + `' ) `;
    } else if (toDate) {
      date = `  date(appointment.date) <= date( '` + toDate + `' ) `;
    } else {
      date = ` appointment.date < DATE(NOW()) `;
    }
    let where = `WHERE ` + date;
    if (doctorId) {
      where += ` and appointment.doctor = ?`;
      values.push(doctorId);
    }
    if (appointStatus) {
      where += ` and appointment.appointment_status_id = ?`;
      values.push(appointStatus);
    } else {
      where += ` and (appointment.appointment_status_id <> 6 and appointment.appointment_status_id <> 4)`;
    }
    // if (paymentStatus) {
    //   where += ` and patient_charges.payment_status = ?`;
    //   values.push(paymentStatus);
    // }
    try {
      const app_list = await this.dynamicConnection.query(
        query + where + ` LIMIT ${limit} OFFSET ${offset}`,
        values,
      );
      const [count] = await this.dynamicConnection.query(
        `select count(*) as totalCount from appointment ` + where,
        values,
      );
      if (app_list.length > 0) {
        const patientIds = app_list.map((app) => app.patient_id);
        const doctorIds = app_list.map((app) => app.doctor);
        const visitIds = app_list.map((app) => app.visit_details_id);
        const apptIds = app_list.map((app) => app.id);
        const statusIds = app_list.map((app) => app.appointment_status_id);
        const [patients, staffs, queues, statuses, opds, charges] =
          await Promise.all([
            this.dynamicConnection.query(
              `SELECT id, patient_name, mobileno, dial_code, salutation FROM patients WHERE id IN (?)`,
              [patientIds],
            ),
            this.dynamicConnection.query(
              `SELECT id, name, surname, specialist FROM staff WHERE id IN (?)`,
              [doctorIds],
            ),
            this.dynamicConnection.query(
              `SELECT appointment_id, position FROM appointment_queue WHERE appointment_id IN (?)`,
              [apptIds],
            ),
            this.dynamicConnection.query(
              `SELECT id, status, color_code FROM appointment_status WHERE id IN (?)`,
              [statusIds],
            ),
            this.dynamicConnection.query(
              `
        SELECT opd_details.id AS opd_id, visit_details.id AS visit_id 
        FROM opd_details 
        LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id 
        WHERE visit_details.id IN (?)`,
              [visitIds],
            ),
            this.dynamicConnection.query(
              `
        SELECT payment_status, total, visit_details.id AS visit_id 
        FROM patient_charges 
        LEFT JOIN visit_details ON visit_details.patient_charge_id = patient_charges.id 
        WHERE visit_details.id IN (?)`,
              [visitIds],
            ),
          ]);

        const patientMap = new Map(patients.map((p) => [p.id, p]));
        const staffMap = new Map(staffs.map((s) => [s.id, s]));
        const queueMap = new Map();
        queues.forEach((q) => queueMap.set(q.appointment_id, q));
        const statusMap = new Map(statuses.map((s) => [s.id, s]));
        const opdMap = new Map(opds.map((o) => [o.visit_id, o.opd_id]));
        const chargeMap = new Map(charges.map((c) => [c.visit_id, c]));

        await Promise.all(
          app_list.map(async (app) => {
            app.patient_details = patientMap.get(app.patient_id);
            const staff_details: any = staffMap.get(app.doctor);

            if (staff_details?.specialist) {
              const specIds = staff_details.specialist.filter(
                (id) => typeof id === 'number',
              );
              const specNames = await Promise.all(
                specIds.map(async (id) => {
                  try {
                    const [row] = await this.dynamicConnection.query(
                      `SELECT specialist_name FROM specialist WHERE id = ?`,
                      [id],
                    );
                    return row?.specialist_name || id;
                  } catch (err) {
                    return id;
                  }
                }),
              );
              staff_details.specialist = specNames;
            }

            app.staff_details = staff_details;
            app.appointment_token_details = queueMap.get(app.id);
            app.app_status = statusMap.get(Number(app.appointment_status_id));
            app.opd_details = opdMap.get(app.visit_details_id);
            app.payment_details = chargeMap.get(app.visit_details_id);
          }),
        );

        let out = {
          details: app_list,
          count: count.totalCount,
        };
        return out;
      } else {
        return {
          details: [],
          count: 0,
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async updatePaymentDetails(
    appointment_id: string,
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
      const [getTransactionDetails] = await this.dynamicConnection.query(
        `
        select id from transactions where appointment_id = ?`,
        [appointment_id],
      );
      if (!getTransactionDetails) {
        return {
          status_code: 400,
          status: 'Failed',
          message: 'Transaction details not found for the appointment',
        };
      }
      const [getAdminTransactionDetails] = await this.connection.query(
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

      const updateTransaction = await this.dynamicConnection.query(
        `update transactions set  payment_method = ?,
    card_division = ?,
    card_bank_name = ?,
    card_type = ?,
    card_transaction_id = ?,
    net_banking_division = ?,
    net_banking_transaction_id = ?,
    upi_id = ?,
    upi_transaction_id = ?,
    cash_transaction_id = ?,
    upi_bank_name = ? where id = ?`,
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
          Entity.cash_transaction_id,
          Entity.upi_bank_name,
          getTransactionDetails.id,
        ],
      );
      const updateAdminTransaction = await this.connection.query(
        `update transactions set  payment_method = ?,
    card_division = ?,
    card_bank_name = ?,
    card_type = ?,
    card_transaction_id = ?,
    net_banking_division = ?,
    net_banking_transaction_id = ?,
    upi_id = ?,
    upi_transaction_id = ?,
    cash_transaction_id = ?,
    upi_bank_name = ? where id = ?`,
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
          Entity.cash_transaction_id,
          Entity.upi_bank_name,
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
      console.log(error, 'asdf');

      return {
        status_code: 500,
        status: 'Error',
        message: 'API SERVICE TEMPORARILY UNAVAILABLE,CHECK BACK LATER',
      };
    }
  }
}
