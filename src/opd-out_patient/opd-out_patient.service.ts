import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OpdOutPatient } from './entities/opd-out_patient.entity';
import { CountDto } from './opd-out_patient.dto';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class OpdOutPatientService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async create(opd_entity: OpdOutPatient) {
    if (
      !opd_entity.received_by_name ||
      opd_entity.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }
    try {
      const HOSpatient = await this.connection.query(
        'select * from patients where id =?',
        [opd_entity.patient_id],
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
            HOSpatient[0].mobile_no,
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
        [opd_entity.cons_doctor],
      );
      const [adminStaff] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [staffEmailInHOS.email],
      );
      let adminStaffId = adminStaff.id;
      let HOStransaction_id: number;
      const currentdate = new Date();
      const formattedDate = currentdate.toISOString().split('T')[0];
      let position;
      const currentTimeInIndia = new Date().toLocaleTimeString('en-IN', {
        hour12: false,
        timeZone: 'Asia/Kolkata',
      });
      const global_shift_id = await this.connection.query(
        `SELECT id
          FROM global_shift
          WHERE start_time <= ?
            AND end_time >= ?`,
        [currentTimeInIndia, currentTimeInIndia],
      );

      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const today = new Date();
      const dayOfWeek = daysOfWeek[today.getDay()];
      const shift_idd = await this.connection.query(
        `SELECT id
            FROM doctor_shift
            WHERE staff_id = ?
            AND start_time <= ?
              AND end_time >= ?
              AND day = ?`,
        [opd_entity.cons_doctor, opd_entity.time, opd_entity.time, dayOfWeek],
      );

      if (shift_idd.length == 0) {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.DOCTOR_NOT_AVAILABLE,
        };
      }

      const [check_duplicate] = await this.connection.query(
        `select * from appointment where patient_id = ? and date = ? and shift_id = ? and doctor = ?`,
        [
          opd_entity.patient_id,
          opd_entity.date,
          shift_idd[0].id,
          opd_entity.cons_doctor,
        ],
      );

      if (!check_duplicate) {
        const HOScaseRef = await this.connection.query(
          'INSERT INTO case_references () values(default,default)',
        );
        const HOSopdCreate = await this.connection.query(
          `
insert into opd_details (case_reference_id,patient_id) values (?,?)`,
          [HOScaseRef.insertId, opd_entity.patient_id],
        );

        const HOSopdccreate = HOSopdCreate.insertId;
        const HOSamount = await this.connection.query(
          `
select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
(charges.standard_charge*((tax_category.percentage)/100))),2) amount from
charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ?`,
          [opd_entity.charge_id],
        );

        let HOspatient_charges_id;
        let payment_status;
        if (
          opd_entity.payment_mode.toLocaleLowerCase() == `cash` ||
          opd_entity.payment_mode.toLocaleLowerCase() == `upi` ||
          opd_entity.payment_mode.toLocaleLowerCase() == `cheque` ||
          opd_entity.payment_mode.toLowerCase() == `online`
        ) {
          payment_status = `paid`;
        } else {
          payment_status = `unpaid`;
        }

        const HOSPatient_charges = await this.connection.query(
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
patient_id,
total
) values(?,?,?,?,?,?,?,?,?,?,?)`,
          [
            opd_entity.date,
            HOSopdccreate,
            1,
            opd_entity.charge_id,
            HOSamount[0].standard_charge,
            HOSamount[0].tax_percentage,
            opd_entity.apply_charge,
            // HOSamount[0].amount,
            opd_entity.amount,
            payment_status,
            opd_entity.patient_id,
            opd_entity.amount,
          ],
        );

        HOspatient_charges_id = HOSPatient_charges.insertId;

        let HOStransactions;
        let HOStransaction_id;
        if (
          opd_entity.payment_mode.toLocaleLowerCase() != 'paylater' &&
          opd_entity.payment_mode.toLocaleLowerCase() != 'offline'
        ) {
          HOStransactions = await this.connection.query(
            ` 
        insert into transactions (
        type,
        opd_id,
        section,
        patient_id,
        case_reference_id,
        amount,
        payment_mode,
        payment_date,
        payment_gateway,
        payment_id,
        payment_reference_number,
        received_by_name
        ) values
        (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              'payment',
              HOSopdCreate.insertId,
              'OPD',
              opd_entity.patient_id,
              HOScaseRef.insertId,
              // HOSamount[0].amount,
              opd_entity.amount,
              opd_entity.payment_mode,
              opd_entity.payment_date,
              opd_entity.payment_gateway,
              opd_entity.payment_id,
              opd_entity.payment_reference_number,
              opd_entity.received_by_name,
            ],
          );
          HOStransaction_id = HOStransactions.insertId;

          await this.connection.query(
            `update patient_charges set transaction_id = ? where id = ?`,
            [HOStransaction_id, HOSPatient_charges.insertId],
          );
        }

        const HOSvisitInsert = await this.connection.query(
          `
insert into visit_details(
opd_details_id,
organisation_id,
patient_charge_id,
transaction_id,
case_type,
cons_doctor,
appointment_date,
live_consult,
payment_mode,
symptoms_type,
symptoms,
bp,
height,
weight,
pulse,
temperature,
respiration,
known_allergies,
note,
patient_old,
casualty,
refference,
spo2
) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            HOSopdCreate.insertId,
            opd_entity.organisation_id,
            HOspatient_charges_id,
            HOStransaction_id,
            opd_entity.case_type,
            opd_entity.cons_doctor,
            opd_entity.date + ' ' + opd_entity.time,
            opd_entity.live_consult,
            opd_entity.payment_mode,
            opd_entity.symptoms_type,
            opd_entity.symptoms,
            opd_entity.bp,
            opd_entity.height,
            opd_entity.weight,
            opd_entity.pulse,
            opd_entity.temperature,
            opd_entity.respiration,
            opd_entity.known_allergies,
            opd_entity.note,
            opd_entity.patient_old,
            opd_entity.casualty,
            opd_entity.refference,
            opd_entity.spo2,
          ],
        );

        if (opd_entity.date == formattedDate) {
          if (HOStransaction_id) {
            const getLastPosition = await this.connection.query(
              `select position from
appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `,
              [opd_entity.date, opd_entity.cons_doctor, shift_idd[0].id],
            );
            if (getLastPosition.length !== 0) {
              position = getLastPosition[0].position + 1;
            } else {
              position = 1;
            }
          } else {
            // position = null;
            const getLastPosition = await this.connection.query(
              `select position from
appointment_queue where date(date) = ? and staff_id = ? and shift_id = ? ORDER BY position DESC `,
              [opd_entity.date, opd_entity.cons_doctor, shift_idd[0].id],
            );
            if (getLastPosition.length !== 0) {
              position = getLastPosition[0].position + 1;
            } else {
              position = 1;
            }
          }
        } else {
          position = null;
        }

        const Hosappointment = await this.connection.query(
          `insert into appointment (
patient_id,
module,
case_reference_id,
visit_details_id,
date,
time,
doctor,
source,
amount,
message,
appointment_status_id,
appointment_status,
global_shift_id,
shift_id
) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            opd_entity.patient_id,
            'OPD',
            HOScaseRef.insertId,
            HOSvisitInsert.insertId,
            opd_entity.date,
            opd_entity.time,
            opd_entity.cons_doctor,
            'offline',
            opd_entity.amount,
            opd_entity.message,
            3,
            'Approved',
            global_shift_id[0].id,
            shift_idd[0].id,
          ],
        );
        const hos_appointment_id = Hosappointment.insertId;

        await this.connection.query(
          `insert into appointment_queue(
appointment_id,
staff_id,
shift_id,
position,
date) values (?,?,?,?,?)`,
          [
            Hosappointment.insertId,
            opd_entity.cons_doctor,
            shift_idd[0].id,
            position,
            opd_entity.date,
          ],
        );

        let payment_type;
        if (opd_entity.payment_mode === `Cash`) {
          payment_type = `Offline`;
        } else {
          payment_type = `UPI`;
        }
        await this.connection.query(
          `insert into
    appointment_payment(appointment_id,
    charge_id,
    paid_amount,
    payment_mode,
    payment_type,
    transaction_id,
    date) values (?,?,?,?,?,?,?)`,
          [
            Hosappointment.insertId,
            opd_entity.charge_id,
            opd_entity.amount,
            opd_entity.payment_mode,
            payment_type,
            HOStransaction_id,
            opd_entity.date + ' ' + opd_entity.time,
          ],
        );
        if (HOStransaction_id) {
          await this.connection.query(
            `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
            [Hosappointment.insertId, HOStransaction_id],
          );
        }

        // ##################################################################################################################################################################
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
            opd_entity.Hospital_id,
            HOSopdCreate.insertId,
          ],
        );
        let insertOPDID = opdCreate.insertId;
        const [getAdminChargeId] = await this.dynamicConnection.query(
          `select id  from charges
where Hospital_id = ? and hospital_charges_id = ?`,
          [opd_entity.Hospital_id, opd_entity.charge_id],
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
payment_status,
patient_id,
total,
Hospital_id,hos_patient_charges_id
) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            opd_entity.date,
            insertOPDID,
            1,
            getAdminChargeId.id,
            HOSamount[0].standard_charge,
            HOSamount[0].tax_percentage,
            opd_entity.apply_charge,
            opd_entity.amount,
            payment_status,
            HOSpatientId,
            opd_entity.amount,
            opd_entity.Hospital_id,
            HOSPatient_charges.insertId,
          ],
        );
        const adminpatient_charges_id = Patient_charges.insertId;

        let adminTransaction_idd;
        try {
          // if (Number(HOStransaction_id) > 0)
          if (
            opd_entity.payment_mode.toLocaleLowerCase() != 'paylater' &&
            opd_entity.payment_mode.toLocaleLowerCase() != 'offline'
          ) {
            const transactionss = await this.dynamicConnection.query(
              `
insert into transactions (
type,
opd_id,
section,
patient_id,
case_reference_id,
amount,
payment_mode,
payment_gateway,
payment_id,
payment_reference_number,
payment_date,Hospital_id,
hos_transaction_id,
patient_charges_id,
received_by_name
) values
(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                'payment',
                insertOPDID,
                'OPD',
                HOSpatientId,
                caseRef.insertId,
                opd_entity.amount,
                opd_entity.payment_mode,
                opd_entity.payment_gateway,
                opd_entity.payment_id,
                opd_entity.payment_reference_number,
                opd_entity.payment_date,
                opd_entity.Hospital_id,
                HOStransactions.insertId,
                Patient_charges.insertId,
                opd_entity.received_by_name,
              ],
            );
            adminTransaction_idd = transactionss.insertId;
            await this.dynamicConnection.query(
              `update patient_charges set transaction_id = ? where id = ?`,
              [adminTransaction_idd, adminpatient_charges_id],
            );
          }
        } catch (error) {
          throw new HttpException(
            {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ADMIN_TRANSACTION_ERROR,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        let organisation_id;
        if (opd_entity.organisation_id) {
          [organisation_id] = await this.dynamicConnection.query(
            `select id from organisation
where Hospital_id = ? and hos_organisation_id = ?`,
            [opd_entity.Hospital_id, opd_entity.organisation_id],
          );
        } else {
          organisation_id = { id: null };
        }
        const visitInsert = await this.dynamicConnection.query(
          `
insert into visit_details(
opd_details_id,
organisation_id,
patient_charge_id,
transaction_id,
case_type,
cons_doctor,
appointment_date,
live_consult,
payment_mode,
symptoms_type,
symptoms,
bp,
height,
weight,
pulse,
temperature,
respiration,
known_allergies,
note,
 patient_old,
casualty,
refference,
Hospital_id,
hos_visit_id,
spo2
) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

          [
            opdCreate.insertId,
            organisation_id.id,
            adminpatient_charges_id,
            adminTransaction_idd,
            opd_entity.case_type,
            adminStaffId,
            opd_entity.date + ' ' + opd_entity.time,
            opd_entity.live_consult,
            opd_entity.payment_mode,
            opd_entity.symptoms_type,
            opd_entity.symptoms,
            opd_entity.bp,
            opd_entity.height,
            opd_entity.weight,
            opd_entity.pulse,
            opd_entity.temperature,
            opd_entity.respiration,
            opd_entity.known_allergies,
            opd_entity.note,
            opd_entity.patient_old,
            opd_entity.casualty,
            opd_entity.refference,
            opd_entity.Hospital_id,
            HOSvisitInsert.insertId,
            opd_entity.spo2,
          ],
        );

        const admin_Hosappointment_opd = await this.dynamicConnection.query(
          `insert into appointment (
patient_id,
module,
case_reference_id,
visit_details_id,
date,
time,
doctor,
source,
amount,
message,
appointment_status_id,
appointment_status,
Hospital_id,
  hos_appointment_id
) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            HOSpatientId,
            'OPD',
            caseRef.insertId,
            visitInsert.insertId,
            opd_entity.date,
            opd_entity.time,
            adminStaffId,
            'offline',
            opd_entity.amount,
            opd_entity.message,
            3,
            'Approved',
            opd_entity.Hospital_id,
            hos_appointment_id,
          ],
        );

        const [opdadminShiftId] = await this.dynamicConnection.query(
          `select * from doctor_shift where Hospital_id = ? and
    hospital_doctor_shift_id = ?`,
          [opd_entity.Hospital_id, shift_idd[0].id],
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
            admin_Hosappointment_opd.insertId,
            adminStaffId,
            opdadminShiftId.id,
            position,
            opd_entity.date,
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
            admin_Hosappointment_opd.insertId,
            getAdminChargeId.id,
            opd_entity.amount,
            opd_entity.payment_mode,
            payment_type,
            adminTransaction_idd,
            opd_entity.date + ' ' + opd_entity.time,
          ],
        );

        if (transaction_id) {
          await this.dynamicConnection.query(
            `update transactions set transactions.appointment_id = ? where transactions.id = ?`,
            [admin_Hosappointment_opd.insertId, HOStransaction_id],
          );
        }

        return [
          {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.OPD,
            'inserted_details ': await this.connection.query(
              'select * from opd_details where id = ?',
              [HOSopdCreate.insertId],
            ),
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

  async findAll() {
    try {
      const opd_details = await this.connection.query(`
      SELECT DISTINCT
    p.patient_name,
    p.id,
    p.guardian_name,
    p.mobileno,
    p.gender,
    COUNT(vd.id) AS totalrecheckup,
    MAX(vd.appointment_date) AS last_consultation,
    CONCAT(s.name, ' ', s.surname, '(', s.employee_id, ')') AS doctor
FROM
    opd_details od
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN staff s ON s.id = vd.cons_doctor
LEFT JOIN patients p ON p.id = od.patient_id
GROUP BY
    p.patient_name,
    p.id,
    p.guardian_name,
    p.mobileno,
    p.gender
ORDER BY
    p.patient_name;
`);
      return opd_details;
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

  async findOne(search: string) {
    try {
      let query = `SELECT distinct
      patients.patient_name,
      patients.id,
      patients.guardian_name,
      patients.mobileno,patients.gender,
      (SELECT COUNT(*)
    FROM visit_details
    LEFT JOIN opd_details ON visit_details.opd_details_id = opd_details.id
    LEFT JOIN patients ON opd_details.patient_id = patients.id) AS totalrecheckup,
      (SELECT  visit_details.appointment_date
       FROM visit_details
       JOIN staff ON staff.id = visit_details.cons_doctor
       ORDER BY visit_details.appointment_date DESC LIMIT 1
      ) AS last_consultation,
      (SELECT  concat(staff.name," ",staff.surname,"(",staff.employee_id,")")
       FROM visit_details
       JOIN staff ON staff.id = visit_details.cons_doctor
       ORDER BY visit_details.appointment_date DESC LIMIT 1
      ) AS doctor
    FROM
      opd_details
    LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
    LEFT JOIN staff ON staff.id = visit_details.cons_doctor
    LEFT JOIN patients ON patients.id = opd_details.patient_id
    `;
      let values = [];
      if (search) {
        query += ` where patients.patient_name like ? or staff.name like ? or patients.guardian_name like ? or patients.gender like ? or patients.mobileno like ? `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }
      const opd_details = await this.connection.query(query, values);
      return opd_details;
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

  async update(id: number, opd_entity: OpdOutPatient) {
    if (
      !opd_entity.received_by_name ||
      opd_entity.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }
    try {
      const [getHosTransc] = await this.connection.query(
        `select transaction_id,id from visit_details where opd_details_id = ?`,
        [id],
      );
      await this.connection.query(
        `update transactions set amount = ?,
    payment_mode = ?,
    note = ?,
    payment_date = ?,
    received_by_name = ?
    where id = ?`,
        [
          opd_entity.amount,
          opd_entity.payment_mode,
          opd_entity.note,
          opd_entity.payment_date,
          opd_entity.received_by_name,
          getHosTransc.transaction_id,
        ],
      );
      await this.connection.query(
        `update visit_details set height = ?,
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
    cons_doctor = ?,
    spo2 = ?
    where id = ?`,
        [
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
          opd_entity.spo2,
          getHosTransc.id,
        ],
      );
      console.log('aaaa');

      const [getHosDoccMail] = await this.connection.query(
        `select email from staff where id = ?`,
        [opd_entity.cons_doctor],
      );
      const [getAdminOpd] = await this.dynamicConnection.query(
        `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
        [opd_entity.Hospital_id, id],
      );
      const [getAdminTrans] = await this.dynamicConnection.query(
        `select id,transaction_id from visit_details where opd_details_id = ?`,
        [getAdminOpd.id],
      );
      console.log('bbbb');

      let getAdminOrg;
      if (opd_entity.organisation_id) {
        [getAdminOrg] = await this.dynamicConnection.query(
          `select id from organisation where Hospital_id = ? and hos_organisation_id = ?`,
          [opd_entity.Hospital_id, opd_entity.organisation_id],
        );
      } else {
        getAdminOrg = { id: null };
      }
      const [getAdminDocId] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [getHosDoccMail.email],
      );
      console.log('cccc');

      await this.dynamicConnection.query(
        `update transactions set amount = ?,
payment_mode = ?,
note = ?,
payment_date = ?,
received_by_name = ?
where id = ?`,
        [
          opd_entity.amount,
          opd_entity.payment_mode,
          opd_entity.note,
          opd_entity.payment_date,
          opd_entity.received_by_name,
          getAdminTrans.transaction_id,
        ],
      );
      console.log('ddd');

      const updateAdminVisit = await this.dynamicConnection.query(
        `update visit_details set height = ?,
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
cons_doctor = ?,
spo2 = ?
where id = ?`,
        [
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
          opd_entity.spo2,
          getAdminTrans.id,
        ],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.OPD_UPDATED,
          updated_details: await this.connection.query(
            'select * from opd_details where id = ?',
            [id],
          ),
        },
      ];
      console.log('eeee');
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

  async findTitleByType(id: number): Promise<any | null> {
    try {
      const getTitleByTypeID = await this.connection.query(
        `select * from symptoms where type = ?`,
        [id],
      );
      if (getTitleByTypeID.length === 1) {
        return getTitleByTypeID;
      } else {
        return null;
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

  async findDescByOne(id: number): Promise<any | null> {
    try {
      const getDescByID = await this.connection.query(
        `select symptoms.description from symptoms where id = ?`,
        [id],
      );
      if (getDescByID.length === 1) {
        return getDescByID;
      } else {
        return null;
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

  async remove(id: string, hos_id: number): Promise<{ [key: string]: any }[]> {
    try {
      const [existingRecord] = await this.connection.query(
        'SELECT id FROM opd_details WHERE id = ?',
        [id],
      );
      if (!existingRecord) {
        return [
          {
            status: 'error',
            message: `ID ${id} does not exist or it has been already deleted`,
          },
        ];
      }
      await this.dynamicConnection.query(
        `update opd_details set is_deleted = 1 where Hospital_id = ?
      and hos_opd_id = ?`,
        [hos_id, id],
      );
      await this.connection.query('DELETE FROM opd_details  WHERE id = ?', [
        id,
      ]);
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

  async findOpdDetailsBySearch(search: string): Promise<OpdOutPatient[]> {
    try {
      let query = `SELECT distinct patients.id,
  patients.patient_name,
  patients.guardian_name,
  patients.age,
  patients.mobileno,patients.gender,
  (SELECT COUNT(*) FROM opd_details WHERE patients.id = opd_details.patient_id) AS totalrecheckup,
  (SELECT  visit_details.appointment_date
   FROM visit_details
   JOIN staff ON staff.id = visit_details.cons_doctor
   ORDER BY visit_details.appointment_date DESC LIMIT 1
  ) AS last_consultation,
  (SELECT  concat(staff.name," ",staff.surname,"(",staff.employee_id,")")
   FROM visit_details
   JOIN staff ON staff.id = visit_details.cons_doctor
   ORDER BY visit_details.appointment_date DESC LIMIT 1
  ) AS doctor
FROM
  opd_details
LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
LEFT JOIN staff ON staff.id = visit_details.cons_doctor
LEFT JOIN patients ON patients.id = opd_details.patient_id
`;
      let values = [];
      if (search) {
        query += ` WHERE (patients.patient_name LIKE ? OR patients.id LIKE ? OR patients.guardian_name LIKE ? OR patients.gender LIKE ? OR patients.mobileno LIKE ? OR cons_doctor LIKE ? OR visit_details.appointment_date LIKE ? )  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }
      let final = query;
      const OpdSearch = await this.connection.query(final, values);
      return OpdSearch;
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

  async findopd_details(
    limit: number,
    page: number,
    search?: string,
  ): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);
      const params: any[] = [];
      let whereClause = '';

      if (search) {
        const like = `%${search}%`;
        whereClause = `
        AND (
          p.patient_name LIKE ? OR 
          p.id LIKE ? OR
          p.guardian_name LIKE ? OR
          p.mobileno LIKE ? OR
          CONCAT(s.name, ' ', s.surname) LIKE ? OR 
          s.id LIKE ?
        )
      `;
        params.push(like, like, like, like, like, like);
      }

      const opd_details = await this.connection.query(
        `
      SELECT 
  p.patient_name,
  p.mobileno,
  p.gender,
  p.id,
  p.guardian_name,
  (
    SELECT COUNT(*) 
    FROM opd_details od 
    WHERE od.patient_id = p.id
  ) AS totalrecheckup,
  CONCAT(s.name, ' ', s.surname, '(', s.id, ')') AS doctor,
  vd.appointment_date as last_consultation
FROM patients p
LEFT JOIN opd_details od ON od.patient_id = p.id
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN staff s ON s.id = vd.cons_doctor
WHERE vd.appointment_date = (
    SELECT MAX(vd2.appointment_date)
    FROM opd_details od2
    JOIN visit_details vd2 ON vd2.opd_details_id = od2.id
    WHERE od2.patient_id = p.id
) and date(vd.appointment_date) <= date(now())
     ${whereClause}
GROUP BY p.id
order by vd.appointment_date desc
      LIMIT ? OFFSET ?
    `,
        [...params, Number(limit), Number(offset)],
      );

      const totalCount = await this.connection.query(
        `
      SELECT COUNT(DISTINCT p.id) AS total_patients
      FROM opd_details od
      LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
      LEFT JOIN staff s ON s.id = vd.cons_doctor
      LEFT JOIN patients p ON p.id = od.patient_id
      ${whereClause}
    `,
        params,
      );

      const total = totalCount[0]?.total_patients || 0;

      return {
        details: opd_details,
        total: total,
        limit: limit,
      };
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

  async V3findopd_details(limit: number, page: number, search?: string) {
    try {
      const offset = limit * (page - 1);
      const params: any[] = [];
      let whereClause = '';

      if (search) {
        const like = `%${search}%`;
        whereClause = `
        AND (
          patient_name LIKE ? OR 
          id LIKE ? OR
          guardian_name LIKE ? OR
          mobileno LIKE ? OR
         
        )
      `;
        params.push(like, like, like, like);
      }

      const opd_details = await this.connection.query(
        `select count(id) total_recheckup, patient_id, max(id) id from opd_details group by patient_id limit ${limit} offset ${offset}`,
      );

      if (opd_details.length > 0) {
        const opd_id = opd_details.map((app) => app.id);
        const patient_id = opd_details.map((app) => app.patient_id);
        const [visit_details, patient] = await Promise.all([
          this.connection.query(
            `select appointment_date, opd_details_id id from visit_details where opd_details_id in(?)`,
            [opd_id],
          ),
          this.connection.query(
            `select id, patient_name, mobileno, gender, guardian_name from patients where id in(?)`,
            [patient_id],
          ),
        ]);

        console.log(visit_details, patient, 'patient');

        const patient_map = new Map(patient.map((p) => [p.id, p]));
        const visit_details_map = new Map(visit_details.map((p) => [p.id, p]));

        await Promise.all(
          opd_details.map(async (opd) => {
            opd.patient_details = patient_map.get(Number(opd.patient_id));
            opd.visit_details = visit_details_map.get(Number(opd.id));
          }),
        );
      }

      const [total] = await this.connection.query(
        `select count(distinct patient_id) total from opd_details `,
      );

      return { details: opd_details, count: total.total };
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

  async findOnebyid(id: string, hospital_id: number) {
    try {
      const opd_details = await this.connection.query(
        `
      SELECT distinct
      patients.patient_name,
      patients.id,
      patients.guardian_name,
      patients.mobileno,patients.gender,
      (SELECT COUNT(*)
    FROM visit_details
    LEFT JOIN opd_details ON visit_details.opd_details_id = opd_details.id
    LEFT JOIN patients ON opd_details.patient_id = patients.id) AS totalrecheckup,
      (SELECT  visit_details.appointment_date
       FROM visit_details
       JOIN staff ON staff.id = visit_details.cons_doctor
       ORDER BY visit_details.appointment_date DESC LIMIT 1
      ) AS last_consultation,
      (SELECT  concat(staff.name," ",staff.surname,"(",staff.employee_id,")")
       FROM visit_details
       JOIN staff ON staff.id = visit_details.cons_doctor
       ORDER BY visit_details.appointment_date DESC LIMIT 1
      ) AS doctor
    FROM
      opd_details
    LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
    LEFT JOIN staff ON staff.id = visit_details.cons_doctor
    LEFT JOIN patients ON patients.id = opd_details.patient_id
    where opd_details.id = ?
      `,
        [id],
      );

      return opd_details;
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
}
