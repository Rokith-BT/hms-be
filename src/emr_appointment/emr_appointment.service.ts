import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { EmrAppointment } from "./entities/emr_appointment.entity";
import { FaceAuthService } from "src/face-auth/face-auth.service";

@Injectable()
export class EmrAppointmentService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
        @Inject(forwardRef(() => FaceAuthService))
        private readonly addAppointmentService: FaceAuthService,) { }

  async create(AppointmentEntity: EmrAppointment) {
    try {
      if (AppointmentEntity.payment_mode.toLocaleLowerCase() != "cash" && AppointmentEntity.payment_mode.toLocaleLowerCase() != "cheque" && AppointmentEntity.payment_mode.toLocaleLowerCase() != "offline" && AppointmentEntity.payment_mode.toLocaleLowerCase() != "paylater") {
        if (!AppointmentEntity.payment_gateway) {
          return {
            "status": "failed",
            "message": "enter payment gateway to book appointment"
          }

        }
        if (AppointmentEntity.payment_gateway.toLocaleLowerCase() == 'razorpay') {
          if (!AppointmentEntity.payment_reference_number || !AppointmentEntity.payment_id) {
            if (!AppointmentEntity.payment_reference_number) {
              AppointmentEntity.payment_reference_number = 'NA'
            }
            if (!AppointmentEntity.payment_id) {
              AppointmentEntity.payment_id = 'NA'
            }
            return {
              "status": "failed",
              "message": "enter the payment reference number and payment_id received from razorpay for booking appointment"
            }
          }
        }
      }
      const currentdate = new Date;
      const formattedDate = currentdate.toISOString().split('T')[0];
      let position;


      const HOSpatient = await this.connection.query('select * from patients where id =?', [AppointmentEntity.patient_id])

      let HOspatientmobileno = HOSpatient[0].mobileno

      let HOSTrimmedmobileno;
      console.log(HOspatientmobileno.length, "rrrrrrrr")

      if (HOspatientmobileno.length > 10) {
        console.log("entering_mobile_no_if")

        HOSTrimmedmobileno = HOspatientmobileno.startsWith('91') ? HOspatientmobileno.slice(2) : HOspatientmobileno;
        console.log(HOspatientmobileno, "HOS", HOSTrimmedmobileno);
      }

      else {
        console.log("entering_mobile_no_if")

        HOSTrimmedmobileno = HOspatientmobileno;
      }
      const patientInHos = await this.dynamicConnection.query('select patients.id from patients where patients.mobileno = ? or patients.mobileno = ?', [
        HOspatientmobileno, HOSTrimmedmobileno
      ])
      let HOSpatientId;
      if (patientInHos[0]) {
        HOSpatientId = patientInHos[0].id
      } else {
                              let faceID = null;
        if (HOSpatient[0].image && HOSpatient[0].image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(HOSpatient[0].image)
          faceID = getFaceId?.faceID
        }
        const createpatient = await this.dynamicConnection.query(`insert into patients  (
    patient_name,
    dob,
    image,
    faceId,
    mobileno,
    email,
    gender,
    address,
    ABHA_number,
    abha_address
    )
    values(?,?,?,?,?,?,?,?,?,?)`, [
          HOSpatient[0].patient_name,
          HOSpatient[0].dob,
          HOSpatient[0].image,
          faceID,
          HOSpatient[0].mobileno,
          HOSpatient[0].email,
          HOSpatient[0].gender,
          HOSpatient[0].address,
          HOSpatient[0].ABHA_number,
          HOSpatient[0].abha_address
        ])
        HOSpatientId = createpatient.insertId
        console.log(HOSpatientId, "==--==--");


      }
      const [staffEmailInHOS] = await this.connection.query(`select email from staff where id = ?`, [AppointmentEntity.doctor])

      const [adminStaff] = await this.dynamicConnection.query(`select id from staff where email = ?`, [staffEmailInHOS.email])
      let adminStaffId = adminStaff.id




      let payment_type;
      if (AppointmentEntity.payment_mode === `cash`) {
        payment_type = `Offline`
      }
      else {
        payment_type = `UPI`
      }

      console.log("tttt");

      const [check_duplicate] = await this.connection.query(`select * from appointment 
       where patient_id = ? and doctor = ? and shift_id = ? and date = ? and appointment_status_id <> 4`, [
        AppointmentEntity.patient_id,
        AppointmentEntity.doctor,
        AppointmentEntity.shift_id,
        AppointmentEntity.date

      ])
      if (!check_duplicate) {
        let HOStransaction_id: number
        const HOScaseRef = await this.connection.query('INSERT INTO case_references values(default,default)')
        console.log("rrrr", HOScaseRef);

        const HOSopdCreate = await this.connection.query(`
  insert into opd_details (case_reference_id,patient_id) values (?,?)`, [
          HOScaseRef.insertId,
          AppointmentEntity.patient_id
        ])
        const HOScharge = await this.connection.query('select charge_id from shift_details where shift_details.staff_id = ?',
          [AppointmentEntity.doctor])
        let HOScharge_id = HOScharge[0].charge_id
        const HOSamount = await this.connection.query(`  select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
    (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
  charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ?
  `, [HOScharge_id])
        let payment_status;
        if (AppointmentEntity.payment_mode == `cash` || AppointmentEntity.payment_mode == `UPI` || AppointmentEntity.payment_mode == `upi` || AppointmentEntity.payment_mode == `cash` || AppointmentEntity.payment_mode == `cheque` || AppointmentEntity.payment_mode == `CHEQUE`) {
          payment_status = `paid`
        }
        else {
          payment_status = `unpaid`
        }

        console.log("payment_statusssssss");
        const HOStransactions = await this.connection.query(`
  insert into transactions (
    type,
    section,
    patient_id,
    case_reference_id,
    amount,
    payment_mode,
    payment_date,
    opd_id, payment_gateway,
payment_id,
payment_reference_number
    ) values
    (?,?,?,?,?,?,?,?,?,?,?)`, [
          'payment',
          'Appointment',
          AppointmentEntity.patient_id,
          HOScaseRef.insertId,
          HOSamount[0].amount,
          AppointmentEntity.payment_mode,
          AppointmentEntity.payment_date,
          HOSopdCreate.insertId,
          AppointmentEntity.payment_gateway,
          AppointmentEntity.payment_id,
          AppointmentEntity.payment_reference_number


        ])
        HOStransaction_id = HOStransactions.insertId
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
    transaction_id,
    patient_id
    ) values(?,?,?,?,?,?,?,?,?,?,?,?)`, [
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
          HOStransactions.insertId,
          AppointmentEntity.patient_id

        ]
        )
        const HOSvisitInsert = await this.connection.query(`
  insert into visit_details(
    opd_details_id,
    patient_charge_id,
    transaction_id,
    case_type,
    cons_doctor,
    appointment_date,
    live_consult,
    payment_mode
    ) values (?,?,?,?,?,?,?,?)`
          , [
            HOSopdCreate.insertId,
            Patient_charges_insert.insertId,
            HOStransaction_id,
            "",
            AppointmentEntity.doctor,
            AppointmentEntity.date + " " + AppointmentEntity.time,
            AppointmentEntity.live_consult,
            AppointmentEntity.payment_mode
          ])
        const [adminGlobalShiftId] = await this.dynamicConnection.query(`select * from global_shift where Hospital_id = ? and
hospital_global_shift_id = ?`, [
          AppointmentEntity.Hospital_id,
          AppointmentEntity.global_shift_id
        ])

        const [adminShiftId] = await this.dynamicConnection.query(`select * from doctor_shift where Hospital_id = ? and
hospital_doctor_shift_id = ?`, [
          AppointmentEntity.Hospital_id,
          AppointmentEntity.shift_id
        ])

        const [appointment_status_id] = await this.dynamicConnection.query(`select id from appointment_status where Hospital_id = ? and
hos_appointment_status_id = ? `, [
          AppointmentEntity.Hospital_id,
          AppointmentEntity.appointment_status_id
        ])
        const [appointment_status_name] = await this.dynamicConnection.query(`select status from appointment_status where id = ? `, [
          appointment_status_id.id
        ])
        const [status_name] = await this.connection.query(`select status from appointment_status where id = ?`, [
          AppointmentEntity.appointment_status_id
        ])
        let hos_appointment_id;

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
        appointment_status
       
        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
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
          status_name.status
        ]
        )

        hos_appointment_id = HOSbookAppnt.insertId
        if (AppointmentEntity.date == formattedDate) {
          if (HOStransaction_id) {
            const getLastPosition = await this.connection.query(`select position from
       appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `, [AppointmentEntity.date,
            AppointmentEntity.doctor,
            AppointmentEntity.shift_id
            ])
            if (getLastPosition.length !== 0) {
              position = getLastPosition[0].position + 1
            } else {
              position = 1
            }
          }
          else {
            position = null
          }
        } else {
          position = null
        }
       await this.connection.query(`insert into appointment_queue(
      appointment_id,
      staff_id,
      shift_id,
      position,
      date
      ) values (?,?,?,?,?)`, [
          HOSbookAppnt.insertId,
          AppointmentEntity.doctor,
          AppointmentEntity.shift_id,
          position,
          AppointmentEntity.date
        ])

        await this.connection.query(`insert into
      appointment_payment
      (appointment_id,
        charge_id,
        paid_amount,
        payment_mode,
        payment_type,
        transaction_id,
        date) values (?,?,?,?,?,?,?)`, [
          hos_appointment_id,
          HOScharge_id,
          HOSamount[0].amount,
          AppointmentEntity.payment_mode,
          payment_type,
          HOStransaction_id,
          AppointmentEntity.date + " " + AppointmentEntity.time
        ])
        if (HOStransaction_id) {
          await this.connection.query(`update transactions set transactions.appointment_id = ? where transactions.id = ?`, [
            HOSbookAppnt.insertId,
            HOStransaction_id
          ])
        }

        // #############################################################################################################

        let transaction_id: number
        const caseRef = await this.dynamicConnection.query('INSERT INTO case_references values(default,default)')
        const opdCreate = await this.dynamicConnection.query(`
insert into opd_details (case_reference_id,patient_id,Hospital_id,hos_opd_id) values (?,?,?,?)`, [
          caseRef.insertId,
          HOSpatientId,
          AppointmentEntity.Hospital_id,
          HOSopdCreate.insertId
        ])

        const getAdminChargeId = await this.dynamicConnection.query(`select id from charges
where Hospital_id = ?
and hospital_charges_id = ?`, [
          AppointmentEntity.Hospital_id,
          HOScharge_id
        ])

        const transactions = await this.dynamicConnection.query(`
  insert into transactions (
  type,
  section,
  patient_id,
  case_reference_id,
  amount,
  payment_mode,
  payment_date,
  Hospital_id,
  hos_transaction_id,
      opd_id, payment_gateway,
payment_id,
payment_reference_number
  
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
          'payment',
          'Appointment',
          HOSpatientId,
          caseRef.insertId,
          HOSamount[0].amount,
          AppointmentEntity.payment_mode,
          AppointmentEntity.payment_date,
          AppointmentEntity.Hospital_id,
          HOStransactions.insertId,
          opdCreate.insertId,
          AppointmentEntity.payment_gateway,
          AppointmentEntity.payment_id,
          AppointmentEntity.payment_reference_number

        ])
        transaction_id = transactions.insertId
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
    transaction_id,
    patient_id
    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
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
          transactions.insertId,
          HOSpatientId,
        ]
        )
        const visitInsert = await this.dynamicConnection.query(`
insert into visit_details(
  opd_details_id,
  patient_charge_id,
  transaction_id,
  case_type,
  cons_doctor,
  appointment_date,
  live_consult,
  payment_mode,Hospital_id,hos_visit_id
  ) values (?,?,?,?,?,?,?,?,?,?)`
          , [
            opdCreate.insertId,
            Patient_charges.insertId,
            transaction_id,
            "",
            adminStaffId,
            AppointmentEntity.date + " " + AppointmentEntity.time,
            AppointmentEntity.live_consult,
            AppointmentEntity.payment_mode,
            AppointmentEntity.Hospital_id,
            HOSvisitInsert.insertId
          ])

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
      appointment_status
      ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
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
          appointment_status_id.id,
          appointment_status_name.status
        ]
        )

        await this.dynamicConnection.query(`insert into appointment_queue(
    appointment_id,
    staff_id,
    shift_id,
    position,
    date
    ) values (?,?,?,?,?)`, [
          bookAppnt.insertId,
          adminStaffId,
          adminShiftId.id,
          position,
          AppointmentEntity.date
        ])

        await this.dynamicConnection.query(`insert into
  appointment_payment
  (appointment_id,
    charge_id,
    paid_amount,
    payment_mode,
    payment_type,
    transaction_id,
    date) values (?,?,?,?,?,?,?)`, [
          bookAppnt.insertId,
          getAdminChargeId[0].id,
          HOSamount[0].amount,
          AppointmentEntity.payment_mode,
          payment_type,
          transaction_id,
          AppointmentEntity.date + " " + AppointmentEntity.time
        ])
        if (transaction_id) {
          await this.dynamicConnection.query(`update transactions set transactions.appointment_id = ? where transactions.id = ?`, [
            bookAppnt.insertId,
            transaction_id
          ])
        }
        const dokku = `  
  select appointment.id, 
  patients.patient_name,
  patients.aayush_unique_id,
  concat('APPN','',appointment.id) as appointment_no,
   appointment.date,appointment.time,patients.mobileno,patients.email as patient_email,
   patients.gender,
          CONCAT( staff.name, ' ', staff.surname) AS doctor_name,
          staff.employee_id,
          patients.ABHA_number,
          appointment.source,appoint_priority.priority_status,appoint_priority.id priorityID,appointment.live_consult,
          appointment.appointment_status,appointment.amount,global_shift.id  as shift_id,global_shift.name as shift,doctor_shift.id as slot_id,
          doctor_shift.day as slot,
            transactions.payment_mode,transactions.payment_date,appointment.global_shift_id,appointment.doctor,
            appointment.appointment_status_id,
appointment.created_at from appointment
          join patients ON appointment.patient_id = patients.id
          left join staff ON appointment.doctor = staff.id
          left join appoint_priority ON appointment.priority = appoint_priority.id
left join visit_details ON appointment.visit_details_id = visit_details.id
  left join transactions ON visit_details.transaction_id = transactions.id
          left join global_shift ON appointment.global_shift_id = global_shift.id
          left join doctor_shift ON appointment.shift_id = doctor_shift.id where appointment.id = ?`
        const madar = await this.connection.query(dokku, [HOSbookAppnt.insertId])
        return [{
          "status": "success",
          "messege": "Appointment booked successfully",
          "inserted_details": madar
        }];
      }
      else {
        return {
          "status": "failed",
          "message": "cannot book duplicate appointment"
        }
      }

    } catch (error) {
      return error

    }
  }

  async find() {
    const appointment = await this.connection.query(`              
       SELECT 
          patients.patient_name AS name, 
CONCAT( CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END, appointment.id) as appointment_id ,          appointment.source AS consult_type, 
          patients.mobileno, 
          patients.dial_code,
          patients.image,
          appointment.doctor,
          CONCAT("Dr. ", staff.name, " ", staff.surname) AS consultant,
          CONCAT(doctor_shift.start_time, " ", doctor_shift.end_time) AS Time_slot,
		  patients.abha_address,
          appointment.date,
          appointment_status.status,
          patient_charges.total AS apptFees,   
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
          doctor_shift ON appointment.shift_id = doctor_shift.id
        LEFT JOIN 
          appointment_queue ON appointment_queue.appointment_id = appointment.id
        LEFT JOIN 
          appointment_status ON appointment_status.id = appointment.appointment_status_id
        LEFT JOIN 
          visit_details ON visit_details.id = appointment.visit_details_id
        LEFT JOIN 
          patient_charges ON patient_charges.id = visit_details.patient_charge_id
        LEFT JOIN 
          specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `);

    return appointment;
  }




  async findOne(id: string) {
    const appointment = await this.connection.query(` SELECT appointment.id,
          patients.patient_name AS name, 
CONCAT( CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END, appointment.id) as appointment_id ,          appointment.source AS consult_type, 
          patients.mobileno, 
          patients.dial_code,
          patients.image,
          appointment.doctor,
          CONCAT("Dr. ", staff.name, " ", staff.surname) AS consultant,
          CONCAT(doctor_shift.start_time, " ", doctor_shift.end_time) AS Time_slot,
           patients.abha_address,
          appointment.date,
          appointment_status.status,
          patient_charges.total AS apptFees,   
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
          doctor_shift ON appointment.shift_id = doctor_shift.id
        LEFT JOIN 
          appointment_queue ON appointment_queue.appointment_id = appointment.id
        LEFT JOIN 
          appointment_status ON appointment_status.id = appointment.appointment_status_id
        LEFT JOIN 
          visit_details ON visit_details.id = appointment.visit_details_id
        LEFT JOIN 
          patient_charges ON patient_charges.id = visit_details.patient_charge_id
        LEFT JOIN 
          specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1
    WHERE appointment.id = ?`, [id]);

    if (appointment.length === 1) {
      return appointment
    } else {
      return null;
    }
  }



  async findAll(fromDate: string, toDate: string, doctorId: number, appointStatus_id: number, appointStatus: string, hospital_id: number, paymentStatus: string, appointmentsource: string, mobile_no: string, patient_id: number, shift_id: number, global_shift_id: number, gender: string) {
    try {
      let query = ` 
 SELECT
        patients.patient_name,
        patients.id AS patient_id,
        patients.gender as gender,
        concat(patients.age,"years",coalesce(patients.month,"-"),"month",coalesce(patients.day,"-"),"day") as age,
        CONCAT(DATE_FORMAT(appointment.date, '%D %b %Y'), ",", DATE_FORMAT(appointment.time, '%h:%i %p')) AS appointment_date,
        CONCAT( patients.mobileno) AS Mobile,
               appointment.global_shift_id as shift_id,
               global_shift.name as shift_name,
               appointment.shift_id as slot_id,
               doctor_shift.day,
        concat(doctor_shift.start_time,"-",doctor_shift.end_time) as time,
                    coalesce(     GROUP_CONCAT(DISTINCT specialist.specialist_name) ,"-")AS doctorSpecialist,
        patients.dial_code,
        patients.image,
                   patients.abha_address,
        appointment.doctor,
        CONCAT("Dr. ",staff.name, " ", staff.surname) AS consultant,
        appointment_status.status appointment_status,
        appointment.appointment_status_id,
        appointment.source,
        appointment_status.color_code,
        CONCAT( CASE 
            WHEN appointment.doctor IS NOT NULL THEN 'APPN' 
            ELSE 'TEMP' 
        END, appointment.id) as appointment_id ,
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
        left join doctor_shift on appointment.shift_id = doctor_shift.id
      LEFT JOIN
        staff ON staff.id = appointment.doctor
        LEFT JOIN 
        global_shift on appointment.global_shift_id = global_shift.id
      LEFT JOIN
        appointment_queue ON appointment_queue.appointment_id = appointment.id
        left join 
        appointment_status on appointment_status.id = appointment.appointment_status_id
        LEFT JOIN
        visit_details ON visit_details.id = appointment.visit_details_id
        left join patient_charges on patient_charges.id = visit_details.patient_charge_id
                    LEFT JOIN specialist ON JSON_CONTAINS(staff.specialist, CAST(specialist.id AS JSON), '$') = 1 `
      let date;
      let values = []

      if (fromDate && toDate) {
        date = ` date(appointment.date) >= date( '` + fromDate + `' ) and date(appointment.date) <= date( '` + toDate + `' ) `
      } else if (fromDate) {
        date = ` date(appointment.date) >= date( '` + fromDate + `' ) `
      } else if (toDate) {
        date = `  date(appointment.date) <= date( '` + toDate + `' ) `
      }
      else {
        date = ` appointment.date >= DATE(NOW()) `
      }
      let where = `WHERE  ` + date
      if (doctorId) {
        where += ` and appointment.doctor = ?`
        values.push(doctorId)
      }
      if (appointStatus_id) {
        where += ` and appointment.appointment_status_id = ?`
        values.push(appointStatus_id)
      }
      if (appointStatus) {
        where += ` and appointment_status.status = ?`
        values.push(appointStatus)
      }
      if (paymentStatus) {
        where += ` and patient_charges.payment_status = ?`
        values.push(paymentStatus)
      }
      if (appointmentsource) {
        where += ` AND appointment.source = ?`;
        values.push(appointmentsource);
      }
      if (mobile_no) {
        where += ` AND patients.mobileno = ?`;
        values.push(mobile_no);
      }
      if (patient_id) {
        where += ` AND appointment.patient_id = ?`;
        values.push(patient_id);
      }
      if (shift_id) {
        where += ` AND appointment.shift_id = ?`;
        values.push(shift_id)
      }
      if (global_shift_id) {
        where += ` AND appointment.global_shift_id = ?`;
        values.push(global_shift_id)
      }
      if (gender) {
        where += ` AND patients.gender = ?`;
        values.push(gender);
      }
      let order = `ORDER BY
      date(appointment.date) ASC, time(appointment.date) ASC `
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
        patient_charges.payment_status, 
        appointment.source,
        appointment_queue.position `
      let final = query + where + group + order
      const GetTodayAppointment = await this.connection.query(final, values)
      return GetTodayAppointment;
    } catch (error) {
      return error
    }

  }


  async findcount(date: any, status: number) {
    const count = await this.connection.query(` SELECT COUNT(*) AS appointment_count
FROM appointment
LEFT JOIN appointment_status ON appointment.appointment_status_id = appointment_status.id
WHERE appointment.date = ?
AND appointment.appointment_status_id = ?; `, [date, status])
    return count
  }





  async update(numb: number, Entity: EmrAppointment) {

    if (Entity.Hospital_id) {
      try {
        const [getstaff_id] = await this.connection.query(`select * from appointment where id = ?`, [numb])
        console.log(getstaff_id, "log 2");
        let adminApptStatusId;

        const doc_id = getstaff_id.doctor

        const currentDate = new Date();
        const isoString = currentDate.toISOString();
        const datePart = isoString.split('T')[0];

        const formattedDate = currentDate.toISOString().split('T')[0];

        if (doc_id) {
          if (doc_id == Entity.doctor) {
            try {
              const HosVisitDetailsId = await getstaff_id.visit_details_id
              const [HosPatientCharges] = await this.connection.query(`select * from visit_details where id = ?`, [HosVisitDetailsId])
              const [HosAppointQueue] = await this.connection.query(`select * from appointment_queue where appointment_id = ?`, [numb])
              const [HosAppointPayment] = await this.connection.query(`select * from appointment_payment where appointment_id = ?`, [numb])

              let payment_status;
              const [HossssPatientCharges] = await this.connection.query(`select * from patient_charges where id = ?`, [HosPatientCharges.patient_charge_id])
              if (Entity.payment_mode == 'Paylater' ||
                Entity.payment_mode == 'Offline' ||
                Entity.payment_mode == 'cheque' ||
                Entity.payment_mode == 'offline') {
                payment_status = HossssPatientCharges.payment_status
              } else {
                payment_status = "paid"
              }
              await this.connection.query(`update patient_charges set date= ?,payment_status = ?
              where id = ?`, [Entity.date, payment_status, HosPatientCharges.patient_charge_id])


              const updateHosVisitDetails = await this.connection.query(`update visit_details set appointment_date = ?,
              live_consult = ? where id = ?`, [Entity.date + " " + Entity.time,
              Entity.live_consult, HosVisitDetailsId])

              console.log("4444", updateHosVisitDetails);



              await this.connection.query(`update appointment set patient_id = ?, date = ?,time = ?,
              global_shift_id = ?,shift_id = ?,live_consult = ?,message = ? where id = ?`, [
                Entity.patient_id,
                Entity.date,
                Entity.time,
                Entity.global_shift_id,
                Entity.shift_id,
                Entity.live_consult,
                Entity.message,
                numb
              ])
              let position;


              if (Entity.date != formattedDate) {
                position = null
                await this.connection.query(`update appointment_queue set shift_id = ?,date = ?,position = ?
                  where id = ?`, [
                  Entity.shift_id,
                  Entity.date,
                  position,
                  HosAppointQueue.id
                ])

                console.log('lll')

              } else {
                const [getLastPosition] = await this.connection.query(`select position from
                      appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `, [Entity.date,
                Entity.doctor,
                Entity.shift_id
                ])
                if (getLastPosition.length) {
                  position = getLastPosition.position + 1
                } else {
                  position = 1
                }
                await this.connection.query(`update appointment_queue set shift_id = ?,
                      position = ?,date = ?
                    where id = ?`, [
                  Entity.shift_id,
                  position,
                  Entity.date,
                  HosAppointQueue.id
                ])
              }

              await this.connection.query(`update appointment_payment set date = ? where id = ?`, [
                Entity.date,
                HosAppointPayment.id
              ])
              const [getAdminAppointdetails] = await this.dynamicConnection.query(`select * from appointment
    where hos_appointment_id = ? and Hospital_id = ?`, [numb, Entity.Hospital_id])
              const AdminAppointmentId = await getAdminAppointdetails.id

              const AdminVisitDetailsId = await getAdminAppointdetails.visit_details_id
              const [AdminPatientChargeId] = await this.dynamicConnection.query(`select * from visit_details where id = ?`, [AdminVisitDetailsId])
              const [AdminAppointmentQueue] = await this.dynamicConnection.query(`select * from appointment_queue where appointment_id = ?`, [AdminAppointmentId])
              const [AdminAppointmentPayment] = await this.dynamicConnection.query(`select * from appointment_payment where appointment_id = ?`, [AdminAppointmentId])

              await this.dynamicConnection.query(`update patient_charges set date= ?,payment_status = ?
    where id = ?`, [Entity.date, payment_status, AdminPatientChargeId.patient_charge_id])
              const [getPatientchargesAdmin] = await this.dynamicConnection.query(`select * from patient_charges where id = ?`,
                [AdminPatientChargeId.patient_charge_id])
              if (!Entity.txn_id) {
                Entity.txn_id = 'NA'
              }
              if (!Entity.bank_ref_id) {
                Entity.bank_ref_id = 'NA'
              }
              if (!Entity.pg_ref_id) {
                Entity.pg_ref_id = 'NA'
              }
              if (HossssPatientCharges.payment_status == 'partially_paid' && payment_status == 'paid') {
                const [getAdmintransactionDetails] = await this.dynamicConnection.query(`select * from transactions
          where appointment_id = ? `, [AdminAppointmentId])
                const [getHosTrdID] = await this.connection.query(`select * from transactions
             where appointment_id = ?`, [numb])
                 await this.dynamicConnection.query(`update transactions
          set amount = ?,
           payment_mode = ?  
         where id = ?`, [
                  getPatientchargesAdmin.amount,
                  Entity.payment_mode,
                  getAdmintransactionDetails.id
                ])
                 await this.connection.query(`update transactions  
          set amount = ?,  
           payment_mode = ?  
           where id = ?`, [
                  getPatientchargesAdmin.amount,
                  Entity.payment_mode,
                  getHosTrdID.id
                ])
              }

              if (payment_status == 'paid' && HossssPatientCharges.payment_status == 'unpaid') {
                const [getHosApptDetails] = await this.connection.query(`select * from appointment where id = ?`, [numb])
                const insert_transactionsHos = await this.connection.query(`insert into transactions (
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
              payment_date) values (?,?,?,?,?,?,?,?,?,?,?,?)  
              `, [
                  Entity.txn_id,
                  Entity.pg_ref_id,
                  Entity.bank_ref_id,
                  "payment",
                  "Appointment",
                  getHosApptDetails.patient_id,
                  getHosApptDetails.case_reference_id,
                  HossssPatientCharges.id,
                  getHosApptDetails.id,
                  getPatientchargesAdmin.amount,
                  Entity.payment_mode,
                  Entity.payment_date
                ])

                await this.dynamicConnection.query(`insert into transactions (  
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
              hos_transaction_id)  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  
              `, [
                  Entity.txn_id,
                  Entity.pg_ref_id,
                  Entity.bank_ref_id,
                  "payment",
                  "Appointment",
                  getAdminAppointdetails.patient_id,
                  getAdminAppointdetails.case_reference_id,
                  getAdminAppointdetails.patient_charge_id,
                  getAdminAppointdetails.id,
                  getAdminAppointdetails.amount,
                  Entity.payment_mode,
                  Entity.payment_date,
                  Entity.Hospital_id,
                  insert_transactionsHos.insertId
                ])

              }

              await this.dynamicConnection.query(`update visit_details set appointment_date = ?,
    live_consult = ? where id = ?`, [Entity.date + " " + Entity.time,
              Entity.live_consult, AdminVisitDetailsId])

              const [AdminGlobalShiftdetails] = await this.dynamicConnection.query(`select * from global_shift where hospital_global_shift_id = ?`, [Entity.global_shift_id])

              const [AdminShiftDetails] = await this.dynamicConnection.query(`select * from doctor_shift where hospital_doctor_shift_id = ?`, [Entity.shift_id])

              await this.dynamicConnection.query(`update appointment set date = ?,time = ?,
    global_shift_id = ?,shift_id = ?,live_consult = ?,  message = ?
     where id = ?`, [
                Entity.date,
                Entity.time,
                AdminGlobalShiftdetails.id,
                AdminShiftDetails.id,
                Entity.live_consult,
                Entity.message,
                AdminAppointmentId
              ])

              if (Entity.date != currentDate) {
                position = null
                await this.dynamicConnection.query(`update appointment_queue set shift_id = ?,date = ?,position = ?
    where id = ?`, [
                  AdminShiftDetails.id,
                  Entity.date,
                  position,
                  AdminAppointmentQueue.id
                ])

              } else {
                await this.dynamicConnection.query(`update appointment_queue set shift_id = ?,position = ?,date = ?
     where id = ?`, [
                  AdminShiftDetails.id,
                  position,
                  Entity.date,
                  AdminAppointmentQueue.id
                ])
              }

              await this.dynamicConnection.query(`update appointment_payment set date = ? where id = ?`, [
                Entity.date,
                AdminAppointmentPayment.id
              ])
              const [result] = await this.connection.query(`select  
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
     
      `, [numb])
              return [{
                status: "success",
                "message": "Appointment updated successfully.",
                "updated_value": result
              }]
            } catch (error) {
              return "error is : " + error
            }
          } else {
            return {
              status: "failed",
              "message": "cannot change doctor."
            }
          }
        }




        else {
          if (Entity.doctor) {


            const [getHosStaffdetails] = await this.connection.query(`select * from staff where id = ?`, [Entity.doctor])
            const [HosChargeId] = await this.connection.query(`select * from shift_details where staff_id = ?`, [Entity.doctor])
            const [getAmountDetails] = await this.connection.query(`
      select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
        (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
      charges join tax_category on charges.tax_category_id = tax_category.id
      where charges.id = ?`, [HosChargeId.charge_id])
            const HosssVisitDetailsId = await getstaff_id.visit_details_id
            const [HossPatientCharges] = await this.connection.query(`select * from visit_details where id = ?`, [HosssVisitDetailsId])
            const [HossAppointQueue] = await this.connection.query(`select * from appointment_queue where appointment_id = ?`, [numb])
            const [HossAppointPayment] = await this.connection.query(`select * from appointment_payment where appointment_id = ?`, [numb])
            const [HossssPatientCharges] = await this.connection.query(`select * from patient_charges where id = ?`, [HossPatientCharges.patient_charge_id])
            let payment_status;
            if (Entity.payment_mode == 'Paylater' || Entity.payment_mode == 'Offline' || Entity.payment_mode == 'cheque' || Entity.payment_mode == 'offline') {
              payment_status = HossssPatientCharges.payment_status
            } else {
              payment_status = "paid"
            }
            const Balance = HossssPatientCharges.temp_amount - getAmountDetails.amount;
            await this.connection.query(`update patient_charges set date= ?,
      charge_id=?,standard_charge=?,
      tax=?,apply_charge=?,amount=?, total = ?, balance = ?, payment_status = ? where id = ?`, [
              Entity.date,
              HosChargeId.charge_id,
              getAmountDetails.standard_charge,
              getAmountDetails.tax_percentage,
              getAmountDetails.standard_charge,
              getAmountDetails.amount,
              getAmountDetails.amount,
              Balance,
              payment_status,
              HossPatientCharges.patient_charge_id])
            await this.connection.query(`update visit_details set appointment_date = ?,cons_doctor = ?,
        live_consult = ? where id = ?`, [Entity.date + " " + Entity.time,
            Entity.doctor,
            Entity.live_consult, HosssVisitDetailsId])

            await this.connection.query(`update appointment set date = ?,time = ?,doctor=?,
        global_shift_id = ?,shift_id = ?,live_consult = ?,amount=? where id = ?`, [
              Entity.date,
              Entity.time,
              Entity.doctor,
              Entity.global_shift_id,
              Entity.shift_id,
              Entity.live_consult,
              getAmountDetails.amount,
              numb
            ])
            let position;
            if (Entity.date != datePart) {
              position = null
              console.log("if la varudhu bhaa", Entity.shift_id,
                Entity.date,
                position,
                Entity.doctor,
                HossAppointQueue.id);

              await this.connection.query(`update appointment_queue set shift_id = ?,
        date = ?,position = ?,staff_id = ?
        where id = ?`, [
                Entity.shift_id,
                Entity.date,
                position,
                Entity.doctor,
                HossAppointQueue.id
              ])
            } else {
              const [getlastpsn] = await this.connection.query(`SELECT * FROM appointment_queue
             where staff_id = ?
          and date = ? and shift_id = ? order by position desc limit  1 `, [
                Entity.doctor,
                Entity.date,
                Entity.shift_id,])
              if (getlastpsn) {
                position = getlastpsn.position + 1
              }
              else {
                position = 1
              }
              await this.connection.query(`update appointment_queue set shift_id = ?,
          date = ?,staff_id = ?,position = ?
          where id = ?`, [
                Entity.shift_id,
                Entity.date,
                Entity.doctor,
                position,
                HossAppointQueue.id
              ])
            }
            await this.connection.query(`update appointment_payment set date = ? where id = ?`, [
              Entity.date,
              HossAppointPayment.id
            ])

            const [getAdminnAppointdetails] = await this.dynamicConnection.query(`select * from appointment where hos_appointment_id = ? and Hospital_id = ?`, [numb, Entity.Hospital_id])
            const AdminnnAppointmentId = await getAdminnAppointdetails.id
            const [getAdminStaffdetails] = await this.dynamicConnection.query(`select * from staff where email = ?`, [getHosStaffdetails.email])
            const [getAdminnGlobalShiftId] = await this.dynamicConnection.query(`select * from global_shift where hospital_global_shift_id = ?`, [Entity.global_shift_id])
            const [getAdminnShiftId] = await this.dynamicConnection.query(`select * from doctor_shift where hospital_doctor_shift_id = ?`, [Entity.shift_id])
            const [getAdminchargeId] = await this.dynamicConnection.query(`select * from shift_details where staff_id = ?`, [getAdminStaffdetails.id])

            const [getAdminAmountDetails] = await this.dynamicConnection.query(`
      select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
        (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
      charges join tax_category on charges.tax_category_id = tax_category.id
      where charges.id = ?`, [getAdminchargeId.charge_id])

            const AdminnVisitDetailsId = await getAdminnAppointdetails.visit_details_id
            const [AdminnPatientCharges] = await this.dynamicConnection.query(`select * from visit_details where id = ?`, [AdminnVisitDetailsId])
            const [AdminnAppointQueue] = await this.dynamicConnection.query(`select * from appointment_queue where appointment_id = ?`, [AdminnnAppointmentId])
            const [AdminnAppointPayment] = await this.dynamicConnection.query(`select * from appointment_payment where appointment_id = ?`, [AdminnnAppointmentId])

            await this.dynamicConnection.query(`update patient_charges set date= ?,charge_id=?,standard_charge=?,
              tax=?,apply_charge=?,amount=?, total = ?, balance = ?, payment_status = ? where id = ?`, [
              Entity.date,
              getAdminchargeId.charge_id,
              getAdminAmountDetails.standard_charge,
              getAdminAmountDetails.tax_percentage,
              getAdminAmountDetails.standard_charge,
              getAdminAmountDetails.amount,
              getAdminAmountDetails.amount,
              Balance,
              payment_status,
              AdminnPatientCharges.patient_charge_id])


            if (!Entity.txn_id) {
              Entity.txn_id = 'NA'
            }

            if (!Entity.bank_ref_id) {
              Entity.bank_ref_id = 'NA'
            }

            if (!Entity.pg_ref_id) {
              Entity.pg_ref_id = 'NA'
            }



            if (HossssPatientCharges.payment_status == 'partially_paid' && payment_status == 'paid') {

              const [getAdmintransactionDetails] = await this.dynamicConnection.query(`select * from transactions     
                    where appointment_id = ? `, [getAdminnAppointdetails.id])
              const [getHosTrdID] = await this.connection.query(`select * from transactions     
                       where appointment_id = ?`, [numb])
              await this.dynamicConnection.query(`update transactions     
                    set amount = ?,     
                     payment_mode = ?     
                     where id = ?`, [
                getAdminAmountDetails.amount,
                Entity.payment_mode,
                getAdmintransactionDetails.id
              ])
               await this.connection.query(`update transactions     
                      set amount = ?,
                            payment_mode = ?     
                       where id = ?`, [
                getAdminAmountDetails.amount,
                Entity.payment_mode,
                getHosTrdID.id
              ])

            }

            if (payment_status == 'paid' && HossssPatientCharges.payment_status == 'unpaid') {

              const [getHosApptDetails] = await this.connection.query(`select * from appointment where id = ?`, [numb])

              const insert_transactionsHos = await this.connection.query(`insert into transactions (     
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
                          payment_date) values (?,?,?,?,?,?,?,?,?,?,?,?)     
                          `, [

                Entity.txn_id,
                Entity.pg_ref_id,
                Entity.bank_ref_id,
                "payment",
                "Appointment",
                getHosApptDetails.patient_id,
                getHosApptDetails.case_reference_id,
                HossssPatientCharges.id,
                getHosApptDetails.id,
                getAdminAmountDetails.amount,
                Entity.payment_mode,
                Entity.payment_date
              ])

              await this.dynamicConnection.query(`insert into transactions (     
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
                          hos_transaction_id)  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)     
                          `, [
                Entity.txn_id,
                Entity.pg_ref_id,
                Entity.bank_ref_id,
                "payment",
                "Appointment",
                getAdminnAppointdetails.patient_id,
                getAdminnAppointdetails.case_reference_id,
                AdminnPatientCharges.patient_charge_id,
                getAdminnAppointdetails.id,
                getAdminAmountDetails.amount,
                Entity.payment_mode,
                Entity.payment_date,
                Entity.Hospital_id,
                insert_transactionsHos.insertId
              ])
            }
            await this.dynamicConnection.query(`update visit_details set appointment_date = ?,cons_doctor = ?,
                live_consult = ? where id = ?`, [Entity.date + " " + Entity.time,
            getAdminStaffdetails.id,
            Entity.live_consult, AdminnVisitDetailsId])


            await this.dynamicConnection.query(`update appointment set date = ?,time = ?,doctor=?,
                global_shift_id = ?,shift_id = ?,live_consult = ?,amount=? where id = ?`, [
              Entity.date,
              Entity.time,
              getAdminStaffdetails.id,
              getAdminnGlobalShiftId.id,
              getAdminnShiftId.id,
              Entity.live_consult,
              getAdminAmountDetails.amount,
              AdminnnAppointmentId
            ])

            if (Entity.date != datePart) {
              position = null
              await this.dynamicConnection.query(`update appointment_queue set shift_id = ?,
                date = ?,position = ?,staff_id = ?
                where id = ?`, [
                getAdminnShiftId.id,
                Entity.date,
                position,
                getAdminStaffdetails.id,
                AdminnAppointQueue.id
              ])

            } else {
              const [getlastpsn] = await this.dynamicConnection.query(`SELECT * FROM appointment_queue
                    where staff_id = ?
                  and date = ? and shift_id = ? order by position desc limit  1 `, [getAdminStaffdetails.id,

              Entity.date,
              getAdminnShiftId.id,])
              if (getlastpsn) {
                position = getlastpsn.position + 1
              }
              else {
                position = 1
              }

              await this.dynamicConnection.query(`update appointment_queue set shift_id = ?,
                  date = ?,staff_id = ?, position = ?
                  where id = ?`, [
                getAdminnShiftId.id,
                Entity.date,
                getAdminStaffdetails.id,
                position,
                AdminnAppointQueue.id
              ])
            }
            await this.dynamicConnection.query(`update appointment_payment set date = ? where id = ?`, [
              Entity.date,
              AdminnAppointPayment.id
            ])
            const [reslt] = await this.dynamicConnection.query(`select  
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
       
       `, [numb])
            return [{
              "status": "success",
              "message": "Appointment Updated successfully",
              "updated_value": reslt

            }]
          }
          else {
            const [getAPPDetails] = await this.connection.query(`select * from appointment where id = ?`, [numb])
            const HOSSVisitDetailsId = await getAPPDetails.visit_details_id
            const [HOSSPatientCharges] = await this.connection.query(`select * from visit_details where id = ?`, [HOSSVisitDetailsId])
            const [HOSSAppointQueue] = await this.connection.query(`select * from appointment_queue where appointment_id = ?`, [numb])
            const [HOSSAppointPayment] = await this.connection.query(`select * from appointment_payment where appointment_id = ?`, [numb])
            await this.connection.query(`update patient_charges set date= ? where id = ?`, [
              Entity.date, HOSSPatientCharges.patient_charge_id])
            await this.connection.query(`update visit_details set appointment_date = ?,
        live_consult = ? where id = ?`, [Entity.date + " " + Entity.time,
            Entity.live_consult, HOSSVisitDetailsId])
            await this.connection.query(`update appointment set date = ?,time = ?,
        live_consult = ?,appointment_status_id = ? ,appointment_status = ? where id = ?`, [
              Entity.date,
              Entity.time,
              Entity.live_consult,
              Entity.appointment_status_id,
              Entity.appointment_status,
              numb
            ])
            await this.connection.query(`update appointment_queue set date = ?
        where id = ?`, [
              Entity.date,
              HOSSAppointQueue.id
            ])
            await this.connection.query(`update appointment_payment set date = ? where id = ?`, [
              Entity.date,
              HOSSAppointPayment.id
            ])
            const [getADMINAPPDetails] = await this.dynamicConnection.query(`select * from appointment where hos_appointment_id = ? and Hospital_id = ?`, [numb, Entity.Hospital_id])
            const ADMINVisitDetailsId = await getADMINAPPDetails.visit_details_id
            const [ADMINPatientCharges] = await this.dynamicConnection.query(`select * from visit_details where id = ?`, [ADMINVisitDetailsId])
            const [ADMINAppointQueue] = await this.dynamicConnection.query(`select * from appointment_queue where appointment_id = ?`, [getADMINAPPDetails.id])
            const [ADMINAppointPayment] = await this.dynamicConnection.query(`select * from appointment_payment where appointment_id = ?`, [getADMINAPPDetails.id])
            await this.dynamicConnection.query(`update patient_charges set date= ? where id = ?`, [
              Entity.date, ADMINPatientCharges.patient_charge_id])

            await this.dynamicConnection.query(`update visit_details set appointment_date = ?,
            live_consult = ? where id = ?`, [Entity.date + " " + Entity.time,
            Entity.live_consult, ADMINVisitDetailsId])

            await this.dynamicConnection.query(`update appointment set date = ?,time = ?,live_consult = ?,appointment_status_id = ?,appointment_status = ? where id = ?`, [
              Entity.date,
              Entity.time,
              Entity.live_consult,
              adminApptStatusId,
              Entity.appointment_status,
              getADMINAPPDetails.id
            ])

            await this.dynamicConnection.query(`update appointment_queue set date = ?
            where id = ?`, [
              Entity.date,
              ADMINAppointQueue.id
            ])




            await this.dynamicConnection.query(`update appointment_payment
            set date = ? where id = ?`, [
              Entity.date,
              ADMINAppointPayment.id
            ])
            const [reslt] = await this.connection.query(`select  
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
               
                `, [numb])

            return [{
              "status": "success",
              "message": "Appointment Updated successfully",
              "updated_values": reslt
            }]
          }
        }
      } catch (error) {
        return error
      }
    } else {
      return {
        "status": "failed",
        "message": "enter hospital_id to update appointment"
      }
    }
  }


  async findcountWithPercentage(date: string) {
    try {
      const todayQuery = `select
          (SELECT COUNT(*) 
          FROM appointment
          WHERE appointment.date = date(?)
          AND appointment.appointment_status_id = 1) as requested_count,

          (SELECT COUNT(*) 
     FROM appointment 
     WHERE appointment.date = date(?) 
     AND appointment.appointment_status_id = 2) AS reserved_count,

      (SELECT COUNT(*) 
     FROM appointment 
     WHERE appointment.date = date(?) 
     AND appointment.appointment_status_id = 3) AS approved_count,
          
         (SELECT COUNT(*) 
     FROM appointment 
     WHERE appointment.date = date(?) 
     AND appointment.appointment_status_id = 6) AS completed_count
        `;
      const yesterdayQuery = `select
          (SELECT COUNT(*)
          FROM appointment
          WHERE appointment.date = DATE_SUB(?, INTERVAL 1 DAY)
          AND appointment.appointment_status_id = 1) as requested_count,

          (SELECT COUNT(*)
          FROM appointment
          WHERE appointment.date = DATE_SUB(?, INTERVAL 1 DAY)
          AND appointment.appointment_status_id = 2) as reserved_count,

            (SELECT COUNT(*)
          FROM appointment
          WHERE appointment.date = DATE_SUB(?, INTERVAL 1 DAY)
          AND appointment.appointment_status_id = 3) AS approved_count,

         ( SELECT COUNT(*)
          FROM appointment
          WHERE appointment.date = DATE_SUB(?, INTERVAL 1 DAY)
          AND appointment.appointment_status_id = 6) AS completed_count
        `;
      const [todayCount] = await this.connection.query(todayQuery, [date, date, date, date]);

      const [yesterdayCount] = await this.connection.query(yesterdayQuery, [date, date, date, date]);
      const todayAppointments = todayCount;
      const yesterdayAppointments = yesterdayCount;

      let percentagerequested_count = (((todayAppointments.requested_count - yesterdayAppointments.rerequested_count) * 100) / yesterdayAppointments.requested_count);
      let percentagereserved_count = (((todayAppointments.reserved_count - yesterdayAppointments.reserved_count) * 100) / yesterdayAppointments.reserved_count);
      let percentageapproved_count = (((todayAppointments.approved_count - yesterdayAppointments.approved_count) * 100) / yesterdayAppointments.approved_count);
      let percentagecompleted_count = (((todayAppointments.completed_count - yesterdayAppointments.completed_count) * 100) / yesterdayAppointments.completed_count);
      let percentage = {
        percentagerequested_count, percentagereserved_count, percentageapproved_count, percentagecompleted_count
      }
      return {
        todayAppointments,
        percentage,
      };
    } catch (error) {
      console.error("Error in findcountWithPercentage:", error);
      throw error;
    }
  }

  async find_Appointment_details(id: number) {
    const appointment_details = await this.connection.query(`select  appointment.id as APPN_ID,  patients.id as patient_id, patients.patient_name, patients.gender, patients.image,concat(patients.age," ","Years") as age, patients.mobileno, 
patients.email, appointment.source, patients.abha_address, appointment.appointment_status,
  CONCAT("Dr. ", staff.name, " ", staff.surname) AS consultant, specialist.specialist_name, appointment.date ,concat(doctor_shift.start_time,"-",doctor_shift.end_time) as time,
  appointment_queue.position, appointment.amount, transactions.id as transaction_id , transactions.payment_mode
 from appointment
left join patients on appointment.patient_id = patients.id
left join staff on appointment.doctor = staff.id
left join specialist on staff.specialist = specialist.id
left join doctor_shift on appointment.shift_id = doctor_shift.id
left join appointment_queue on appointment.id = appointment_queue.appointment_id
left join transactions on transactions.appointment_id = appointment.id
where appointment.id = ?`, [id])

    return appointment_details;
  }


  async status_update(Entity: EmrAppointment) {

    try {
      let a = await Entity.updateValues
      console.log("2222");

      for (const change of a) {

        const [visit_id] = await this.connection.query(`select visit_details_id from appointment where id = ?`, [change.id])

        const [opd_id] = await this.connection.query(` select opd_details_id from visit_details where id = ?`, [visit_id.visit_details_id])

        const [getadminapptID] = await this.dynamicConnection.query(`select id from appointment where Hospital_id = ? and hos_appointment_id =?`, [
          Entity.Hospital_id,
          change.id
        ])

        const [getadminvisitID] = await this.dynamicConnection.query(`select visit_details_id from appointment where id =?`, [
          getadminapptID.id
        ])

        const [getadminopd_id] = await this.dynamicConnection.query(`select opd_details_id from visit_details where id = ?`, [
          getadminvisitID.visit_details_id
        ])


        if (change.appointment_status_id === 6) {

          await this.connection.query('update opd_details SET discharged = "yes" where id = ?', [opd_id.opd_details_id])
          await this.dynamicConnection.query(`update opd_details SET discharged = "yes" 
      where id = ?`, [getadminopd_id.opd_details_id
          ])
        }

        else {
          await this.connection.query(`update  appointment SET appointment_status = ? ,appointment_status_id = ? where id = ?`, [
            change.appointment_status,
            change.appointment_status_id,
            change.id
          ])
          const [getadminapptID] = await this.dynamicConnection.query(`select id from appointment where Hospital_id = ? and hos_appointment_id =?`, [
            Entity.Hospital_id,
            change.id
          ])
          await this.dynamicConnection.query(`select id from appointment_status where hospital_id = ? 
        and hos_appointment_status_id = ?`, [
            Entity.Hospital_id,
            change.appointment_status_id
          ])

          if (getadminapptID) {
            await this.dynamicConnection.query(`update appointment SET 
        appointment_status = ? ,appointment_status_id = ? where id = ?`, [
              change.appointment_status,
              change.appointment_status_id,
              getadminapptID.id
            ])
          }
        }
        return [{
          "data ": {
            status: "success",
            "messege": "appointment status details updated successfully inserted",
          }
        }];
      }
    } catch (error) {
      return error
    }
  }

}
