import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalOpdOverviewVisit } from './entities/internal-opd-overview-visit.entity';
import { CountDto } from './internal-opd-overview-visits.dto';
// import { only } from "node:test";

@Injectable()
export class InternalOpdOverviewVisitsService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(InternalOpdOverviewVisit: InternalOpdOverviewVisit) {
    if (
      !InternalOpdOverviewVisit.received_by_name ||
      InternalOpdOverviewVisit.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }
    try {
      const HOSpatient = await this.connection.query(
        'select * from patients where id =?',
        [InternalOpdOverviewVisit.patient_id],
      );
      const tpa_id = await this.connection.query(
        `select organisation_id from visit_details where opd_details_id = ?`,
        [InternalOpdOverviewVisit.opd_details_id],
      );
      const tpaid = tpa_id.organisation_id;
      const patientInHos = await this.dynamicConnection.query(
        'select patients.id from patients where aayush_unique_id = ?',
        [HOSpatient[0].aayush_unique_id],
      );
      let HOSpatientId;

      if (patientInHos[0]) {
        HOSpatientId = patientInHos[0].id;
      }

      const [staffEmailInHOS] = await this.connection.query(
        `select email from staff where id = ?`,
        [InternalOpdOverviewVisit.cons_doctor],
      );

      const [adminStaff] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [staffEmailInHOS.email],
      );
      let adminStaffId = adminStaff.id;
      const [case_id] = await this.connection.query(
        `select case_reference_id from opd_details where id = ?`,
        [InternalOpdOverviewVisit.opd_details_id],
      );
      const case_ref = case_id.case_reference_id;
      let HOStransaction_id: number;

      const HOSamount = await this.connection.query(
        `
select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
  (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ?`,
        [InternalOpdOverviewVisit.charge_id],
      );

      let payment_status;
      if (
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() == 'cash' ||
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() == 'upi' ||
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() == 'cheque' ||
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() == 'online'
      ) {
        payment_status = 'paid';
      } else {
        payment_status = 'unpaid';
      }

      let HOspatient_charges_id;

      const HOSPatient_charges = await this.connection.query(
        `insert into patient_charges(
    date,
    opd_id,
    qty,
    charge_id,
    standard_charge,
    tax,
    apply_charge,
    total,
    patient_id,
    payment_status,
    amount
    ) values(?,?,?,?,?,?,?,?,?,?,?)`,
        [
          InternalOpdOverviewVisit.date,
          InternalOpdOverviewVisit.opd_details_id,
          1,
          InternalOpdOverviewVisit.charge_id,
          HOSamount[0].standard_charge,
          HOSamount[0].tax_percentage,
          InternalOpdOverviewVisit.apply_charge,
          HOSamount[0].amount,
          InternalOpdOverviewVisit.patient_id,
          payment_status,
          HOSamount[0].amount,
        ],
      );
      HOspatient_charges_id = HOSPatient_charges.insertId;

