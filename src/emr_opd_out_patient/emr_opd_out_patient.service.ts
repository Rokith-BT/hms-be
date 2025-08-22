import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { EmrOpdOutPatient } from "./entities/emr_opd_out_patient.entity";
import { FaceAuthService } from "src/face-auth/face-auth.service";


@Injectable()
export class EmrOpdOutPatientService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
            @Inject(forwardRef(() => FaceAuthService))
            private readonly addAppointmentService: FaceAuthService
  ) { }
  async create(Entity_opd: EmrOpdOutPatient) {
    try {
      const HOSpatient = await this.connection.query('select * from patients where id =?', [Entity_opd.patient_id])
      let HOspatientmobileno = HOSpatient[0].mobileno
      let HOSTrimmedmobileno = HOspatientmobileno.startsWith('91') ? HOspatientmobileno.slice(2) : HOspatientmobileno;
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
      age,
      image,
      faceId,
      mobileno,
      email,
      gender,
      address,
      ABHA_number,
      abha_address,
      guardian_name,
      blood_bank_product_id,
      emergency_mobile_no,
      communication_address,
      insurance_provider,
      insurance_id,
      insurance_validity
      )
      values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
          HOSpatient[0].patient_name,
          HOSpatient[0].dob,
          HOSpatient[0].age,
          HOSpatient[0].image,
          faceID,
          HOSpatient[0].mobile_no,
          HOSpatient[0].email,
          HOSpatient[0].gender,
          HOSpatient[0].address,
          HOSpatient[0].ABHA_number,
          HOSpatient[0].abha_address,
          HOSpatient[0].guardian_name,
          HOSpatient[0].blood_bank_product_id,
          HOSpatient[0].emergency_mobile_no,
          HOSpatient[0].communication_address,
          HOSpatient[0].insurance_provider,
          HOSpatient[0].insurance_id,
          HOSpatient[0].insurance_validity
        ])
        HOSpatientId = createpatient.insertId
      }
      const [staffEmailInHOS] = await this.connection.query(`select email from staff where id = ?`, [Entity_opd.cons_doctor])
      const [adminStaff] = await this.dynamicConnection.query(`select id from staff where email = ?`, [staffEmailInHOS.email])
      let adminStaffId = adminStaff.id
      let HOStransaction_id: number
      const HOScaseRef = await this.connection.query('INSERT INTO case_references () values(default,default)')
      const HOSopdCreate = await this.connection.query(`
  insert into opd_details (case_reference_id,patient_id) values (?,?)`, [
        HOScaseRef.insertId,
        Entity_opd.patient_id
      ])
      const HOSopdccreate = HOSopdCreate.insertId;

      const HOScharge = await this.connection.query(
        'SELECT charge_id FROM shift_details WHERE shift_details.staff_id = ?',
        [Entity_opd.cons_doctor]
      );
      if (!HOScharge || HOScharge.length === 0) {
        console.error('Error: No charge ID found for the given staff ID.');
        return [{
          status: "failed",
          error: 'No charge ID found for the given staff ID.'
        }];
      }
      let HOScharge_id = HOScharge[0].charge_id;
      const HOSamount = await this.connection.query(`  select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
  (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ?
`, [HOScharge_id])
      let payment_status;
      if (Entity_opd.payment_mode == `cash` || Entity_opd.payment_mode == `UPI` || Entity_opd.payment_mode == `upi` || Entity_opd.payment_mode == `cash` || Entity_opd.payment_mode == `cheque` || Entity_opd.payment_mode == `CHEQUE`) {
        payment_status = `paid`
      }
      else {
        payment_status = `unpaid`
      }
      let HOspatient_charges_id;
      const HOStransactions = await this.connection.query(`
  
    insert into transactions (
      type,
      opd_id,
      section,
      patient_id,
      case_reference_id,
      payment_mode,
      payment_date,
      amount
      ) values
      (?,?,?,?,?,?,?,?)`, [
        'payment',
        HOSopdCreate.insertId,
        'OPD',
        Entity_opd.patient_id,
        HOScaseRef.insertId,
        Entity_opd.payment_mode,
        Entity_opd.payment_date,
        HOSamount[0].amount


      ])
      HOStransaction_id = HOStransactions.insertId

      const HOSPatient_charges = await this.connection.query(
        `insert into patient_charges(
          date,
          opd_id,
           transaction_id,
           amount
          ) values(?,?,?,?)`, [
        Entity_opd.date,
        HOSopdccreate,
        HOStransactions.insertId,
        HOSamount[0].amount
      ]
      )
      HOspatient_charges_id = HOSPatient_charges.insertId

      const HOSvisitInsert = await this.connection.query(`
    insert into visit_details(
      opd_details_id,
      patient_charge_id,
      transaction_id,
      case_type,
      cons_doctor,
      appointment_date,
      live_consult,
      payment_mode,
      bp,
      height,
      weight,
      pulse,
      temperature,
      respiration,
      casualty,
      refference,
      spo2
      ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        , [
          HOSopdCreate.insertId,
          HOspatient_charges_id,
          HOStransaction_id,
          Entity_opd.case_type,
          Entity_opd.cons_doctor,
          Entity_opd.date + " " + Entity_opd.time,
          Entity_opd.live_consult,
          Entity_opd.payment_mode,
          Entity_opd.bp,
          Entity_opd.height,
          Entity_opd.weight,
          Entity_opd.pulse,
          Entity_opd.temperature,
          Entity_opd.respiration,
          Entity_opd.casualty,
          Entity_opd.refference,
          Entity_opd.spo2
        ])

      const [shift_id] = await this.connection.query(
        `SELECT id 
   FROM doctor_shift 
   WHERE staff_id = ? 
     AND day = DAYNAME(?) 
     AND ? BETWEEN start_time AND end_time;`,
        [
          Entity_opd.cons_doctor,
          Entity_opd.appointment_date,
          Entity_opd.time,
        ]
      );
      if (!shift_id || Object.keys(shift_id).length === 0) {
        console.error('Error: No shift ID found for the given staff.');
        return [{
          status: "failed",
          error: 'No shift ID found for the given staff.'
        }];
      }
      let position;
      if (Entity_opd.date) {
        if (HOStransaction_id) {
          const getLastPosition = await this.connection.query(`select position from
         appointment_queue where date(date) = ? and staff_id = ? and shift_id = ?  ORDER BY position DESC `, [
            Entity_opd.appointment_date,
            Entity_opd.cons_doctor,
            shift_id.id
          ])
          if (getLastPosition.length !== 0) {
            position = getLastPosition[0].position + 1
          } else {
            position = 1
          }
        }

      }

      try {
        await this.connection.query(`insert into appointment_queue(
    staff_id,
        position,
    shift_id,
    date,
    opd_id
    ) values (?,?,?,?,?)`, [
          Entity_opd.cons_doctor,
          position,
          shift_id.id,
          Entity_opd.date,
          HOSopdccreate
        ])

      } catch (error) {
        console.log("eeee", error);
        return error
      }
      // ##################################################################################################################################################################

      let transaction_id: number

      const caseRef = await this.dynamicConnection.query('INSERT INTO case_references values(default,default)')
      const opdCreate = await this.dynamicConnection.query(`
    insert into opd_details (case_reference_id,patient_id,Hospital_id,hos_opd_id) values (?,?,?,?)`, [
        caseRef.insertId,
        HOSpatientId,
        Entity_opd.Hospital_id,
        HOSopdCreate.insertId
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
        opd_id
    
    ) values
    (?,?,?,?,?,?,?,?,?,?)`, [
        'payment',
        'Appointment',
        HOSpatientId,
        caseRef.insertId,
        HOSamount[0].amount,
        Entity_opd.payment_mode,
        Entity_opd.payment_date,
        Entity_opd.Hospital_id,
        HOStransactions.insertId,
        opdCreate.insertId,

      ])
      transaction_id = transactions.insertId
      const Patient_charges = await this.dynamicConnection.query(
        `insert into patient_charges(
      date,
      opd_id,
      Hospital_id,
      hos_patient_charges_id,
      amount,
      payment_status,
      transaction_id,
      patient_id
      ) values(?,?,?,?,?,?,?,?)`, [
        Entity_opd.date,
        opdCreate.insertId,
        Entity_opd.Hospital_id,
        HOSPatient_charges.insertId,
        HOSamount[0].amount,
        payment_status,
        transactions.insertId,
        HOSpatientId
      ]
      )

      await this.dynamicConnection.query(`
        insert into visit_details(
          opd_details_id,
          patient_charge_id,
          transaction_id,
          case_type,
          cons_doctor,
          appointment_date,
          live_consult,
          payment_mode,
          bp,
          height,
          weight,
          pulse,
          temperature,
          respiration,
          casualty,
          refference,
          spo2,
          Hospital_id,
          hos_visit_id
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

        [
          opdCreate.insertId,
          Patient_charges.insertId,
          transaction_id,
          Entity_opd.case_type,
          adminStaffId,
          Entity_opd.date + " " + Entity_opd.time,
          Entity_opd.live_consult,
          Entity_opd.payment_mode,
          Entity_opd.bp,
          Entity_opd.height,
          Entity_opd.weight,
          Entity_opd.pulse,
          Entity_opd.temperature,
          Entity_opd.respiration,
          Entity_opd.casualty,
          Entity_opd.refference,
          Entity_opd.spo2,
          Entity_opd.Hospital_id,
          HOSvisitInsert.insertId
        ]
      )
      const [admin_shift_id] = await this.dynamicConnection.query(
        `SELECT id 
     FROM doctor_shift 
     WHERE 
        Hospital_id = ? 
       AND hospital_doctor_shift_id = ?`,
        [
          Entity_opd.Hospital_id,
          shift_id.id
        ]
      );

      await this.dynamicConnection.query(`insert into appointment_queue(
    staff_id,
    shift_id,
    position,
    date,
    opd_id
    ) values (?,?,?,?,?)`, [
        adminStaffId,
        admin_shift_id.id,
        position,
        Entity_opd.date,
        opdCreate.insertId
      ])



      const output = `SELECT distinct
    visit_details.id AS id, 
    patients.patient_name AS name, 
    patients.id AS PT_id, 
    CONCAT(patients.age, ' years') AS age, 
    patients.gender, 
    patients.image,
    CONCAT('OPN', visit_details.opd_details_id) AS OP_NO, 
    patients.mobileno, 
    patients.dial_code, 
    CONCAT('Dr. ', staff.name, ' ', staff.surname) AS consultant,
    visit_details.cons_doctor AS doctor_id, 
   concat(doctor_shift.start_time,'-',doctor_shift.end_time) as time_slot,
    patients.abha_address, 
    patient_charges.amount AS apptFees,    
    visit_details.appointment_date,
        opd_status.status
FROM 
    visit_details 
    left join opd_details ON visit_details.opd_details_id = opd_details.id
    left join patients ON opd_details.patient_id = patients.id
LEFT JOIN 
    patient_charges ON patient_charges.id = visit_details.patient_charge_id
LEFT JOIN 
    staff ON staff.id = visit_details.cons_doctor
LEFT JOIN 
   doctor_shift on  visit_details.cons_doctor = doctor_shift.staff_id
   and dayname(visit_details.appointment_date) = doctor_shift.day
   and time(visit_details.appointment_date) >= time(doctor_shift.start_time) 
   and time(visit_details.appointment_date) <= time(doctor_shift.end_time) 
      LEFT JOIN opd_status on opd_status.opd_id = opd_details.id
where visit_details.opd_details_id = ?
GROUP BY visit_details.id`
      const lava = await this.connection.query(output, [HOSopdCreate.insertId])
      return [{
        "status": "success",
        "message": "opd details added successfully",
        "inserted_details ": lava
      }];
    } catch (error) {

      return error
    }
  }


  async findAll(date: Date) {
    const formattedDate = date.toISOString().split('T')[0];
    const Emr_opd_details = await this.connection.query(
      `
    SELECT distinct
    visit_details.id AS id, 
    patients.patient_name AS name, 
    patients.id AS PT_id, 
    CONCAT(patients.age, ' years') AS age, 
    patients.gender, 
    patients.image,
    CONCAT('OPN', visit_details.opd_details_id) AS OP_NO, 
    patients.mobileno, 
    patients.dial_code, 
    CONCAT('Dr. ', staff.name, ' ', staff.surname) AS consultant,
    visit_details.cons_doctor AS doctor_id, 
   concat(doctor_shift.start_time,'-',doctor_shift.end_time) as time_slot,
    patients.abha_address, 
    patient_charges.amount AS apptFees,    
    visit_details.appointment_date,
    opd_status.status,
    appointment_queue.position

FROM 
    visit_details 
    left join opd_details ON visit_details.opd_details_id = opd_details.id
    left join patients ON opd_details.patient_id = patients.id
LEFT JOIN 
    patient_charges ON patient_charges.id = visit_details.patient_charge_id
LEFT JOIN 
    staff ON staff.id = visit_details.cons_doctor
LEFT JOIN 
   doctor_shift on  visit_details.cons_doctor = doctor_shift.staff_id
   and dayname(visit_details.appointment_date) = doctor_shift.day
   and time(visit_details.appointment_date) >= time(doctor_shift.start_time) 
   and time(visit_details.appointment_date) <= time(doctor_shift.end_time) 
    LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
    Left join appointment_queue on appointment_queue.opd_id = opd_details.id

    WHERE 
        DATE(visit_details.appointment_date) = ?
    GROUP BY 
        visit_details.id, 
        patients.id;
    `,
      [formattedDate]
    );
    return Emr_opd_details;
  }



  async find() {
    const emr_details = await this.connection.query(`
    SELECT distinct
    visit_details.id AS id, 
    patients.patient_name AS name, 
    patients.id AS PT_id, 
    CONCAT(patients.age, ' years') AS age, 
    patients.gender, 
    patients.image,
    CONCAT('OPN', visit_details.opd_details_id) AS OP_NO, 
    patients.mobileno, 
    patients.dial_code, 
    CONCAT('Dr. ', staff.name, ' ', staff.surname) AS consultant,
    visit_details.cons_doctor AS doctor_id, 
    CONCAT(doctor_shift.start_time,'-',doctor_shift.end_time) AS time_slot,
    patients.abha_address, 
    patient_charges.amount AS apptFees,    
    visit_details.appointment_date,
    opd_status.status,
    appointment_queue.position
FROM 
    visit_details 
    LEFT JOIN opd_details ON visit_details.opd_details_id = opd_details.id
    LEFT JOIN patients ON opd_details.patient_id = patients.id
    LEFT JOIN patient_charges ON patient_charges.id = visit_details.patient_charge_id
    LEFT JOIN staff ON staff.id = visit_details.cons_doctor
    LEFT JOIN doctor_shift ON visit_details.cons_doctor = doctor_shift.staff_id
        AND DAYNAME(visit_details.appointment_date) = doctor_shift.day
        AND TIME(visit_details.appointment_date) >= TIME(doctor_shift.start_time) 
        AND TIME(visit_details.appointment_date) <= TIME(doctor_shift.end_time)
    LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
        Left join appointment_queue on appointment_queue.opd_id = opd_details.id
    `)
    return emr_details;
  }


  async findone(id: number) {
    const get_emr_details = await this.connection.query(` 
         SELECT distinct
    visit_details.id AS id, 
    patients.patient_name AS name, 
    patients.id AS PT_id, 
    CONCAT(patients.age, ' years') AS age, 
    patients.gender, 
    patients.image,
    CONCAT('OPN', visit_details.opd_details_id) AS OP_NO, 
    patients.mobileno, 
    patients.dial_code, 
    CONCAT('Dr. ', staff.name, ' ', staff.surname) AS consultant,
    visit_details.cons_doctor AS doctor_id, 
    CONCAT(doctor_shift.start_time,'-',doctor_shift.end_time) AS time_slot,
    patients.abha_address, 
    patient_charges.amount AS apptFees,    
    visit_details.appointment_date,
    opd_status.status,
    appointment_queue.position

FROM 
    visit_details 
    LEFT JOIN opd_details ON visit_details.opd_details_id = opd_details.id
    LEFT JOIN patients ON opd_details.patient_id = patients.id
    LEFT JOIN patient_charges ON patient_charges.id = visit_details.patient_charge_id
    LEFT JOIN staff ON staff.id = visit_details.cons_doctor
    LEFT JOIN doctor_shift ON visit_details.cons_doctor = doctor_shift.staff_id
        AND DAYNAME(visit_details.appointment_date) = doctor_shift.day
        AND TIME(visit_details.appointment_date) >= TIME(doctor_shift.start_time) 
        AND TIME(visit_details.appointment_date) <= TIME(doctor_shift.end_time)
    LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
        Left join appointment_queue on appointment_queue.opd_id = opd_details.id

   where visit_details.opd_details_id = ?`, [id])
    return get_emr_details;
  }


  async update(id: number, opd_entity: EmrOpdOutPatient) {
    try {

      const [getHosTransc] = await this.connection.query(`select transaction_id,id from visit_details where opd_details_id = ?`, [id])
      await this.connection.query(`update transactions set amount = ?,
    payment_mode = ?,
    note = ?,
    payment_date = ? 
    where id = ?`, [
        opd_entity.amount,
        opd_entity.payment_mode,
        opd_entity.note,
        opd_entity.payment_date,
        getHosTransc.transaction_id
      ])
      await this.connection.query(`update visit_details set height = ?,
    weight = ?,
    pulse = ?,
    bp = ?,
    temperature = ?,
    respiration = ?,
    known_allergies = ?,
    symptoms_type = ?,
    symptoms = ?,
    note = ?,
    appointment_date = ?,
    case_type = ?,
    casualty = ?,
    patient_old = ?, 
    organisation_id = ?,
    refference = ?,
    cons_doctor = ?
    where id = ?`, [
        opd_entity.height,
        opd_entity.weight,
        opd_entity.pulse,
        opd_entity.bp,
        opd_entity.temperature,
        opd_entity.respiration,
        opd_entity.known_allergies,
        opd_entity.symptoms_type,
        opd_entity.symptoms,
        opd_entity.note,
        opd_entity.appointment_date,
        opd_entity.case_type,
        opd_entity.casualty,
        opd_entity.patient_old,
        opd_entity.organisation_id,
        opd_entity.refference,
        opd_entity.cons_doctor,
        getHosTransc.id
      ])
      const [getHosDoccMail] = await this.connection.query(`select email from staff where id = ?`, [opd_entity.cons_doctor])

      console.log(opd_entity.Hospital_id, id, "opd_entity.Hospital_id,id");


      const [getAdminOpd] = await this.dynamicConnection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [opd_entity.Hospital_id, id])



      const [getAdminTrans] = await this.dynamicConnection.query(`select id,transaction_id from visit_details where opd_details_id = ?`, [getAdminOpd.id])

      const [getAdminOrg] = await this.dynamicConnection.query(`select id from organisation where Hospital_id = ? and hos_organisation_id = ?`, [opd_entity.Hospital_id, opd_entity.organisation_id])

      const [getAdminDocId] = await this.dynamicConnection.query(`select id from staff where email = ?`, [getHosDoccMail.email])

      await this.dynamicConnection.query(`update transactions set amount = ?,
payment_mode = ?,
note = ?,
payment_date = ? 
where id = ?`, [
        opd_entity.amount,
        opd_entity.payment_mode,
        opd_entity.note,
        opd_entity.payment_date,
        getAdminTrans.transaction_id
      ])

      await this.dynamicConnection.query(`update visit_details set height = ?,
weight = ?,
pulse = ?,
bp = ?,
temperature = ?,
respiration = ?,
known_allergies = ?,
symptoms_type = ?,
symptoms = ?,
note = ?,
appointment_date = ?,
case_type = ?,
casualty = ?,
patient_old = ?, 
organisation_id = ?,
refference = ?,
cons_doctor = ?
where id = ?`, [
        opd_entity.height,
        opd_entity.weight,
        opd_entity.pulse,
        opd_entity.bp,
        opd_entity.temperature,
        opd_entity.respiration,
        opd_entity.known_allergies,
        opd_entity.symptoms_type,
        opd_entity.symptoms,
        opd_entity.note,
        opd_entity.appointment_date,
        opd_entity.case_type,
        opd_entity.casualty,
        opd_entity.patient_old,
        getAdminOrg.id,
        opd_entity.refference,
        getAdminDocId.id,
        getAdminTrans.id
      ])
      return [{
        "status": "success",
        "messege": "opd updated successfully",
        "updated_details": await this.connection.query('select * from opd_details where id = ?', [id])
      }];
    } catch (error) {
      return "error is : " + error
    }
  }


  async opd_status_update(opd_entity: EmrOpdOutPatient) {

    try {
      let b = await opd_entity.updateValues
      for (const changes of b) {
        let appt_status
        let appt_status_id
        if (changes.status == 'InProcess') {
          appt_status = changes.status
          appt_status_id = 5
        }
        if (changes.status == 'Completed') {
          appt_status = changes.status
          appt_status_id = 6
        }
        await this.connection.query(`update opd_status SET status = ? where opd_id = ?`, [
          changes.status,
          changes.id
        ])

        const [getadminopdID] = await this.dynamicConnection.query(`select id from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          opd_entity.Hospital_id,
          changes.id
        ])


        if (getadminopdID) {
          await this.dynamicConnection.query(`update opd_status SET 
          status = ? where opd_id = ?`, [
            changes.status,
            getadminopdID.id
          ])
        }

        const [visit_details] = await this.connection.query(`select id from visit_details where visit_details.opd_details_id = ?`, [
          changes.id
        ])
        const [getAppt_id] = await this.connection.query(`select id from appointment where visit_details_id = ?`, [
          visit_details.id
        ])
        if (getAppt_id) {
          const [getApptAdmin] = await this.dynamicConnection.query(`select id from appointment where Hospital_id = ? and hos_appointment_id = ?`, [
            opd_entity.Hospital_id,
            getAppt_id.id
          ]);
          await this.connection.query(`update appointment set appointment_status = ?,appointment_status_id = ? where id = ?`, [
            appt_status,
            appt_status_id,
            getAppt_id.id
          ])
          await this.dynamicConnection.query(`update appointment set appointment_status = ?,appointment_status_id = ? where id = ?`, [
            appt_status,
            appt_status_id,
            getApptAdmin.id
          ])
        }
      }

      return [{
        "data ": {
          status: "success",
          "messege": "opd status details updated successfully inserted",
        }
      }];

    } catch (error) {
      return error
    }
  }




  async opd_findCountWithPercentage(date: string) {
    try {
      const [totalcountquery] = await this.connection.query(
        ` SELECT COUNT(*) total
      FROM opd_details 
      LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
      WHERE date(visit_details.appointment_date) = date(?)`,
        [date]
      );

      const [except_completedquery] = await this.connection.query(
        `
      SELECT COUNT(*) AS pending_count
      FROM opd_details 
      LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
      LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
      WHERE DATE(visit_details.appointment_date) = DATE(?)
      AND opd_status.status <> 'Completed'`,
        [date]
      );

      const [completedquery] = await this.connection.query(
        `
      SELECT COUNT(*) AS completed
      FROM opd_details 
      LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
      LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
      WHERE DATE(visit_details.appointment_date) = DATE(?)
      AND opd_status.status = 'Completed'`,
        [date]
      );

      console.log("todayQuery", totalcountquery, except_completedquery, completedquery);


      const [yesterday_opd] = await this.connection.query(`
           SELECT COUNT(*) total
      FROM opd_details 
      LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
      WHERE date(visit_details.appointment_date) = DATE_SUB(?, INTERVAL 1 DAY);
    `, [date])

      const [yesterday_pending] = await this.connection.query(`
       SELECT COUNT(*) AS pending_count
FROM opd_details 
LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
WHERE DATE(visit_details.appointment_date) = DATE_SUB(?, INTERVAL 1 DAY)
AND opd_status.status <> 'Completed';
      `, [date])

      const [yesterday_completed] = await this.connection.query(`
          SELECT COUNT(*) AS completed
      FROM opd_details 
      LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
      LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
      WHERE DATE(visit_details.appointment_date) = DATE_SUB(?, INTERVAL 1 DAY)
      AND opd_status.status = 'Completed'
        `, [date])
      const today_OPD_percentage = (((totalcountquery.total - yesterday_opd.total) * 100) / yesterday_opd.total);
      const pending_opd_percentage = (((except_completedquery.pending_count - yesterday_pending.pending_count) * 100) / yesterday_pending.pending_count)
      const completed_opd_percentage = (((completedquery.completed - yesterday_completed.completed) * 100) / yesterday_completed.completed)

      return {
        totalcountquery,
        except_completedquery,
        completedquery,
        yesterday_opd,
        yesterday_pending,
        yesterday_completed,
        today_OPD_percentage,
        pending_opd_percentage,
        completed_opd_percentage
      };
    } catch (error) {
      console.error("Error in findCountWithPercentage:", error);
      throw error;
    }
  }
}




