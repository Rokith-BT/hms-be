import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PhrAppointment } from './entities/phr-appointment.entity';
import axios from 'axios';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FaceAuthService } from 'src/face-auth/face-auth.service';
const Razorpay = require('razorpay');
const moment = require('moment');
@Injectable()
export class PhrAppointmentService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
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
      this.dynamicConnection.query(
        `update patient_charges set 
  payment_status = 'refunded' where id = ?`,
        [PatientChargesDetailsId],
      );

      this.connection.query(
        `update patient_charges set 
        payment_status = 'refunded' where id = ?`,
        [AdminPatientChargesDetailsId],
      );
    } catch (error) {
      console.log(error, 'error in refunding appointment charge');
    }
  }

  RefundTempApptCharge(payment_id) {
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
    } catch (error) {
      console.log(error, 'error in refunding temporary appointment charge');
    }
  }

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
      const paymentDetails = await razorpay.payments.fetch(payment_id);
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
      console.log('adfasdfadfadf', transferPayload);

      await razorpay.payments.transfer(payment_id, transferPayload);
    } catch (error) {
      console.log(error, 'haraeee ohh sambo');
    }
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
  async convertTo12HourFormat(time) {
    return moment(time, 'HH:mm:ss').format('h:mm A');
  }
  async create(AppointmentEntity: PhrAppointment) {
    if (AppointmentEntity.Hospital_id) {
      const [checkDuplicate] = await this.connection.query(
        `select * from appointment 
         where patient_id = ? and doctor = ? and shift_id = ? and date = ? and appointment_status_id <> 4`,
        [
          AppointmentEntity.patient_id,
          AppointmentEntity.doctor,
          AppointmentEntity.shift_id,
          AppointmentEntity.date,
        ],
      );
      if (!checkDuplicate) {
        if (!AppointmentEntity.txn_id) {
          AppointmentEntity.txn_id = 'NA';
        }
        if (!AppointmentEntity.bank_ref_id) {
          AppointmentEntity.bank_ref_id = 'NA';
        }
        if (!AppointmentEntity.pg_ref_id) {
          AppointmentEntity.pg_ref_id = 'NA';
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
              const [getPaymentGatewayDetails] = await this.connection.query(
                `select * from hospital_payment_gateway_details where hospital_id = ? and payment_gateway = ?`,
                [AppointmentEntity.Hospital_id, 'razorpay'],
              );
              this.TransferToSubmerchant(
                AppointmentEntity.payment_id,
                getPaymentGatewayDetails,
              );
            }
          }
        }

        const currentDate = new Date();

        const formattedDate = currentDate.toISOString().split('T')[0];
        let position;

        const AdminPatient = await this.connection.query(
          `select * from patients where id = ?`,
          [AppointmentEntity.patient_id],
        );

        try {
          const [patientInHos] = await this.dynamicConnection.query(
            `select * from patients where aayush_unique_id = ?`,
            [AdminPatient[0].aayush_unique_id],
          );

          let hosPatientId;

          if (patientInHos) {
            hosPatientId = patientInHos.id;
          } else {
            const dateString = AdminPatient[0].dob;
            const dateObject = new Date(dateString);
            const timestamp = dateObject
              .toISOString()
              .replace('T', ' ')
              .replace(/\.\d+Z$/, '');
            let faceID = null;
            if (AdminPatient[0].image && AdminPatient[0].image.trim() != '') {
              const getFaceId = await this.addAppointmentService.getfaceID(
                AdminPatient[0].image,
              );
              faceID = getFaceId?.faceID;
            }
            const createPatient = await this.dynamicConnection.query(
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
                AdminPatient[0].patient_name,
                timestamp,
                AdminPatient[0].image,
                faceID,
                AdminPatient[0].mobileno,
                AdminPatient[0].email,
                AdminPatient[0].gender,
                AdminPatient[0].address,
                AdminPatient[0].ABHA_number,
                AdminPatient[0].dial_code,
                AdminPatient[0].blood_bank_product_id,
                AdminPatient[0].aayush_unique_id,
              ],
            );
            hosPatientId = createPatient.insertId;
          }
          let payment_status;
          if (
            AppointmentEntity.payment_mode?.toLocaleLowerCase() == 'cash' ||
            AppointmentEntity.payment_mode?.toLocaleLowerCase() == 'offline' ||
            AppointmentEntity.payment_mode == 'cheque' ||
            AppointmentEntity.payment_mode?.toLocaleLowerCase() == 'paylater'
          ) {
            payment_status = 'unpaid';
          } else {
            if (AppointmentEntity.doctor) {
              payment_status = 'paid';
            } else {
              payment_status = 'partially_paid';
            }
          }

          if (AppointmentEntity.doctor) {
            const [staffEmailAdmin] = await this.connection.query(
              `select email from staff where id = ?`,
              [AppointmentEntity.doctor],
            );
            const [HosStaff] = await this.dynamicConnection.query(
              `select id from staff where email = ?`,
              [staffEmailAdmin.email],
            );
            let HOSStaffId = HosStaff.id;
            let HOStransaction_id: number;
            const HOScaseRef = await this.dynamicConnection.query(
              'INSERT INTO case_references values(default,default)',
            );

            const HOSopdCreate = await this.dynamicConnection.query(
              `
      insert into opd_details (case_reference_id,patient_id) values (?,?)`,
              [HOScaseRef.insertId, hosPatientId],
            );

            const HOScharge = await this.dynamicConnection.query(
              'select charge_id from shift_details where shift_details.staff_id = ?',
              [HOSStaffId],
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
      patient_id,
      date,
      opd_id,
      qty,
      charge_id,
      standard_charge,
      payment_status,
      tax,
      apply_charge,
      amount,
      total
      ) values(?,?,?,?,?,?,?,?,?,?,?)`,
              [
                hosPatientId,
                AppointmentEntity.date,
                HOSopdCreate.insertId,
                1,
                HOScharge_id,
                HOSamount[0].standard_charge,
                payment_status,
                HOSamount[0].tax_percentage,
                HOSamount[0].standard_charge,
                HOSamount[0].amount,
                HOSamount[0].amount,
              ],
            );
            if (
              AppointmentEntity.payment_mode?.toLocaleLowerCase() != 'cash' &&
              AppointmentEntity.payment_mode?.toLocaleLowerCase() !=
                'offline' &&
              AppointmentEntity.payment_mode?.toLocaleLowerCase() != 'cheque' &&
              AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater'
            ) {
              const HOStransactions = await this.dynamicConnection.query(
                `
  insert into transactions (
    type,
    patient_charges_id,
    section,
    patient_id,
    case_reference_id,
    amount,
    payment_mode,
    payment_date,txn_id,pg_ref_id,bank_ref_id,
    payment_gateway,
  payment_id,
  payment_reference_number,
  received_by_name
    ) values
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  'payment',
                  Patient_charges_insert.insertId,
                  'Appointment',
                  hosPatientId,
                  HOScaseRef.insertId,
                  HOSamount[0].amount,
                  AppointmentEntity.payment_mode,
                  AppointmentEntity.payment_date,
                  AppointmentEntity.txn_id,
                  AppointmentEntity.pg_ref_id,
                  AppointmentEntity.bank_ref_id,
                  AppointmentEntity.payment_gateway,
                  AppointmentEntity.payment_id,
                  AppointmentEntity.payment_reference_number,
                  'PHR Payment',
                ],
              );
              HOStransaction_id = HOStransactions.insertId;
              await this.dynamicConnection.query(
                `update patient_charges set transaction_id = ? where id = ?`,
                [HOStransaction_id, Patient_charges_insert.insertId],
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
                HOSStaffId,
                AppointmentEntity.date + ' ' + AppointmentEntity.time,
                AppointmentEntity.live_consult,
                AppointmentEntity.payment_mode,
              ],
            );
            let hos_appointment_id;
            const [HosGlobalShiftId] = await this.connection.query(
              `select * from global_shift where id = ?`,
              [AppointmentEntity.global_shift_id],
            );
            const [HosShiftId] = await this.connection.query(
              `select * from doctor_shift where id = ?`,
              [AppointmentEntity.shift_id],
            );

            try {
              const HOSbookAppnt = await this.dynamicConnection.query(
                `insert into appointment(
          patient_id,
          appointment_status,
          appointment_status_id,
          case_reference_id,
          visit_details_id,
          date,
          time,
          doctor,
          source,
          global_shift_id,
          shift_id,
          live_consult,
          amount
          ) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  hosPatientId,
                  'Reserved',
                  '2',
                  HOScaseRef.insertId,
                  HOSvisitInsert.insertId,
                  AppointmentEntity.date,
                  AppointmentEntity.time,
                  HOSStaffId,
                  'Online',
                  HosGlobalShiftId.hospital_global_shift_id,
                  HosShiftId.hospital_doctor_shift_id,
                  AppointmentEntity.live_consult,
                  HOSamount[0].amount,
                ],
              );
              hos_appointment_id = HOSbookAppnt.insertId;
              if (AppointmentEntity.date == formattedDate) {
                const [getLastPosition] = await this.dynamicConnection.query(
                  `select position from
       appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? 
       ORDER BY position DESC `,
                  [
                    AppointmentEntity.date,
                    HOSStaffId,
                    HosShiftId.hospital_doctor_shift_id,
                  ],
                );
                if (getLastPosition) {
                  position = getLastPosition.position + 1;
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
                  HOSStaffId,
                  HosShiftId.hospital_doctor_shift_id,
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
            } catch (error) {
              return error;
            }

            // #############################################################################################################

            let transaction_id: number;
            const caseRef = await this.connection.query(
              'INSERT INTO case_references values(default,default)',
            );
            const opdCreate = await this.connection.query(
              `
  insert into opd_details (case_reference_id,patient_id,Hospital_id,hos_opd_id) values (?,?,?,?)`,
              [
                caseRef.insertId,
                AppointmentEntity.patient_id,
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
        patient_id,
        date,
        opd_id,
        qty,
        charge_id,
        standard_charge,
        payment_status,    
        tax,
        apply_charge,
        amount,
        Hospital_id,
        hos_patient_charges_id,
        total
        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                AppointmentEntity.patient_id,
                AppointmentEntity.date,
                opdCreate.insertId,
                1,
                getAdminChargeId[0].id,
                HOSamount[0].standard_charge,
                payment_status,
                HOSamount[0].tax_percentage,
                HOSamount[0].standard_charge,
                HOSamount[0].amount,
                AppointmentEntity.Hospital_id,
                Patient_charges_insert.insertId,
                HOSamount[0].amount,
              ],
            );

            try {
              if (
                AppointmentEntity.payment_mode.toLocaleLowerCase() != 'cash' &&
                AppointmentEntity.payment_mode.toLocaleLowerCase() !=
                  'offline' &&
                AppointmentEntity.payment_mode.toLocaleLowerCase() !=
                  'cheque' &&
                AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater'
              ) {
                const transactions = await this.connection.query(
                  `
    insert into transactions (
    type,
    patient_charges_id,
    section,
    patient_id,
    case_reference_id,
    amount,
    payment_mode,
    payment_date,Hospital_id,
    hos_transaction_id,txn_id,pg_ref_id,bank_ref_id,
    payment_gateway,
  payment_id,
  payment_reference_number,
  received_by_name
    ) values
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [
                    'payment',
                    patient_charges.insertId,
                    'Appointment',
                    AppointmentEntity.patient_id,
                    await caseRef.insertId,
                    await HOSamount[0].amount,
                    AppointmentEntity.payment_mode,
                    AppointmentEntity.payment_date,
                    AppointmentEntity.Hospital_id,
                    HOStransaction_id,
                    AppointmentEntity.txn_id,
                    AppointmentEntity.pg_ref_id,
                    AppointmentEntity.bank_ref_id,
                    AppointmentEntity.payment_gateway,
                    AppointmentEntity.payment_id,
                    AppointmentEntity.payment_reference_number,
                    'PHR Payment',
                  ],
                );
                transaction_id = await transactions.insertId;
                await this.connection.query(
                  `update patient_charges set transaction_id = ? where id = ?`,
                  [transaction_id, patient_charges.insertId],
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
                AppointmentEntity.doctor,
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
        appointment_status,
        appointment_status_id,
        case_reference_id,
        visit_details_id,
        date,
        time,
        doctor,
        source,
        global_shift_id,
        shift_id,
        live_consult,
        Hospital_id,hos_appointment_id,amount
        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  AppointmentEntity.patient_id,
                  'Reserved',
                  '2',
                  await caseRef.insertId,
                  await visitInsert.insertId,
                  AppointmentEntity.date,
                  AppointmentEntity.time,
                  AppointmentEntity.doctor,
                  'Online',
                  AppointmentEntity.global_shift_id,
                  AppointmentEntity.shift_id,
                  AppointmentEntity.live_consult,
                  AppointmentEntity.Hospital_id,
                  hos_appointment_id,
                  await HOSamount[0].amount,
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
                  AppointmentEntity.doctor,
                  AppointmentEntity.shift_id,
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
              const [getHosName] = await this.connection.query(
                `select * from hospitals where 
  plenome_id = ?`,
                [AppointmentEntity.Hospital_id],
              );
              const HosName = await getHosName.hospital_name;
              const HosAddress = await getHosName.address;

              const reslt = await this.connection.query(
                `select  
                        patients.id,
                        patients.patient_name,patients.gender,patients.age,
                        patients.mobileno,
                        patients.email,
                        patients.ABHA_number,
                        concat(staff.name,"",staff.surname) doctorName,
                        staff.id doctor_id,
                        staff.employee_id,
                        appointment.source,
                        GROUP_CONCAT(specialist.specialist_name) AS specialist_names,
                        concat(CASE 
              WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
              ELSE 'TEMP' 
          END,appointment.id) appointment_id,
                                            concat(CASE 
              WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
              ELSE 'TEMP' 
          END,appointment.hos_appointment_id) hos_appointment_id,
                        DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
                        DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
                        concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
                        appointment_status.status appointment_status,
                        appointment.appointment_status_id,
                        appointment_status.color_code,
                        appointment_queue.position,
                        CASE
                                WHEN appointment.live_consult = 'yes' THEN 'online'
                                ELSE 'offline'
                            END AS consultingType,
                            appointment.message,
                            case 
                  when appointment.doctor is null then
                  patient_charges.temp_standard_charge else
                  patient_charges.standard_charge end consultFees,
                                            case 
                  when appointment.doctor is null then
                  patient_charges.temp_tax else
                  patient_charges.tax end taxPercentage,
                         case 
            when appointment.doctor is null then 
                      format(((patient_charges.temp_standard_charge * patient_charges.temp_tax)/100 ),2) else
  
              format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) end  taxAmount,
                        patient_charges.total netAmount,
                        transactions.id transactionID,
                        transactions.payment_mode,
                        transactions.payment_date,
                        CASE
                                WHEN patient_charges.payment_status = 'paid' THEN 'Payment done'
                                ELSE 'Need payment' 
                            END AS payment_status
             
                            from appointment
                            left join patients on patients.id = appointment.patient_id
                            left join staff on staff.id = appointment.doctor
                            LEFT JOIN specialist ON 
                            IF(
                                JSON_VALID(staff.specialist) AND JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON)),
                                1,
                                0
                            )
                            left join transactions on transactions.appointment_id = appointment.id
                            LEFT JOIN appointment_status ON appointment_status.id = appointment.appointment_status_id
                            left join doctor_shift on doctor_shift.id = appointment.shift_id
                            left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                            left join patient_charges on patient_charges.opd_id = opd_details.id
                            left join appointment_queue on appointment.id = appointment_queue.appointment_id
                            where appointment.id = ?
                            group by id,patient_name,gender,age,mobileno,email,ABHA_number,doctorName,doctor_id,source,appointment_id,
                            appointmentDate,
                            appointmentTime,
                            slot,
                            appointment_status,
                            appointment_status_id,
                            color_code,
                            position,
                            consultingType,
                            message,
                            consultFees,
                            taxPercentage,
                            taxAmount,
                            netAmount,
                            employee_id,
                            transactionID,
                            payment_mode,
                            payment_date,
                            payment_status `,
                [bookAppnt.insertId],
              );
              reslt[0].hospital_name = HosName;
              reslt[0].hospital_address = HosAddress;

              const verifyData = {
                mobilenumber: '91' + reslt[0].mobileno,
                Patname: ' ' + reslt[0].patient_name,
                Date: reslt[0].appointmentDate + ' With ' + reslt[0].doctorName,
                DocName: 'Token will be generated soon',
              };

              const emailData = {
                email: reslt[0].email,
                name: ' ' + reslt[0].patient_name,
                drname: 'Dr.' + reslt[0].doctorName,
                date: reslt[0].appointmentDate,
                time: reslt[0].appointmentTime,
                HosName: reslt[0].hospital_name,
                location: reslt[0].hospital_address,
              };
              this.eventEmitter.emit(
                'send-email-sms-appointment-create',
                verifyData,
                emailData,
              );
              return [
                {
                  status: 'success',
                  messege: 'Appointment booked successfully',
                  TransactionId: transaction_id,
                  PaymentMethod: payment_type,
                  QR_Type: 'APPOINTMENT QR',
                  inserted_details: reslt,
                },
              ];
            } catch (error) {
              return error;
            }
          } else {
            let HOStransaction_id: number;
            const HOScaseRef = await this.dynamicConnection.query(
              'INSERT INTO case_references values(default,default)',
            );

            const HOSopdCreate = await this.dynamicConnection.query(
              `
        insert into opd_details (case_reference_id,patient_id) values (?,?)`,
              [HOScaseRef.insertId, hosPatientId],
            );

            const [HOSChargeAmount] = await this.connection.query(
              `select hospital_consulting_charge standard_charge,
        tax_percentage tax,(hospital_consulting_charge + tax_amount) amount
         from hospitals where plenome_id = ?`,
              [AppointmentEntity.Hospital_id],
            );

            const Patient_charges_insert = await this.dynamicConnection.query(
              `insert into patient_charges(
        patient_id,
        date,
        payment_status,
        opd_id,
        qty,    
        temp_standard_charge,    
        temp_tax,
        temp_apply_charge,
        temp_amount,
        total 
        ) values(?,?,?,?,?,?,?,?,?,?)`,
              [
                hosPatientId,
                AppointmentEntity.date,
                payment_status,
                HOSopdCreate.insertId,
                1,
                HOSChargeAmount.standard_charge,
                HOSChargeAmount.tax,
                HOSChargeAmount.standard_charge,
                HOSChargeAmount.amount,
                HOSChargeAmount.amount,
              ],
            );

            if (
              AppointmentEntity.payment_mode.toLocaleLowerCase() != 'cash' &&
              AppointmentEntity.payment_mode.toLocaleLowerCase() != 'offline' &&
              AppointmentEntity.payment_mode != 'cheque' &&
              AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater'
            ) {
              const HOStransactions = await this.dynamicConnection.query(
                `
    insert into transactions (
      type,
      section,
      patient_id,
      patient_charges_id,
      case_reference_id,
      temp_appt_amount,
      payment_mode,
      payment_date,
      txn_id,
      pg_ref_id,
      bank_ref_id,
      temp_appt_payment_gateway,
      temp_appt_payment_id,
      temp_appt_payment_reference_number,
      received_by_name
      ) values
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  'payment',
                  'Appointment',
                  hosPatientId,
                  Patient_charges_insert.insertId,
                  HOScaseRef.insertId,
                  HOSChargeAmount.amount,
                  AppointmentEntity.payment_mode,
                  AppointmentEntity.payment_date,
                  AppointmentEntity.txn_id,
                  AppointmentEntity.pg_ref_id,
                  AppointmentEntity.bank_ref_id,
                  AppointmentEntity.payment_gateway,
                  AppointmentEntity.payment_id,
                  AppointmentEntity.payment_reference_number,
                  'PHR Payment',
                ],
              );
              HOStransaction_id = HOStransactions.insertId;
              await this.dynamicConnection.query(
                `update patient_charges set transaction_id = ? where id = ?`,
                [HOStransaction_id, Patient_charges_insert.insertId],
              );
            }
            const HOSvisitInsert = await this.dynamicConnection.query(
              `
      insert into visit_details(
        opd_details_id,
        patient_charge_id,
        transaction_id,
        case_type,
        appointment_date,
        live_consult,
        payment_mode
        ) values (?,?,?,?,?,?,?)`,
              [
                HOSopdCreate.insertId,
                Patient_charges_insert.insertId,
                HOStransaction_id,
                '',
                AppointmentEntity.date + ' ' + AppointmentEntity.time,
                AppointmentEntity.live_consult,
                AppointmentEntity.payment_mode,
              ],
            );
            let hos_appointment_id;
            try {
              const HOSbookAppnt = await this.dynamicConnection.query(
                `insert into appointment(
            patient_id,
            appointment_status,
            appointment_status_id,
            case_reference_id,
            visit_details_id,
            date,
            time,
            source,
            live_consult,
            amount
            ) values(?,?,?,?,?,?,?,?,?,?)`,
                [
                  hosPatientId,
                  'Requested',
                  1,
                  HOScaseRef.insertId,
                  HOSvisitInsert.insertId,
                  AppointmentEntity.date,
                  AppointmentEntity.time,
                  'Online',
                  AppointmentEntity.live_consult,
                  HOSChargeAmount.amount,
                ],
              );
              hos_appointment_id = HOSbookAppnt.insertId;

              await this.dynamicConnection.query(
                `insert into appointment_queue(
        appointment_id,
        position,
        date
        ) values (?,?,?)`,
                [hos_appointment_id, null, AppointmentEntity.date],
              );
              if (HOStransaction_id) {
                await this.dynamicConnection.query(
                  `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
                  [HOSbookAppnt.insertId, HOStransaction_id],
                );
              }
              let payment_type;
              if (
                AppointmentEntity.payment_mode.toLocaleLowerCase() == `cash` ||
                AppointmentEntity.payment_mode.toLocaleLowerCase() ==
                  `offline` ||
                AppointmentEntity.payment_mode.toLocaleLowerCase() ==
                  `cheque` ||
                AppointmentEntity.payment_mode.toLocaleLowerCase() == `paylater`
              ) {
                payment_type = `Offline`;
              } else {
                payment_type = AppointmentEntity.payment_mode;
              }
              let hosTransId;
              if (HOStransaction_id) {
                hosTransId = HOStransaction_id;
              }
              await this.dynamicConnection.query(
                `insert into
        appointment_payment
        (appointment_id,
          paid_amount,
          payment_mode,
          payment_type,
          transaction_id,
          date) values (?,?,?,?,?,?)`,
                [
                  hos_appointment_id,
                  HOSChargeAmount.amount,
                  AppointmentEntity.payment_mode,
                  payment_type,
                  hosTransId,
                  AppointmentEntity.date + ' ' + AppointmentEntity.time,
                ],
              );
            } catch (error) {
              return error;
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
                AppointmentEntity.patient_id,
                AppointmentEntity.Hospital_id,
                HOSopdCreate.insertId,
              ],
            );
            const patient_charges = await this.connection.query(
              `insert into patient_charges(
      patient_id,
      date,
      payment_status,
      opd_id,
      qty,
      temp_standard_charge,    
      temp_tax,
      temp_apply_charge,
      temp_amount,
      Hospital_id,
      hos_patient_charges_id,
      total
      ) values(?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                AppointmentEntity.patient_id,
                AppointmentEntity.date,
                payment_status,
                opdCreate.insertId,
                1,
                HOSChargeAmount.standard_charge,
                HOSChargeAmount.tax,
                HOSChargeAmount.standard_charge,
                HOSChargeAmount.amount,
                AppointmentEntity.Hospital_id,
                Patient_charges_insert.insertId,
                HOSChargeAmount.amount,
              ],
            );
            try {
              if (
                AppointmentEntity.payment_mode.toLocaleLowerCase() != 'cash' &&
                AppointmentEntity.payment_mode.toLocaleLowerCase() !=
                  'offline' &&
                AppointmentEntity.payment_mode.toLocaleLowerCase() !=
                  'cheque' &&
                AppointmentEntity.payment_mode.toLocaleLowerCase() != 'paylater'
              ) {
                const transactions = await this.connection.query(
                  `
  insert into transactions (
  type,
  patient_charges_id,
  section,
  patient_id,
  case_reference_id,
  temp_appt_amount,
  payment_mode,
  payment_date,Hospital_id,
  hos_transaction_id,txn_id,pg_ref_id,bank_ref_id,
  temp_appt_payment_gateway,
  temp_appt_payment_id,
  temp_appt_payment_reference_number,
  received_by_name
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [
                    'payment',
                    patient_charges.insertId,
                    'Appointment',
                    AppointmentEntity.patient_id,
                    await caseRef.insertId,
                    await HOSChargeAmount.amount,
                    AppointmentEntity.payment_mode,
                    AppointmentEntity.payment_date,
                    AppointmentEntity.Hospital_id,
                    HOStransaction_id,
                    AppointmentEntity.txn_id,
                    AppointmentEntity.pg_ref_id,
                    AppointmentEntity.bank_ref_id,
                    AppointmentEntity.payment_gateway,
                    AppointmentEntity.payment_id,
                    AppointmentEntity.payment_reference_number,
                    'PHR Payment',
                  ],
                );
                transaction_id = await transactions.insertId;
                await this.connection.query(
                  `update patient_charges set transaction_id = ? where id = ?`,
                  [transaction_id, patient_charges.insertId],
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
  appointment_date,
  live_consult,
  payment_mode,Hospital_id,
  hos_visit_id
  ) values (?,?,?,?,?,?,?,?,?)`,
              [
                await opdCreate.insertId,
                await patient_charges.insertId,

                transaction_id,
                '',
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
      appointment_status,
      appointment_status_id,
      case_reference_id,
      visit_details_id,
      date,
      time,
      source,
      live_consult,
      Hospital_id,
      hos_appointment_id,
      amount
      ) values(?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  AppointmentEntity.patient_id,
                  'Requested',
                  1,
                  await caseRef.insertId,
                  await visitInsert.insertId,
                  AppointmentEntity.date,
                  AppointmentEntity.time,

                  'Online',

                  AppointmentEntity.live_consult,
                  AppointmentEntity.Hospital_id,
                  hos_appointment_id,
                  await HOSChargeAmount.amount,
                ],
              );

              await this.connection.query(
                `insert into appointment_queue(
    appointment_id, 
    position,
    date
    ) values (?,?,?)`,
                [bookAppnt.insertId, position, AppointmentEntity.date],
              );
              let payment_type;
              if (
                AppointmentEntity.payment_mode.toLocaleLowerCase() == `cash` ||
                AppointmentEntity.payment_mode.toLocaleLowerCase() ==
                  `offline` ||
                AppointmentEntity.payment_mode.toLocaleLowerCase() == `cheque`
              ) {
                payment_type = `Offline`;
              } else {
                payment_type = AppointmentEntity.payment_mode;
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
      paid_amount,
      payment_mode,
      payment_type,
      transaction_id,
      date) values (?,?,?,?,?,?)`,
                [
                  bookAppnt.insertId,
                  HOSChargeAmount.amount,
                  AppointmentEntity.payment_mode,
                  payment_type,
                  transaction_id,
                  AppointmentEntity.date + ' ' + AppointmentEntity.time,
                ],
              );

              const [getHosName] = await this.connection.query(
                `select * from hospitals where 
  plenome_id = ?`,
                [AppointmentEntity.Hospital_id],
              );
              const HosName = await getHosName.hospital_name;
              const HosAddress = await getHosName.address;

              const reslt = await this.connection.query(
                `select  
                        patients.id,
                        patients.patient_name,patients.gender,patients.age,
                        patients.mobileno,
                        patients.email,
                        patients.ABHA_number,
                        concat(staff.name,"",staff.surname) doctorName,
                        staff.id doctor_id,
                        staff.employee_id,
                        appointment.source,
                        GROUP_CONCAT(specialist.specialist_name) AS specialist_names,
                        concat(CASE 
              WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
              ELSE 'TEMP' 
          END,appointment.id) appointment_id,
                                  concat(CASE 
              WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
              ELSE 'TEMP' 
          END,appointment.hos_appointment_id) hos_appointment_id,
                        DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
                        DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
                        concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
                        appointment_status.status appointment_status,
                        appointment.appointment_status_id,
                        appointment_status.color_code,
                        appointment_queue.position,
                        CASE
                                WHEN appointment.live_consult = 'yes' THEN 'online'
                                ELSE 'offline'
                            END AS consultingType,
                            appointment.message,
                            case 
                  when appointment.doctor is null then
                  patient_charges.temp_standard_charge else
                  patient_charges.standard_charge end consultFees,
                                            case 
                  when appointment.doctor is null then
                  patient_charges.temp_tax else
                  patient_charges.tax end taxPercentage,
                         case 
            when appointment.doctor is null then 
                      format(((patient_charges.temp_standard_charge * patient_charges.temp_tax)/100 ),2) else
  
              format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) end  taxAmount,
                        patient_charges.total netAmount,
                        transactions.id transactionID,
                        transactions.payment_mode,
                        transactions.payment_date,
                        CASE
                                WHEN patient_charges.payment_status = 'paid' THEN 'Payment done'
                                WHEN patient_charges.payment_status = 'partially_paid' and appointment.doctor is null THEN 'Payment done'
                                ELSE 'Need payment' 
                            END AS payment_status
             
                            from appointment
                            left join patients on patients.id = appointment.patient_id
                            left join staff on staff.id = appointment.doctor
                            LEFT JOIN specialist ON 
                            IF(
                                JSON_VALID(staff.specialist) AND JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON)),
                                1,
                                0
                            )
                            left join transactions on transactions.appointment_id = appointment.id
                            LEFT JOIN appointment_status ON appointment_status.id = appointment.appointment_status_id
                            left join doctor_shift on doctor_shift.id = appointment.shift_id
                            left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                            left join patient_charges on patient_charges.opd_id = opd_details.id
                            left join appointment_queue on appointment.id = appointment_queue.appointment_id
                            where appointment.id = ?
                            group by id,patient_name,gender,age,mobileno,email,ABHA_number,doctorName,doctor_id,source,appointment_id,
                            appointmentDate,
                            appointmentTime,
                            slot,
                            appointment_status,
                            appointment_status_id,
                            color_code,
                            position,
                            consultingType,
                            message,
                            consultFees,
                            taxPercentage,
                            taxAmount,
                            netAmount,
                            employee_id,
                            transactionID,
                            payment_mode,
                            payment_date,
                            payment_status `,
                [bookAppnt.insertId],
              );
              reslt[0].hospital_name = HosName;
              reslt[0].hospital_address = HosAddress;
              let opn = await this.convertTo12HourFormat(
                getHosName.hospital_opening_timing,
              );
              let cls = await this.convertTo12HourFormat(
                getHosName.hospital_closing_timing,
              );
              reslt.slot = opn + ' - ' + cls;

              const verifyData = {
                mobilenumber: '91' + reslt[0].mobileno,
                Patname: ' ' + reslt[0].patient_name,
                TempAppNo: 'Appointment Number : ' + reslt[0].appointment_id,
              };

              const emailData = {
                email: reslt[0].email,
                name: ' ' + reslt[0].patient_name,
                HosName: reslt[0].hospital_name,
                date_time:
                  reslt[0].appointmentDate + ' ' + reslt[0].appointmentTime,
                TEM_APP_NO: +reslt[0].appointment_id,
                company: 'PLENOME',
              };

              this.eventEmitter.emit(
                'send-email-sms-temp-appointment-create',
                verifyData,
                emailData,
              );

              return [
                {
                  status: 'success',
                  messege: 'Temprory appointment booked successfully',
                  TransactionId: transaction_id,
                  PaymentMethod: payment_type,
                  inserted_details: reslt,
                },
              ];
            } catch (error) {
              return error;
            }
          }
        } catch (error) {
          return 'error is : ' + error;
        }
      } else {
        return {
          status: 'failed',
          message: 'cannot book duplicate appointment',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'Enter Hospital_id to get the values',
      };
    }
  }

  findAll() {
    return `This action returns all phrAppointment`;
  }

  async findOne(appointment_id: number) {
    if (appointment_id) {
      let hospital_id: number;
      const [adminHosAppt_id] = await this.connection.query(
        `select * from appointment where id = ?`,
        [appointment_id],
      );

      if (adminHosAppt_id) {
        hospital_id = adminHosAppt_id.Hospital_id;
      } else {
        return {
          status: 'failed',
          message: 'No Appointment Found',
        };
      }
      try {
        const [adminHosAppt_id] = await this.connection.query(
          `select * from appointment where id = ?`,
          [appointment_id],
        );

        if (adminHosAppt_id) {
          hospital_id = adminHosAppt_id.Hospital_id;

          const [getHosName] = await this.connection.query(
            `select * from hospitals where plenome_id = ?`,
            [hospital_id],
          );
          const HosName = await getHosName.hospital_name;
          const HosAddress = await getHosName.address;
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          let query = `select  
                      patients.id,
                      appointment.module,
                      patients.patient_name,patients.gender,patients.age,
                      patients.mobileno,
                      patients.email,
                      patients.ABHA_number,
                      concat(staff.name," ",staff.surname) doctorName,
                      staff.id doctor_id,
                          coalesce(visit_details.case_sheet_document,"-")case_sheet_document ,

                      appointment.source,
                      GROUP_CONCAT(specialist.specialist_name) AS specialist_names,
                      concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
                      DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
                      DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
                      concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
                      appointment_status.status appointment_status,
                      appointment.appointment_status_id,
                      appointment_status.color_code,
                      appointment_queue.position,
                      CASE
                              WHEN appointment.live_consult = 'yes' THEN 'online'
                              ELSE 'offline'
                          END AS consultingType,
                          appointment.message,
                          case 
                when appointment.doctor is null then
                patient_charges.temp_standard_charge else
                patient_charges.standard_charge end consultFees,
                                          case 
                when appointment.doctor is null then
                patient_charges.temp_tax else
                patient_charges.tax end taxPercentage,
                patient_charges.additional_charge additional_charge,
                patient_charges.additional_charge_note additional_charge_note,
                patient_charges.discount_percentage discount_percentage,
                patient_charges.discount_amount discount_amount,
                patient_charges.id patientChargeId,
                case 
					      when appointment.doctor is null then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else
                    format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2)
                end taxAmount,
                      patient_charges.total netAmount,
                      patient_charges.discount_percentage,
                      patient_charges.discount_amount,
                      patient_charges.additional_charge,
                      patient_charges.additional_charge_note,
                      transactions.id transactionID,
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
        CONCAT(COALESCE(upi_transaction_id,""),
        COALESCE(net_banking_transaction_id,""),COALESCE(card_transaction_id,""),COALESCE(payment_reference_number,""),COALESCE(cash_transaction_id,"")) payment_transaction_id,

                      CASE
                              WHEN patient_charges.payment_status = 'paid' THEN 'Payment done'
                              WHEN patient_charges.payment_status = 'refunded' THEN 'refunded'
                              WHEN patient_charges.payment_status = 'partially_paid' and appointment.doctor is null THEN 'Payment done'
                              ELSE 'Need payment.' 

                          END AS payment_status
           
                          from appointment
                          left join patients on patients.id = appointment.patient_id
                          left join staff on staff.id = appointment.doctor
                          left join visit_details on visit_details.id = appointment.visit_details_id
                          LEFT JOIN specialist ON 
                          IF(
                              JSON_VALID(staff.specialist) AND JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON)),
                              1,
                              0
                          )
                              left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                          left join patient_charges on patient_charges.opd_id = opd_details.id
                          left join transactions on transactions.id = patient_charges.transaction_id
                          LEFT JOIN appointment_status ON appointment_status.id = appointment.appointment_status_id
                          left join doctor_shift on doctor_shift.id = appointment.shift_id
                          left join appointment_queue on appointment.id = appointment_queue.appointment_id
                          where appointment.id = ?
                          group by id,patient_name,gender,age,mobileno,email,ABHA_number,doctorName,doctor_id,source,appointment_id,
                          appointmentDate,
                          appointmentTime,
                          slot,
                          patient_charges.id,
                          appointment_status,
                          appointment_status_id,
                          color_code,
                          position,
                          case_sheet_document,
                          consultingType,
                          message,
                          consultFees,
                          taxPercentage,
                      discount_percentage,
                      discount_amount,
                      additional_charge,
                      additional_charge_note,
                          taxAmount,
                          netAmount,
                          transactionID,
                          payment_mode,
                          payment_date,
                          payment_status `;
          let values = [adminHosAppt_id.hos_appointment_id];

          const [ans] = await this.dynamicConnection.query(query, values);
          if (!ans.doctor_id) {
            let opn = await this.convertTo12HourFormat(
              getHosName.hospital_opening_timing,
            );
            let cls = await this.convertTo12HourFormat(
              getHosName.hospital_closing_timing,
            );
            ans.slot = opn + ' - ' + cls;
          }
          if (ans.appointment_status_id == 4) {
            const [getCancelledDate] = await this.dynamicConnection.query(
              `select * from appointment_status_tracking where appointment_id = ? and appointment_status_id = 4`,
              [adminHosAppt_id.hos_appointment_id],
            );

            ans.appt_cancelled_date = getCancelledDate.date_updated;
          }
          const [GetPaymentIdFromTrans] = await this.dynamicConnection.query(
            `select * from transactions where id = ?`,
            [ans.transactionID],
          );

          if (GetPaymentIdFromTrans) {
            const [getPlenomeTransacitonId] = await this.connection.query(
              `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
              [hospital_id, ans.transactionID],
            );
            ans.plenome_transaction_id = getPlenomeTransacitonId.id;
            if (GetPaymentIdFromTrans.payment_gateway) {
              try {
                if (
                  GetPaymentIdFromTrans.payment_gateway.toLocaleLowerCase() ==
                  'razorpay'
                ) {
                  const paymentDetails = await razorpay.payments.fetch(
                    GetPaymentIdFromTrans.payment_id,
                  );
                  console.log(paymentDetails, 'paymentDetails');

                  ans.paymentDetails = paymentDetails;
                  const RefundDetails = await razorpay.refunds.all({
                    payment_id: GetPaymentIdFromTrans.payment_id,
                  });
                  console.log(RefundDetails, 'RefundDetails');

                  if (RefundDetails.count > 0) {
                    ans.refundDetails = RefundDetails.items;
                  }
                }
              } catch (error) {
                console.log(error, 'err1');

                return error;
              }
            }
            if (GetPaymentIdFromTrans.temp_appt_payment_gateway) {
              try {
                if (
                  GetPaymentIdFromTrans.temp_appt_payment_gateway.toLocaleLowerCase() ==
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
                console.log(error, 'err11');

                return error;
              }
            }
          }

          if (ans) {
            const [getAdminApptDetails] = await this.connection.query(
              `select * from appointment where id = ?`,
              [appointment_id],
            );
            ans.hospital_name = HosName;
            ans.hospital_address = HosAddress;
            ans.longitude = getHosName.longitude;
            ans.lattitude = getHosName.lattitude;
            ans.phr_doctor = getAdminApptDetails.doctor;
            ans.phr_global_shift_id = getAdminApptDetails.global_shift_id;
            ans.phr_hospital_id = getAdminApptDetails.Hospital_id;
            ans.phr_live_consult = getAdminApptDetails.live_consult;
            ans.phr_shift_id = getAdminApptDetails.shift_id;
            ans.phr_appointment_id = getAdminApptDetails.id;

            return {
              QR_Type: 'Appointment_QR',
              Appointment_details: ans,
            };
          } else {
            return {
              status: 'failed',
              message: 'appointment deleted in hospital',
            };
          }
        } else {
          return {
            status: 'failed',
            message: 'No Appointment Found',
          };
        }
      } catch (error) {
        console.log(error, 'err2');

        return error;
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter appointment_id to get the appointment information',
        },
      ];
    }
  }

  async findOneQR(token: string) {
    if (token) {
      const [getApptDetils] = await this.connection.query(
        ` select hos_appointment_id,Hospital_id,            concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id
            from appointment 
            where id = ?`,
        [token],
      );

      try {
        let query = `select  
            concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) hos_appointment_id,
            patients.id patient_id,
            patients.patient_name,
            patients.mobileno,
            patients.email,
            patients.aayush_unique_id,
            patients.ABHA_number                  
                from appointment
                left join patients on patients.id = appointment.patient_id
                left join appointment_status on appointment_status.id = appointment.appointment_status_id
                left join staff on staff.id = appointment.doctor
                left join transactions on transactions.appointment_id = appointment.id
                left join doctor_shift on doctor_shift.id = appointment.shift_id
                left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                left join patient_charges on patient_charges.opd_id = opd_details.id
                left join appointment_queue on appointment.id = appointment_queue.appointment_id
                
                where appointment.id = ?
            `;
        let values = [getApptDetils.hos_appointment_id];

        let [ans] = await this.dynamicConnection.query(query, values);
        ans.Hospital_id = getApptDetils.Hospital_id;
        ans.appointment_id = await getApptDetils.appointment_id;
        if (ans.aayush_unique_id) {
          ans.aayush_unique_id = ans.aayush_unique_id;
        } else {
          ans.aayush_unique_id = 'NA';
        }
        ans.phr_appointment_id = token;
        return {
          QR_Type_id: 3,
          QR_Type: 'Appointment_QR',
          Appointment_details: ans,
        };
      } catch (error) {
        return [error];
      }
    } else {
      return [
        {
          status: 'failed',
          message: 'Enter appointment_id to get the appointment information',
        },
      ];
    }
  }

  async update(id: number, AppointmentEntity: PhrAppointment) {
    let sendnotification;
    const [getstaff_id] = await this.connection.query(
      `select * from appointment where id = ?`,
      [id],
    );

    const doc_id = getstaff_id.doctor;

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    try {
      if (!AppointmentEntity.txn_id) {
        AppointmentEntity.txn_id = 'NA';
      }
      if (!AppointmentEntity.bank_ref_id) {
        AppointmentEntity.bank_ref_id = 'NA';
      }
      if (!AppointmentEntity.pg_ref_id) {
        AppointmentEntity.pg_ref_id = 'NA';
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
            AppointmentEntity.payment_gateway.toLocaleLowerCase() == 'razorpay'
          ) {
            const [getPaymentGatewayDetails] = await this.connection.query(
              `select * from hospital_payment_gateway_details where hospital_id = ? and payment_gateway = ?`,
              [getstaff_id.Hospital_id, 'razorpay'],
            );

            this.TransferToSubmerchant(
              AppointmentEntity.payment_id,
              getPaymentGatewayDetails,
            );

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

      if (doc_id) {
        if (doc_id == AppointmentEntity.doctor) {
          try {
            const adminVisitDetailsId = await getstaff_id.visit_details_id;
            const [getAdminPatientCharges] = await this.connection.query(
              `select * from visit_details where id = ?`,
              [adminVisitDetailsId],
            );
            const [getAdminAppointQueue] = await this.connection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [id],
            );
            const [getAdminAppointPayment] = await this.connection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [id],
            );
            const [getHosGlobalShiftIdFromAdmin] = await this.connection.query(
              `select * from global_shift where id = ?`,
              [AppointmentEntity.global_shift_id],
            );
            const [getHosShiftIdFromAdmin] = await this.connection.query(
              `select * from doctor_shift where id = ?`,
              [AppointmentEntity.shift_id],
            );
            await this.connection.query(
              `update patient_charges set date= ?
                 where id = ?`,
              [
                AppointmentEntity.date,
                getAdminPatientCharges.patient_charge_id,
              ],
            );

            if (AppointmentEntity.payment_mode) {
              if (
                AppointmentEntity.payment_mode.toLocaleLowerCase() == 'upi' ||
                AppointmentEntity.payment_mode.toLocaleLowerCase() == 'online'
              ) {
                const [getAdminApptDetails] = await this.connection.query(
                  `select * from appointment where id = ?`,
                  [id],
                );
                const [getHosApptDetails] = await this.dynamicConnection.query(
                  `select * from appointment where id = ?`,
                  [getAdminApptDetails.hos_appointment_id],
                );
                const [getTransactionAdmin] = await this.connection.query(
                  `select * from transaction where appointment_id = ? and Hospital_id = ?`,
                  [id, AppointmentEntity.Hospital_id],
                );
                if (getTransactionAdmin) {
                  await this.connection.query(
                    `update transactions set payment_gateway = ?,received_by_name = ?,
                            payment_id = ?, payment_reference_number = ? where id = ?`,
                    [
                      AppointmentEntity.payment_gateway,
                      'PHR Payment',
                      AppointmentEntity.payment_id,
                      AppointmentEntity.payment_reference_number,
                      getTransactionAdmin.id,
                    ],
                  );
                  await this.dynamicConnection.query(
                    `update transactions set payment_gateway = ?,received_by_name = ?,
                              payment_id = ?, payment_reference_number = ? where id = ?`,
                    [
                      AppointmentEntity.payment_gateway,
                      'PHR Payment',
                      AppointmentEntity.payment_id,
                      AppointmentEntity.payment_reference_number,
                      getTransactionAdmin.hos_transaction_id,
                    ],
                  );
                  const [getPatChargeDetailsAdmin] =
                    await this.connection.query(
                      `select * from patient_charges where id = ?`,
                      [getAdminPatientCharges.patient_charge_id],
                    );
                  let payment_nilamai;
                  if (
                    getPatChargeDetailsAdmin.payment_status == 'partially_paid'
                  ) {
                    payment_nilamai = getPatChargeDetailsAdmin.payment_status;
                  } else if (
                    getPatChargeDetailsAdmin.payment_status == 'unpaid'
                  ) {
                    if (AppointmentEntity.doctor) {
                      payment_nilamai = 'paid';
                    } else {
                      payment_nilamai = 'partially_paid';
                    }
                  }
                  await this.connection.query(
                    `update patient_charges set payment_status = ? where id = ?`,
                    [payment_nilamai, getPatChargeDetailsAdmin.id],
                  );
                  await this.dynamicConnection.query(
                    `update patient_charges set payment_status = ? where id = ?`,
                    [
                      payment_nilamai,
                      getPatChargeDetailsAdmin.hos_patient_charges_id,
                    ],
                  );
                } else {
                  const [getPatChargeDetailsAdmin] =
                    await this.connection.query(
                      `select * from patient_charges where id = ?`,
                      [getAdminPatientCharges.patient_charge_id],
                    );
                  const [getPatChargeDetailsHos] =
                    await this.dynamicConnection.query(
                      `select * from patient_charges where id = ?`,
                      [getAdminPatientCharges.hos_patient_charges_id],
                    );

                  let payment_nilamai;
                  let thogai;
                  if (
                    getPatChargeDetailsAdmin.payment_status == 'partially_paid'
                  ) {
                    payment_nilamai = getPatChargeDetailsAdmin.payment_status;
                    thogai = getPatChargeDetailsAdmin.temp_amount;
                  } else if (
                    getPatChargeDetailsAdmin.payment_status == 'unpaid'
                  ) {
                    if (AppointmentEntity.doctor) {
                      payment_nilamai = 'paid';
                      thogai = getPatChargeDetailsAdmin.amount;
                    } else {
                      payment_nilamai = 'partially_paid';
                      thogai = getPatChargeDetailsAdmin.temp_amount;
                    }
                  }
                  await this.connection.query(
                    `
                            insert into transactions (
                              type,
                              patient_charges_id,
                              section,
                              patient_id,
                              case_reference_id,
                              amount,
                              payment_mode,
                              payment_date,txn_id,pg_ref_id,bank_ref_id,
                              payment_gateway,
                            payment_id,
                            payment_reference_number,
                            received_by_name
                              ) values
                              (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                      'payment',
                      getPatChargeDetailsAdmin.id,
                      'Appointment',
                      getPatChargeDetailsAdmin.patient_id,
                      getAdminApptDetails.case_reference_id,
                      thogai,
                      AppointmentEntity.payment_mode,
                      AppointmentEntity.payment_date,
                      AppointmentEntity.txn_id,
                      AppointmentEntity.pg_ref_id,
                      AppointmentEntity.bank_ref_id,
                      AppointmentEntity.payment_gateway,
                      AppointmentEntity.payment_id,
                      AppointmentEntity.payment_reference_number,
                      'PHR payment',
                    ],
                  );
                  await this.dynamicConnection.query(
                    `
                                            insert into transactions (
                                              type,
                                              patient_charges_id,
                                              section,
                                              patient_id,
                                              case_reference_id,
                                              amount,
                                              payment_mode,
                                              payment_date,txn_id,pg_ref_id,bank_ref_id,
                                              payment_gateway,
                                            payment_id,
                                            payment_reference_number,
                                            received_by_name
                                              ) values
                                              (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                      'payment',
                      getPatChargeDetailsHos.id,
                      'Appointment',
                      getPatChargeDetailsHos.patient_id,
                      getHosApptDetails.case_reference_id,
                      thogai,
                      AppointmentEntity.payment_mode,
                      AppointmentEntity.payment_date,
                      AppointmentEntity.txn_id,
                      AppointmentEntity.pg_ref_id,
                      AppointmentEntity.bank_ref_id,
                      AppointmentEntity.payment_gateway,
                      AppointmentEntity.payment_id,
                      AppointmentEntity.payment_reference_number,
                      'PHR payment',
                    ],
                  );
                  await this.connection.query(
                    `update patient_charges set payment_status = ? where id = ?`,
                    [payment_nilamai, getPatChargeDetailsAdmin.id],
                  );
                  await this.dynamicConnection.query(
                    `update patient_charges set payment_status = ? where id = ?`,
                    [
                      payment_nilamai,
                      getPatChargeDetailsAdmin.hos_patient_charges_id,
                    ],
                  );
                }
              }
            }

            await this.connection.query(
              `update visit_details set appointment_date = ?,
                live_consult = ? where id = ?`,
              [
                AppointmentEntity.date + ' ' + AppointmentEntity.time,
                AppointmentEntity.live_consult,
                adminVisitDetailsId,
              ],
            );
            await this.connection.query(
              `update appointment set date = ?,time = ?,
                global_shift_id = ?,shift_id = ?,live_consult = ? where id = ?`,
              [
                AppointmentEntity.date,
                AppointmentEntity.time,
                AppointmentEntity.global_shift_id,
                AppointmentEntity.shift_id,
                AppointmentEntity.live_consult,
                id,
              ],
            );

            let position;

            if (AppointmentEntity.date != formattedDate) {
              position = null;
              sendnotification = 1;
              try {
                await this.connection.query(
                  `update appointment_queue set shift_id = ?,
                    date = ?,position = ?
                  where id = ?`,
                  [
                    AppointmentEntity.shift_id,
                    AppointmentEntity.date,
                    position,
                    getAdminAppointQueue.id,
                  ],
                );
              } catch (error) {
                return error;
              }
            } else {
              const [checkPreviousToken] = await this.connection.query(
                `select * from appointment_queue where id = ?`,
                [getAdminAppointQueue.id],
              );
              if (
                checkPreviousToken.position &&
                checkPreviousToken.staff_id == AppointmentEntity.doctor &&
                checkPreviousToken.shift_id == AppointmentEntity.shift_id &&
                checkPreviousToken.date == AppointmentEntity.date
              ) {
                position = checkPreviousToken.token;
                await this.connection.query(
                  `update appointment_queue set shift_id = ?,date = ?,position = ? 
                        where id = ?`,
                  [
                    AppointmentEntity.shift_id,
                    AppointmentEntity.date,
                    position,
                    getAdminAppointQueue.id,
                  ],
                );
              } else {
                sendnotification = 1;
                const [getlastpsn] = await this.dynamicConnection.query(
                  `SELECT * FROM appointment_queue
                    where staff_id = ? 
                 and date = ? and shift_id = ? order by position desc limit  1 `,
                  [
                    AppointmentEntity.doctor,
                    AppointmentEntity.date,
                    AppointmentEntity.shift_id,
                  ],
                );
                if (getlastpsn) {
                  position = getlastpsn.position + 1;
                } else {
                  position = 1;
                }
                await this.connection.query(
                  `update appointment_queue set shift_id = ?,date = ?,position = ? 
                  where id = ?`,
                  [
                    AppointmentEntity.shift_id,
                    AppointmentEntity.date,
                    position,
                    getAdminAppointQueue.id,
                  ],
                );
              }
            }

            await this.connection.query(
              `update appointment_payment set date = ? where id = ?`,
              [AppointmentEntity.date, getAdminAppointPayment.id],
            );

            // #######################################################################################################################
            const HosAppointmentId = await getstaff_id.hos_appointment_id;
            const [HosAppoitnDetails] = await this.dynamicConnection.query(
              `select * from appointment where id = ?`,
              [HosAppointmentId],
            );
            const HosVisitDetailsId = await HosAppoitnDetails.visit_details_id;
            const [HosPatientChargeId] = await this.dynamicConnection.query(
              `select * from visit_details where id = ?`,
              [HosVisitDetailsId],
            );
            const [HosAppointmentQueue] = await this.dynamicConnection.query(
              `select * from appointment_queue where appointment_id = ?`,
              [HosAppointmentId],
            );
            const [HosAppointmentPayment] = await this.dynamicConnection.query(
              `select * from appointment_payment where appointment_id = ?`,
              [HosAppointmentId],
            );
            await this.dynamicConnection.query(
              `update patient_charges set date= ?
                 where id = ?`,
              [AppointmentEntity.date, HosPatientChargeId.patient_charge_id],
            );
            await this.dynamicConnection.query(
              `update visit_details set appointment_date = ?,
                live_consult = ? where id = ?`,
              [
                AppointmentEntity.date + ' ' + AppointmentEntity.time,
                AppointmentEntity.live_consult,
                HosVisitDetailsId,
              ],
            );
            await this.dynamicConnection.query(
              `update appointment set date = ?,time = ?,
                global_shift_id = ?,shift_id = ?,live_consult = ? where id = ?`,
              [
                AppointmentEntity.date,
                AppointmentEntity.time,
                getHosGlobalShiftIdFromAdmin.hospital_global_shift_id,
                getHosShiftIdFromAdmin.hospital_doctor_shift_id,
                AppointmentEntity.live_consult,
                HosAppointmentId,
              ],
            );

            if (AppointmentEntity.date != formattedDate) {
              position = null;
              await this.dynamicConnection.query(
                `update appointment_queue set 
                  shift_id = ?,date = ?,position = ?
                 where id = ?`,
                [
                  getHosShiftIdFromAdmin.hospital_doctor_shift_id,
                  AppointmentEntity.date,
                  position,
                  HosAppointmentQueue.id,
                ],
              );
            } else {
              await this.dynamicConnection.query(
                `update appointment_queue set shift_id = ?,date = ?,position = ? 
                  where id = ?`,
                [
                  getHosShiftIdFromAdmin.hospital_doctor_shift_id,
                  AppointmentEntity.date,
                  position,
                  HosAppointmentQueue.id,
                ],
              );
            }

            await this.dynamicConnection.query(
              `update appointment_payment set date = ? where id = ?`,
              [AppointmentEntity.date, HosAppointmentPayment.id],
            );

            const [getHosName] = await this.connection.query(
              `select * from hospitals where plenome_id = ?`,
              [getstaff_id.Hospital_id],
            );
            const HosName = await getHosName.hospital_name;
            const HosAddress = await getHosName.address;

            const reslt = await this.connection.query(
              `select  
                                      patients.id,
                                      patients.patient_name,patients.gender,patients.age,
                                      patients.mobileno,
                                      patients.email,
                                      patients.ABHA_number,
                                      concat(staff.name,"",staff.surname) doctorName,
                                      staff.id doctor_id,
                                      staff.employee_id,
                                      appointment.source,
                                      GROUP_CONCAT(specialist.specialist_name) AS specialist_names,
                                      concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
        concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.hos_appointment_id) hos_appointment_id,
                                      DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
                                      DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
                                      concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
                                      appointment_status.status appointment_status,
                                      appointment.appointment_status_id,
                                      appointment_status.color_code,
                                      appointment_queue.position,
                                      CASE
                                              WHEN appointment.live_consult = 'yes' THEN 'online'
                                              ELSE 'offline'
                                          END AS consultingType,
                                          appointment.message,
                                          case 
                                when appointment.doctor is null then
                                patient_charges.temp_standard_charge else
                                patient_charges.standard_charge end consultFees,
                                                          case 
                                when appointment.doctor is null then
                                patient_charges.temp_tax else
                                patient_charges.tax end taxPercentage,
                                       case 
                          when appointment.doctor is null then 
                                    format(((patient_charges.temp_standard_charge * patient_charges.temp_tax)/100 ),2) else
                
                            format(((patient_charges.standard_charge * patient_charges.tax)/100 ),2) end  taxAmount,
                                      patient_charges.total netAmount,
                                      transactions.id transactionID,
                                      transactions.payment_mode,
                                      transactions.payment_date,
                                      CASE
                                              WHEN patient_charges.payment_status = 'paid' THEN 'Payment done'
                                              ELSE 'Need payment' 
                                          END AS payment_status
                           
                                          from appointment
                                          left join patients on patients.id = appointment.patient_id
                                          left join staff on staff.id = appointment.doctor
                                          LEFT JOIN specialist ON 
                                          IF(
                                              JSON_VALID(staff.specialist) AND JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON)),
                                              1,
                                              0
                                          )
                                          left join transactions on transactions.appointment_id = appointment.id
                                          LEFT JOIN appointment_status ON appointment_status.id = appointment.appointment_status_id
                                          left join doctor_shift on doctor_shift.id = appointment.shift_id
                                          left join opd_details on opd_details.case_reference_id = appointment.case_reference_id
                                          left join patient_charges on patient_charges.opd_id = opd_details.id
                                          left join appointment_queue on appointment.id = appointment_queue.appointment_id
                                          where appointment.id = ?
                                          group by id,patient_name,gender,age,mobileno,email,ABHA_number,doctorName,doctor_id,source,appointment_id,
                                          appointmentDate,
                                          appointmentTime,
                                          slot,
                                          employee_id,
                                          appointment_status,
                                          appointment_status_id,
                                          color_code,
                                          position,
                                          consultingType,
                                          message,
                                          consultFees,
                                          taxPercentage,
                                          taxAmount,
                                          netAmount,
                                          transactionID,
                                          payment_mode,
                                          payment_date,
                                          payment_status `,
              [id],
            );
            reslt[0].hospital_name = HosName;
            reslt[0].hospital_address = HosAddress;
            if (sendnotification == 1) {
              const verifyData = {
                mobilenumber: '91' + reslt[0].mobileno,
                patname: ' ' + reslt[0].patient_name,
                date: reslt[0].appointmentDate,
                doctor: reslt[0].doctorName,
              };

              const emailData = {
                email: reslt[0].email,
                name: ' ' + reslt[0].patient_name,
                drname: 'Dr.' + reslt[0].doctorName,
                date: reslt[0].appointmentDate,
                time: reslt[0].appointmentTime,
                HosName: reslt[0].hospital_name,
                location: reslt[0].hospital_address,
              };

              this.eventEmitter.emit(
                'send-email-sms-appointment-update',
                verifyData,
                emailData,
              );
            }
            return [
              {
                status: 'success',
                messege: 'Appointment updated successfully',
                updated_value: reslt,
              },
            ];
          } catch (error) {
            return 'error is : ' + error;
          }
        } else {
          return {
            status: 'failed',
            message: 'cannot change doctor.',
          };
        }
      } else {
        if (AppointmentEntity.doctor) {
          return {
            status: 'failed',
            message: 'cannot add doctor for temp Appointment.',
          };
        } else {
          const adminVisitDetailsId = await getstaff_id.visit_details_id;
          const [getAdminPatientCharges] = await this.connection.query(
            `select * from visit_details where id = ?`,
            [adminVisitDetailsId],
          );
          const [getAdminAppointQueue] = await this.connection.query(
            `select * from appointment_queue where appointment_id = ?`,
            [id],
          );
          const [getAdminAppointPayment] = await this.connection.query(
            `select * from appointment_payment where appointment_id = ?`,
            [id],
          );
          await this.connection.query(
            `update patient_charges 
                set date = ? where id = ?`,
            [AppointmentEntity.date, getAdminPatientCharges.patient_charge_id],
          );
          if (AppointmentEntity.payment_mode) {
            if (
              AppointmentEntity.payment_mode.toLocaleLowerCase() == 'upi' ||
              AppointmentEntity.payment_mode.toLocaleLowerCase() == 'online'
            ) {
              const [getAdminApptDetails] = await this.connection.query(
                `select * from appointment where id = ?`,
                [id],
              );
              const [getHosApptDetails] = await this.dynamicConnection.query(
                `select * from appointment where id = ?`,
                [getAdminApptDetails.hos_appointment_id],
              );
              const [getTransactionAdmin] = await this.connection.query(
                `select * from transaction where appointment_id = ? and Hospital_id = ?`,
                [id, AppointmentEntity.Hospital_id],
              );
              if (getTransactionAdmin) {
                await this.connection.query(
                  `update transactions set payment_gateway = ?,received_by_name = ?,
                      payment_id = ?, payment_reference_number = ? where id = ?`,
                  [
                    'PHR Payment',
                    AppointmentEntity.payment_id,
                    AppointmentEntity.payment_reference_number,
                    getTransactionAdmin.id,
                  ],
                );
                await this.dynamicConnection.query(
                  `update transactions set payment_gateway = ?,received_by_name = ?,
                        payment_id = ?, payment_reference_number = ? where id = ?`,
                  [
                    'PHR Payment',
                    AppointmentEntity.payment_id,
                    AppointmentEntity.payment_reference_number,
                    getTransactionAdmin.hos_transaction_id,
                  ],
                );
                const [getPatChargeDetailsAdmin] = await this.connection.query(
                  `select * from patient_charges where id = ?`,
                  [getAdminPatientCharges.patient_charge_id],
                );
                let payment_nilamai;
                if (
                  getPatChargeDetailsAdmin.payment_status == 'partially_paid'
                ) {
                  payment_nilamai = getPatChargeDetailsAdmin.payment_status;
                } else if (
                  getPatChargeDetailsAdmin.payment_status == 'unpaid'
                ) {
                  if (AppointmentEntity.doctor) {
                    payment_nilamai = 'paid';
                  } else {
                    payment_nilamai = 'partially_paid';
                  }
                }
                await this.connection.query(
                  `update patient_charges set payment_status = ? where id = ?`,
                  [payment_nilamai, getPatChargeDetailsAdmin.id],
                );
                await this.dynamicConnection.query(
                  `update patient_charges set payment_status = ? where id = ?`,
                  [
                    payment_nilamai,
                    getPatChargeDetailsAdmin.hos_patient_charges_id,
                  ],
                );
              } else {
                const [getPatChargeDetailsAdmin] = await this.connection.query(
                  `select * from patient_charges where id = ?`,
                  [getAdminPatientCharges.patient_charge_id],
                );
                const [getPatChargeDetailsHos] =
                  await this.dynamicConnection.query(
                    `select * from patient_charges where id = ?`,
                    [getAdminPatientCharges.hos_patient_charges_id],
                  );

                let payment_nilamai;
                let thogai;
                if (
                  getPatChargeDetailsAdmin.payment_status == 'partially_paid'
                ) {
                  payment_nilamai = getPatChargeDetailsAdmin.payment_status;
                  thogai = getPatChargeDetailsAdmin.temp_amount;
                } else if (
                  getPatChargeDetailsAdmin.payment_status == 'unpaid'
                ) {
                  if (AppointmentEntity.doctor) {
                    payment_nilamai = 'paid';
                    thogai = getPatChargeDetailsAdmin.amount;
                  } else {
                    payment_nilamai = 'partially_paid';
                    thogai = getPatChargeDetailsAdmin.temp_amount;
                  }
                }
                await this.connection.query(
                  `
                      insert into transactions (
                        type,
                        patient_charges_id,
                        section,
                        patient_id,
                        case_reference_id,
                        temp_appt_amount,
                        payment_mode,
                        payment_date,txn_id,pg_ref_id,bank_ref_id,
                        temp_appt_payment_gateway,
                      temp_appt_payment_id,
                      temp_appt_payment_reference_number,
                      received_by_name
                        ) values
                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [
                    'payment',
                    getPatChargeDetailsAdmin.id,
                    'Appointment',
                    getPatChargeDetailsAdmin.patient_id,
                    getAdminApptDetails.case_reference_id,
                    thogai,
                    AppointmentEntity.payment_mode,
                    AppointmentEntity.payment_date,
                    AppointmentEntity.txn_id,
                    AppointmentEntity.pg_ref_id,
                    AppointmentEntity.bank_ref_id,
                    AppointmentEntity.payment_gateway,
                    AppointmentEntity.payment_id,
                    AppointmentEntity.payment_reference_number,
                    'PHR payment',
                  ],
                );
                await this.dynamicConnection.query(
                  `
                                      insert into transactions (
                                        type,
                                        patient_charges_id,
                                        section,
                                        patient_id,
                                        case_reference_id,
                                        temp_appt_amount,
                                        payment_mode,
                                        payment_date,txn_id,pg_ref_id,bank_ref_id,
                                        temp_appt_payment_gateway,
                                      temp_appt_payment_id,
                                      temp_appt_payment_reference_number,
                                      received_by_name
                                        ) values
                                        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [
                    'payment',
                    getPatChargeDetailsHos.id,
                    'Appointment',
                    getPatChargeDetailsHos.patient_id,
                    getHosApptDetails.case_reference_id,
                    thogai,
                    AppointmentEntity.payment_mode,
                    AppointmentEntity.payment_date,
                    AppointmentEntity.txn_id,
                    AppointmentEntity.pg_ref_id,
                    AppointmentEntity.bank_ref_id,
                    AppointmentEntity.payment_gateway,
                    AppointmentEntity.payment_id,
                    AppointmentEntity.payment_reference_number,
                    'PHR payment',
                  ],
                );
                await this.connection.query(
                  `update patient_charges set payment_status = ? where id = ?`,
                  [payment_nilamai, getPatChargeDetailsAdmin.id],
                );
                await this.dynamicConnection.query(
                  `update patient_charges set payment_status = ? where id = ?`,
                  [
                    payment_nilamai,
                    getPatChargeDetailsAdmin.hos_patient_charges_id,
                  ],
                );
              }
            }
          }

          await this.connection.query(
            `update visit_details set 
                appointment_date = ? , live_consult = ? where id = ?`,
            [
              AppointmentEntity.date + ' ' + AppointmentEntity.time,
              AppointmentEntity.live_consult,
              adminVisitDetailsId,
            ],
          );
          await this.connection.query(
            `update appointment set date = ?,time = ?,
                live_consult = ? where id = ?`,
            [
              AppointmentEntity.date,
              AppointmentEntity.time,
              AppointmentEntity.live_consult,
              id,
            ],
          );
          await this.connection.query(
            `update appointment_queue set date = ?
                 where id = ?`,
            [AppointmentEntity.date, getAdminAppointQueue.id],
          );
          await this.connection.query(
            `update appointment_payment set date = ? where id = ?`,
            [AppointmentEntity.date, getAdminAppointPayment.id],
          );
          // ################################################################################################################
          const HosAppointmentId = await getstaff_id.hos_appointment_id;
          const [HosAppoitnDetails] = await this.dynamicConnection.query(
            `select * from appointment where id = ?`,
            [HosAppointmentId],
          );
          const HosVisitDetailsId = await HosAppoitnDetails.visit_details_id;
          const HosPatientChargeId = await this.dynamicConnection.query(
            `select * from visit_details where id = ?`,
            [HosVisitDetailsId],
          );
          const HosAppointmentQueue = await this.dynamicConnection.query(
            `select * from appointment_queue where appointment_id = ?`,
            [HosAppointmentId],
          );
          const HosAppointmentPayment = await this.dynamicConnection.query(
            `select * from appointment_payment where appointment_id = ?`,
            [HosAppointmentId],
          );

          await this.dynamicConnection.query(
            `update patient_charges set date= ?
                 where id = ?`,
            [AppointmentEntity.date, HosPatientChargeId.patient_charge_id],
          );

          await this.dynamicConnection.query(
            `update visit_details set appointment_date = ?,
                live_consult = ? where id = ?`,
            [
              AppointmentEntity.date + ' ' + AppointmentEntity.time,
              AppointmentEntity.live_consult,
              HosVisitDetailsId,
            ],
          );

          await this.dynamicConnection.query(
            `update appointment set date = ?,time = ?,
                live_consult = ? where id = ?`,
            [
              AppointmentEntity.date,
              AppointmentEntity.time,
              AppointmentEntity.live_consult,
              HosAppointmentId,
            ],
          );

          await this.dynamicConnection.query(
            `update appointment_queue set date = ?
                 where id = ?`,
            [AppointmentEntity.date, HosAppointmentQueue.id],
          );

          await this.dynamicConnection.query(
            `update appointment_payment set date = ? where id = ?`,
            [AppointmentEntity.date, HosAppointmentPayment.id],
          );

          const [getHosName] = await this.connection.query(
            `select * from hospitals where plenome_id = ?`,
            [getstaff_id.Hospital_id],
          );
          const HosName = await getHosName.hospital_name;
          const HosAddress = await getHosName.address;

          const reslt = await this.connection.query(
            `select  
                patients.id,
                patients.patient_name,patients.gender,patients.age,
                patients.mobileno,
                patients.email,
                patients.ABHA_number,
                concat(staff.name,"",staff.surname) doctorName,
                staff.id doctor_id,
                staff.employee_id,
                appointment.source,
                concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
                concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.hos_appointment_id) hos_appointment_id,
                
                DATE_FORMAT(appointment.date, '%D %b %Y') appointmentDate,
                DATE_FORMAT(appointment.time, '%h:%i %p') appointmentTime,
                concat(DATE_FORMAT(doctor_shift.start_time, '%h:%i %p')," - ",DATE_FORMAT(doctor_shift.end_time, '%h:%i %p')) slot,
                appointment_status.status appointment_status,
                appointment_status.color_code,
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
                  WHEN transactions.id THEN 'Payment done'
                  ELSE 'Need payment' 
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
                where appointment.id = ?`,
            [id],
          );
          reslt[0].hospital_name = HosName;
          reslt[0].hospital_address = HosAddress;

          const verifyData = {
            mobilenumber: '91' + reslt[0].mobileno,
            patname: ' ' + reslt[0].patient_name,
            date: reslt[0].appointmentDate,
            doctor: reslt[0].doctorName,
          };

          const emailData = {
            email: reslt[0].email,
            name: ' ' + reslt[0].patient_name,
            drname: 'Dr.' + reslt[0].doctorName,
            date: reslt[0].appointmentDate,
            time: reslt[0].appointmentTime,
            HosName: reslt[0].hospital_name,
            location: reslt[0].hospital_address,
          };
          this.eventEmitter.emit(
            'send-email-sms-appointment-update',
            verifyData,
            emailData,
          );
          return [
            {
              status: 'success',
              messege: 'Appointment updated successfully',
              updated_value: reslt,
            },
          ];
        }
      }
    } catch (error) {
      return {
        status: 'failed',
        message: 'unable to update appointment',
        error: error,
      };
    }
  }

  async remove(id: number) {
    const [getHosAppt_id] = await this.connection.query(
      `select Hospital_id,hos_appointment_id,visit_details_id from appointment where id = ?`,
      [id],
    );

    try {
      const [getAppt_details] = await this.dynamicConnection.query(
        ` select visit_details_id,
            case_reference_id from appointment where id = ? `,
        [getHosAppt_id.hos_appointment_id],
      );
      if (getAppt_details) {
        const [getOpd_id] = await this.dynamicConnection.query(
          `select opd_details_id 
  from visit_details where id = ?`,
          [getAppt_details.visit_details_id],
        );
        await this.dynamicConnection.query(
          `delete from 
  opd_details where id = ?`,
          [getOpd_id.id],
        );
        await this.dynamicConnection.query(
          `delete from appointment where id = ?`,
          [getHosAppt_id.hos_appointment_id],
        );
      }
      await this.connection.query(`select id from visit_details where id = ?`, [
        getHosAppt_id.visit_details_id,
      ]);
      await this.connection.query(
        'update appointment set is_deleted = 1 WHERE id = ?',
        [id],
      );
      return `appointment of id : ${id}  is deleted. `;
    } catch (error) {
      return error;
    }
  }
  async updateCancelApp(id: number, AppointmentEntity: PhrAppointment) {
    try {
      const [getAppntDetails] = await this.connection.query(
        `select * from appointment where id = ?`,
        [id],
      );
      const hosApptId = getAppntDetails.hos_appointment_id;
      const [getTransactionIdUsingApptNo] = await this.dynamicConnection.query(
        `select * from transactions where appointment_id = ?`,
        [hosApptId],
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
            const [getTransactionIdUsingApptNoADMIN] =
              await this.connection.query(
                `select * from transactions where appointment_id = ?`,
                [id],
              );

            const [getPatientChargesDetailsADMIN] = await this.connection.query(
              `select * from patient_charges where transaction_id = ?`,
              [getTransactionIdUsingApptNoADMIN.id],
            );

            // this.RefundApptCharge(getTransactionIdUsingApptNo.payment_id, getPatientChargesDetails.id, getPatientChargesDetailsADMIN.id)
          }
        }
        if (getTransactionIdUsingApptNo.temp_appt_payment_gateway) {
          if (
            getTransactionIdUsingApptNo.temp_appt_payment_gateway.toLocaleLowerCase() ==
            'razorpay'
          ) {
            // this.RefundTempApptCharge(getTransactionIdUsingApptNo.temp_appt_payment_id)
          }
        }
      }
      await this.dynamicConnection.query(
        `update appointment set 
appointment_status = ? ,appointment_status_id = ?, appointment_cancellation_reason = ?
where id = ?`,
        [
          'Cancelled',
          4,
          AppointmentEntity.appointment_cancellation_reason,
          hosApptId,
        ],
      );

      await this.connection.query(
        `update appointment set 
  appointment_status = ?, appointment_status_id = ?,appointment_cancellation_reason = ?
  where id = ?`,
        ['Cancelled', 4, AppointmentEntity.appointment_cancellation_reason, id],
      );
      const [getHosName] = await this.connection.query(
        `select * from hospitals where plenome_id = ?`,
        [getAppntDetails.Hospital_id],
      );
      const HosName = await getHosName.hospital_name;
      const HosAddress = await getHosName.address;

      const reslt = await this.connection.query(
        `select  
patients.id,
patients.patient_name,patients.gender,patients.age,
patients.mobileno,
patients.email,
patients.ABHA_number,
concat(staff.name,"",staff.surname) doctorName,
staff.id doctor_id,
staff.employee_id,
appointment.source,
concat(CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END,appointment.id) appointment_id,
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
WHEN transactions.id THEN 'Payment done'
ELSE 'Need payment' 
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
        [id],
      );
      reslt[0].hospital_name = HosName;
      reslt[0].hospital_address = HosAddress;

      const verifyData = {
        mobileNumber: '91' + reslt[0].mobileno,
        name: ' ' + reslt[0].patient_name,
        date: reslt[0].appointmentDate + ' With ' + reslt[0].doctorName,
        reason: AppointmentEntity.appointment_cancellation_reason,
      };

      const emailData = {
        email: reslt[0].email,
        name: ' ' + reslt[0].patient_name,
        date: reslt[0].appointmentDate,
        reason: AppointmentEntity.appointment_cancellation_reason,
      };
      this.eventEmitter.emit(
        'send-email-sms-appointment-cancel',
        verifyData,
        emailData,
      );

      return [
        {
          status: 'success',
          messege: 'Appointment cancelled successfully',
          inserted_details: reslt,
        },
      ];
    } catch (error) {
      return 'error is : ' + error;
    }
  }
}