      if (
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() !==
          'paylater' &&
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() !== 'offline'
      ) {
        const HOStransactions = await this.connection.query(
          `
 insert into transactions (
  type,
  opd_id,
  section,
  patient_id,
  case_reference_id,
  patient_charges_id,
  amount,
  payment_mode,
  payment_date,
   payment_gateway,
  payment_id,
  payment_reference_number,
  received_by_name
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            'payment',
            InternalOpdOverviewVisit.opd_details_id,
            'OPD',
            InternalOpdOverviewVisit.patient_id,
            case_ref,
            HOspatient_charges_id,
            HOSamount[0].amount,
            InternalOpdOverviewVisit.payment_mode,
            InternalOpdOverviewVisit.payment_date,
            InternalOpdOverviewVisit.payment_gateway,
            InternalOpdOverviewVisit.payment_id,
            InternalOpdOverviewVisit.payment_reference_number,
            InternalOpdOverviewVisit.received_by_name,
          ],
        );
        HOStransaction_id = HOStransactions.insertId;
      }

      await this.connection.query(
        `
      update patient_charges SET transaction_id = ? where id = ?`,
        [HOStransaction_id, HOSPatient_charges.insertId],
      );

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
    note
    ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          InternalOpdOverviewVisit.opd_details_id,
          tpaid,
          HOspatient_charges_id,
          HOStransaction_id,
          '',
          InternalOpdOverviewVisit.cons_doctor,
          InternalOpdOverviewVisit.date + ' ' + InternalOpdOverviewVisit.time,
          InternalOpdOverviewVisit.live_consult,
          InternalOpdOverviewVisit.payment_mode,
          InternalOpdOverviewVisit.symptoms_type,
          InternalOpdOverviewVisit.symptoms,
          InternalOpdOverviewVisit.bp,
          InternalOpdOverviewVisit.height,
          InternalOpdOverviewVisit.weight,
          InternalOpdOverviewVisit.pulse,
          InternalOpdOverviewVisit.temperature,
          InternalOpdOverviewVisit.respiration,
          InternalOpdOverviewVisit.known_allergies,
          InternalOpdOverviewVisit.note,
        ],
      );

      // ##################################################################################################################################################################

      const [opd_details_id] = await this.dynamicConnection.query(
        `select id from opd_details where hos_opd_id = ? and Hospital_id = ?`,
        [
          InternalOpdOverviewVisit.opd_details_id,
          InternalOpdOverviewVisit.Hospital_id,
        ],
      );
      const opd_id = opd_details_id.id;
      const [cases_id] = await this.dynamicConnection.query(
        `select case_reference_id from opd_details where hos_opd_id = ? and Hospital_id = ?`,
        [
          InternalOpdOverviewVisit.opd_details_id,
          InternalOpdOverviewVisit.Hospital_id,
        ],
      );
      const cases = cases_id.case_reference_id;
      const [getAdminChargeId] = await this.dynamicConnection.query(
        `select id  from charges
where Hospital_id = ? and hospital_charges_id = ?`,
        [
          InternalOpdOverviewVisit.Hospital_id,
          InternalOpdOverviewVisit.charge_id,
        ],
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
    total,
    patient_id,
    payment_status,
    Hospital_id,hos_patient_charges_id,
    amount
    ) values(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          InternalOpdOverviewVisit.date,
          opd_id,
          1,
          getAdminChargeId.id,
          HOSamount[0].standard_charge,
          HOSamount[0].tax_percentage,
          InternalOpdOverviewVisit.apply_charge,
          HOSamount[0].amount,
          HOSpatientId,
          payment_status,
          InternalOpdOverviewVisit.Hospital_id,
          HOSPatient_charges.insertId,
          HOSamount[0].amount,
        ],
      );
      const adminpatient_charges_id = Patient_charges.insertId;
      let adminTransaction_id;

      if (
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() !==
          'paylater' &&
        InternalOpdOverviewVisit.payment_mode.toLocaleLowerCase() !== 'offline'
      ) {
        try {
          const transactions = await this.dynamicConnection.query(
            `
  insert into transactions (
  type,
  opd_id,
  section,
  patient_id,
  case_reference_id,
  patient_charges_id,
  amount,
  payment_mode,
  payment_date,
    payment_gateway,
  payment_id,
  payment_reference_number,
  received_by_name,
  Hospital_id,
  hos_transaction_id
  ) values
  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              'payment',
              opd_id,
              'OPD',
              HOSpatientId,
              cases,
              adminpatient_charges_id,
              HOSamount[0].amount,
              InternalOpdOverviewVisit.payment_mode,
              InternalOpdOverviewVisit.payment_date,
              InternalOpdOverviewVisit.payment_gateway,
              InternalOpdOverviewVisit.payment_id,
              InternalOpdOverviewVisit.payment_reference_number,
              InternalOpdOverviewVisit.received_by_name,
              InternalOpdOverviewVisit.Hospital_id,
              HOStransaction_id,
            ],
          );
          adminTransaction_id = transactions.insertId;

          await this.dynamicConnection.query(
            `update patient_charges SET transaction_id = ? where id = ?`,
            [transactions.insertId, adminpatient_charges_id],
          );
        } catch (error) {
          return process.env.ADMIN_TRANSACTION_ERROR;
        }
      }
      await this.dynamicConnection.query(
        `
  insert into visit_details(
    opd_details_id,
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
    Hospital_id,
    hos_visit_id
  ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,

        [
          opd_id,
          adminpatient_charges_id,
          adminTransaction_id,
          '',
          adminStaffId,
          InternalOpdOverviewVisit.date + ' ' + InternalOpdOverviewVisit.time,
          InternalOpdOverviewVisit.live_consult,
          InternalOpdOverviewVisit.payment_mode,
          InternalOpdOverviewVisit.symptoms_type,
          InternalOpdOverviewVisit.symptoms,
          InternalOpdOverviewVisit.bp,
          InternalOpdOverviewVisit.height,
          InternalOpdOverviewVisit.weight,
          InternalOpdOverviewVisit.pulse,
          InternalOpdOverviewVisit.temperature,
          InternalOpdOverviewVisit.respiration,
          InternalOpdOverviewVisit.known_allergies,
          InternalOpdOverviewVisit.note,
          InternalOpdOverviewVisit.Hospital_id,
          HOSvisitInsert.insertId,
        ],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.OPD,
          'inserted_details ': await this.connection.query(
            'select * from visit_details where id = ?',
            [HOSvisitInsert.insertId],
          ),
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

  async findAll(patient_id: number, opd_details_id: number) {
    try {
      const visits = await this.connection.query(
        `    
    select CONCAT('OPDN', visit_details.opd_details_id) as opd_NO,CONCAT ('OCID', visit_details.id) AS OPD_checkup_ID,opd_details.case_reference_id as case_id,
   visit_details.appointment_date,
   CONCAT(staff.name, ' ', staff.surname, staff.employee_id)  AS consultant,visit_details.refference,visit_details.symptoms from visit_details
   join opd_details ON visit_details.opd_details_id = opd_details.id
   join staff ON visit_details.cons_doctor = staff.id where patient_id = ? and visit_details.opd_details_id = ?`,
        [patient_id, opd_details_id],
      );
      return visits;
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

  async findone(id: string) {
    try {
      const visit = await this.connection.query(
        `select concat("OCID",visit_details.id) as OPD_checkup_id,opd_details.id as OPD_ID, opd_details.case_reference_id, visit_details.patient_old, 
    patients.gender, patients.mobileno, patients.address, blood_bank_products.name as blood_group,
    visit_details.weight,visit_details.pulse,visit_details.respiration,visit_details.appointment_date,
    visit_details.casualty,visit_details.organisation_id as TPA,visit_details.note,visit_details.symptoms,visit_details.symptoms_type,
    concat("OPDN",visit_details.opd_details_id) as OPD_ID, concat(patients.patient_name,"(",patients.id,")") as patient_name,
    patients.guardian_name,patients.marital_status,patients.email,
    patients.age as age,
    visit_details.height,visit_details.bp,visit_details.temperature,visit_details.known_allergies,visit_details.case_type,
    visit_details.refference,CONCAT( staff.name, ' ', staff.surname,((staff.employee_id))) AS doctor,
    staff.id,patient_charges.charge_id,patient_charges.standard_charge,organisation.id,transactions.payment_mode,transactions.amount,transactions.payment_date
    from visit_details
    left join opd_details on visit_details.opd_details_id = opd_details.id
    left join patients on opd_details.patient_id = patients.id
    left join staff on visit_details.cons_doctor = staff.id
    left join blood_bank_products on patients.blood_bank_product_id = blood_bank_products.id
    left join organisation on visit_details.organisation_id = organisation.id
    left join transactions on visit_details.transaction_id = transactions.id
    left join patient_charges on visit_details.patient_charge_id = patient_charges.id
    where opd_details_id = ?`,
        [id],
      );
      if (visit.length === 1) {
        return visit;
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
  async update(id: number, InternalOpdOverviewVisit: InternalOpdOverviewVisit) {
    if (
      !InternalOpdOverviewVisit.received_by_name ||
      InternalOpdOverviewVisit.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }

    try {
      const [getTransc] = await this.connection.query(
        `select transaction_id from visit_details where id = ?`,
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
          InternalOpdOverviewVisit.amount,
          InternalOpdOverviewVisit.payment_mode,
          InternalOpdOverviewVisit.note,
          InternalOpdOverviewVisit.payment_date,
          InternalOpdOverviewVisit.received_by_name,
          getTransc.transaction_id,
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
    refference = ?,
    cons_doctor = ?
    where id = ?`,
        [
          InternalOpdOverviewVisit.height,
          InternalOpdOverviewVisit.weight,
          InternalOpdOverviewVisit.pulse,
          InternalOpdOverviewVisit.bp,
          InternalOpdOverviewVisit.temperature,
          InternalOpdOverviewVisit.respiration,
          InternalOpdOverviewVisit.known_allergies,
          InternalOpdOverviewVisit.symptoms_type,
          InternalOpdOverviewVisit.symptoms,
          InternalOpdOverviewVisit.note,
          InternalOpdOverviewVisit.appointment_date,
          InternalOpdOverviewVisit.case_type,
          InternalOpdOverviewVisit.casualty,
          InternalOpdOverviewVisit.patient_old,
          InternalOpdOverviewVisit.refference,
          InternalOpdOverviewVisit.cons_doctor,
          id,
        ],
      );
      const [getHosDoccMail] = await this.connection.query(
        `select email from staff where id = ?`,
        [InternalOpdOverviewVisit.cons_doctor],
      );
      const [getAdminDocId] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [getHosDoccMail.email],
      );
      const [getHosTransc] = await this.dynamicConnection.query(
        `select transaction_id from visit_details where Hospital_id =? and hos_visit_id = ?`,
        [InternalOpdOverviewVisit.Hospital_id, id],
      );
      const [getHosvisit] = await this.dynamicConnection.query(
        `select id from visit_details where Hospital_id = ? and hos_visit_id = ?`,
        [InternalOpdOverviewVisit.Hospital_id, id],
      );
      await this.dynamicConnection.query(
        `update transactions set amount = ?,
payment_mode = ?,
note = ?,
payment_date = ?,
received_by_name = ?
where id = ?`,
        [
          InternalOpdOverviewVisit.amount,
          InternalOpdOverviewVisit.payment_mode,
          InternalOpdOverviewVisit.note,
          InternalOpdOverviewVisit.payment_date,
          InternalOpdOverviewVisit.received_by_name,
          getHosTransc.transaction_id,
        ],
      );
      await this.dynamicConnection.query(
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
refference = ?,
cons_doctor = ?
where id = ?`,
        [
          InternalOpdOverviewVisit.height,
          InternalOpdOverviewVisit.weight,
          InternalOpdOverviewVisit.pulse,
          InternalOpdOverviewVisit.bp,
          InternalOpdOverviewVisit.temperature,
          InternalOpdOverviewVisit.respiration,
          InternalOpdOverviewVisit.known_allergies,
          InternalOpdOverviewVisit.symptoms_type,
          InternalOpdOverviewVisit.symptoms,
          InternalOpdOverviewVisit.note,
          InternalOpdOverviewVisit.appointment_date,
          InternalOpdOverviewVisit.case_type,
          InternalOpdOverviewVisit.casualty,
          InternalOpdOverviewVisit.patient_old,
          InternalOpdOverviewVisit.refference,
          getAdminDocId.id,
          getHosvisit.id,
        ],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.OPD_UPDATED,
          updated_details: await this.connection.query(
            'select * from visit_details where id = ?',
            [id],
          ),
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

  async remove(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const patientChargeResult = await this.connection.query(
        'SELECT patient_charge_id FROM visit_details WHERE id = ?',
        [id],
      );
      const patientChargeId = patientChargeResult[0]?.patient_charge_id;
      if (patientChargeId) {
        await this.connection.query(
          'DELETE FROM patient_charges WHERE id = ?',
          [patientChargeId],
        );
      }
      const transactionResult = await this.connection.query(
        'SELECT transaction_id FROM visit_details WHERE id = ?',
        [id],
      );
      const transactionId = transactionResult[0]?.transaction_id;
      if (transactionId) {
        await this.connection.query('DELETE FROM transactions WHERE id = ?', [
          transactionId,
        ]);
      }
      await this.connection.query('DELETE FROM visit_details WHERE id = ?', [
        id,
      ]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.VISIT_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
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

  async findVisitDetailsSearch(
    patientId: number,
    opdDetailsId: number,
    search: string,
  ): Promise<InternalOpdOverviewVisit[]> {
    let query = `SELECT CONCAT('OPDN', visit_details.opd_details_id) AS opd_NO,
                      CONCAT('OCID', visit_details.id) AS OPD_checkup_ID,
                      opd_details.patient_id,
                      visit_details.opd_details_id,
                      opd_details.case_reference_id AS case_id,
                      visit_details.appointment_date,
                      CONCAT(staff.name, ' ', staff.surname, staff.employee_id) AS consultant,
                      visit_details.refference,
                      visit_details.symptoms 
               FROM visit_details
               JOIN opd_details ON visit_details.opd_details_id = opd_details.id
               JOIN staff ON visit_details.cons_doctor = staff.id
               WHERE opd_details.patient_id = ? 
               AND visit_details.opd_details_id = ?`;
    let values: (number | string)[] = [patientId, opdDetailsId];

    if (search) {
      query += ` AND ( CONCAT('OCID', visit_details.id) LIKE ? 
                    OR visit_details.appointment_date LIKE ? 
                    OR staff.name LIKE ? 
                    OR staff.surname LIKE ? 
                    OR staff.employee_id LIKE ?
                    OR CONCAT(staff.name, ' ', staff.surname, staff.employee_id) LIKE ? 
                    OR visit_details.refference LIKE ? 
                    OR visit_details.symptoms LIKE ? )`;

      const searchValue = `%${search}%`;
      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
      );
    }
    try {
      const rows = await this.connection.query(query, values);
      return rows;
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

  async opd_visit(
    patient_id: number,
    limit: number,
    page: number,
    search?: string,
  ): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);
      let dateCondition = '';

      if (search) {
        const searchClause = `
        (visit_details.opd_details_id LIKE '%${search}%' OR
        visit_details.appointment_date LIKE '%${search}%' OR
        opd_details.case_reference_id LIKE '%${search}%' OR
        appointment.id LIKE '%${search}%' OR
        CONCAT(staff.name, ' ', staff.surname, staff.employee_id) LIKE '%${search}%' OR
        visit_details.refference LIKE '%${search}%' OR
        visit_details.symptoms LIKE '%${search}%')`;
        dateCondition += ` AND ${searchClause}`;
      }

      const opd = await this.connection.query(
        `select 'OPDN' as opd_prefix,  visit_details.opd_details_id as opd_NO,appointment.id as Appointment_No,'APPN' as appointment_prefix,opd_details.case_reference_id as case_id,
        visit_details.appointment_date,
        CONCAT(staff.name, ' ', staff.surname, staff.employee_id)  AS consultant,visit_details.refference,visit_details.symptoms,
        opd_details.is_ipd_moved, visit_details.id as OCID
        from visit_details
       left join opd_details ON visit_details.opd_details_id = opd_details.id
        left join appointment ON appointment.visit_details_id = visit_details.id
       left join staff ON visit_details.cons_doctor = staff.id        
       where opd_details.patient_id = ? 
       ${dateCondition}  ORDER BY visit_details.id DESC
        LIMIT ? OFFSET ?`,
        [patient_id, Number(limit), Number(offset)],
      );

      const [totalCount] = await this.connection.query(
        `select count(visit_details.id) as total from visit_details
       left join opd_details ON visit_details.opd_details_id = opd_details.id
        left join appointment ON appointment.visit_details_id = visit_details.id
       left join staff ON visit_details.cons_doctor = staff.id        
       where opd_details.patient_id = ?  ${dateCondition}`,
        [patient_id],
      );

      return {
        details: opd,
        limit: limit,
        page: page,
        total: totalCount.total,
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

  async opd_OCID(
    patient_id: number,
    opd_details_id: number,
    limit: number,
    page: number,
    search?: string,
  ) {
    try {
      const offset = limit * (page - 1);
      let dateCondition = '';

      if (search) {
        const searchClause = `
        (
          visit_details.opd_details_id LIKE '%${search}%' OR
          visit_details.id LIKE '%${search}%' OR
          visit_details.appointment_date LIKE '%${search}%' OR
          opd_details.case_reference_id LIKE '%${search}%' OR
          CONCAT(staff.name, ' ', staff.surname, staff.employee_id) LIKE '%${search}%' OR
          visit_details.refference LIKE '%${search}%' OR
          visit_details.symptoms LIKE '%${search}%'
        )`;

        dateCondition += ` AND ${searchClause}`;
      }

      const opd_ocid = await this.connection.query(
        `select CONCAT('OPDN', visit_details.opd_details_id) as opd_NO,CONCAT ('OCID', visit_details.id) AS OPD_checkup_ID,opd_details.case_reference_id as case_id,
	   visit_details.appointment_date,
	concat(staff.name, ' ', staff.surname) as consultant, staff.employee_id as staff_employee_id ,visit_details.refference,visit_details.symptoms from visit_details
	   join opd_details ON visit_details.opd_details_id = opd_details.id
	   join staff ON visit_details.cons_doctor = staff.id where patient_id = ? and visit_details.opd_details_id = ? 
  ${dateCondition} ORDER BY visit_details.id DESC
   LIMIT ? OFFSET ?`,
        [patient_id, opd_details_id, Number(limit), Number(offset)],
      );

      const [totalCount] = await this.connection.query(
        `SELECT COUNT(*) AS total 
     FROM visit_details 
     JOIN opd_details ON visit_details.opd_details_id = opd_details.id 
     JOIN staff ON visit_details.cons_doctor = staff.id 
     WHERE patient_id = ? AND visit_details.opd_details_id = ?  ${dateCondition}`,
        [patient_id, opd_details_id],
      );

      return {
        details: opd_ocid,
        limit: limit,
        page: page,
        total: totalCount.total,
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

  async opd_visit_info(opd_details_id: number) {
    try {
      const visit_info = await this.connection.query(
        `select  visit_details.id as OCID,opd_details.case_reference_id as case_id,visit_details.patient_old as old_patient, 
patients.gender as gender, patients.mobileno as phone, patients.address as address, blood_bank_products.name as blood_group,
visit_details.weight as weight, visit_details.appointment_date as appointment_date, 
'OPDN' as opd_prefix,  visit_details.opd_details_id as opd_NO, patients.patient_name as patient_name, 
patients.guardian_name as guardian_name, patients.marital_status as marital_status, patients.email as email, 
patients.age,"YEAR", visit_details.height as height, visit_details.bp as bp, visit_details.case_type as cases
from visit_details
left join opd_details ON visit_details.opd_details_id = opd_details.id
left join patients ON  opd_details.patient_id = patients.id
left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id
where opd_details_id = ?`,
        [opd_details_id],
      );
      if (visit_info.length === 1) {
        return visit_info;
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

  async checkup_id_ocid(id: number) {
    try {
      const checkup_id = await this.connection.query(
        `select opd_details.case_reference_id as case_id, visit_details.opd_details_id as opd_no, 
patients.patient_name as patient_name, patients.guardian_name as guardian_name, 
patients.marital_status as marital_status, patients.email as email, patients.age as age, 
visit_details.height as height, visit_details.bp as BP,  visit_details.temperature as Temperature,
visit_details.spo2 as spo2, visit_details.case_type as cases, visit_details.refference as refference,
CONCAT( staff.name, ' ', staff.surname )AS consultant_Doctor,staff.id AS consultant_Doctor_id,
 visit_details.symptoms as symptoms,
visit_details.id as Recheckup_id, visit_details.patient_old as old_patient, patients.gender as gender,
patients.mobileno as phone, patients.address as address, blood_bank_products.name as blood_group,
visit_details.weight as weight, visit_details.pulse as pulse, visit_details.respiration as respiration,
visit_details.appointment_date as appointment_date, visit_details.casualty as casualty, 
organisation.organisation_name as TPA, visit_details.note as note 
from visit_details
left join opd_details ON visit_details.opd_details_id = opd_details.id
left join patients ON opd_details.patient_id = patients.id
left join staff ON visit_details.cons_doctor = staff.id
left join symptoms ON visit_details.symptoms = symptoms.id
left join blood_bank_products ON patients.blood_bank_product_id = blood_bank_products.id
left join organisation ON visit_details.organisation_id = organisation.id where visit_details.id = ?`,
        [id],
      );
      if (checkup_id.length === 1) {
        return checkup_id;
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
}
