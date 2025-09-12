import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AddAppointmentService } from 'src/add-appointment/add-appointment.service';
import { DataSource } from 'typeorm';
import { IpdMainModule } from './entities/ipd_main_module.entity';
import { CountDto } from './dto/ipd_main_module.dto';

@Injectable()
export class IpdMainModuleService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => AddAppointmentService))
    private readonly addAppointmentService: AddAppointmentService,
  ) {}

  async emailExists(email: string): Promise<boolean> {
    const result = await this.connection.query(
      `SELECT COUNT(*) AS count FROM staff WHERE email = ?`,
      [email],
    );
    return result[0].count > 0;
  }

  async create(ipdEntity: IpdMainModule) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [ipdEntity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` ${process.env.VALIDATION_CHECK} ${ipdEntity.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [ipdEntity.cons_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${ipdEntity.cons_doctor} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const add_case = await this.connection.query(
        'INSERT into case_references () VALUES (default,default)',
      );
      let add_ipd_main_id;
      const add_ipd = await this.connection.query(
        `INSERT into ipd_details (
      patient_id,
      case_reference_id,
      height,
      weight,
      pulse,
      temperature,
      respiration,
      bp,
      bed,
      bed_group_id,
      case_type,
      casualty,
      symptoms,
      known_allergies,
      patient_old,
      note,
      refference,
      cons_doctor,
      organisation_id,
      credit_limit,
      payment_mode,
      date,
      discharged,
      live_consult
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          ipdEntity.patient_id,
          add_case.insertId,
          ipdEntity.height,
          ipdEntity.weight,
          ipdEntity.pulse,
          ipdEntity.temperature,
          ipdEntity.respiration,
          ipdEntity.bp,
          ipdEntity.bed,
          ipdEntity.bed_group_id,
          ipdEntity.case_type,
          ipdEntity.casualty,
          ipdEntity.symptoms,
          ipdEntity.known_allergies,
          ipdEntity.patient_old,
          ipdEntity.note,
          ipdEntity.refference,
          ipdEntity.cons_doctor,
          ipdEntity.organisation_id,
          ipdEntity.credit_limit,
          ipdEntity.payment_mode,
          ipdEntity.date,
          ipdEntity.discharged,
          ipdEntity.live_consult,
        ],
      );
      add_ipd_main_id = add_ipd.insertId;

      const patients_bed_hist = await this.connection.query(
        `INSERT into patient_bed_history (case_reference_id,bed_group_id,bed_id,revert_reason,from_date,is_active) VALUES (?,?,?,?,?,?)`,
        [
          add_case.insertId,
          ipdEntity.bed_group_id,
          ipdEntity.bed,
          ipdEntity.revert_reason,
          ipdEntity.date,
          ipdEntity.is_active,
        ],
      );
      const beddidd = await this.connection.query(
        'SELECT bed FROM ipd_details WHERE id = ?',
        [add_ipd_main_id],
      );
      const yourBedId = beddidd[0].bed;
      await this.connection.query(
        `UPDATE bed 
   SET is_active = 'no'
   WHERE id = ?`,
        [yourBedId],
      );

      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [ipdEntity.patient_id],
      );
      const [checkPatInAdmin] = await this.dynamicConnection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getAayushUniqueId.aayush_unique_id],
      );
      const dynamicIPDPatientId = checkPatInAdmin.id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getbedgroupid = await this.dynamicConnection.query(
        'SELECT id FROM bed_group WHERE hospital_bed_group_id = ? and Hospital_id = ?',
        [ipdEntity.bed_group_id, ipdEntity.hospital_id],
      );
      const dynbedgroup = getbedgroupid[0].id;
      const getbedid = await this.dynamicConnection.query(
        'SELECT id FROM bed WHERE hospital_bed_id = ? and Hospital_id = ?',
        [ipdEntity.bed, ipdEntity.hospital_id],
      );
      const dynbed = getbedid[0].id;
      const add_dynamic_case = await this.dynamicConnection.query(
        `INSERT into case_references () VALUES (default,default)`,
      );
      let dynamicipdIdd;
      const add_dynamic_ipd = await this.dynamicConnection.query(
        `INSERT into ipd_details (
    patient_id,
    case_reference_id,
    height,
    weight,
    pulse,
    temperature,
    respiration,
    bp,
    bed,
    bed_group_id,
    case_type,
    casualty,
    symptoms,
    known_allergies,
    patient_old,
    note,
    refference,
    cons_doctor,
    organisation_id,
    credit_limit,
    payment_mode,
    date,
    discharged,
    live_consult,
    hospital_id,
    hospital_ipd_details_id
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicIPDPatientId,
          add_dynamic_case.insertId,
          ipdEntity.height,
          ipdEntity.weight,
          ipdEntity.pulse,
          ipdEntity.temperature,
          ipdEntity.respiration,
          ipdEntity.bp,
          dynbed,
          dynbedgroup,
          ipdEntity.case_type,
          ipdEntity.casualty,
          ipdEntity.symptoms,
          ipdEntity.known_allergies,
          ipdEntity.patient_old,
          ipdEntity.note,
          ipdEntity.refference,
          dynamicUPTDStaffId,
          ipdEntity.organisation_id,
          ipdEntity.credit_limit,
          ipdEntity.payment_mode,
          ipdEntity.date,
          ipdEntity.discharged,
          ipdEntity.live_consult,
          ipdEntity.hospital_id,
          add_ipd.insertId,
        ],
      );
      dynamicipdIdd = add_dynamic_ipd.insertId;
      await this.dynamicConnection.query(
        `INSERT into patient_bed_history (case_reference_id,bed_group_id,bed_id,revert_reason,from_date,is_active,hospital_id,hospital_patient_bed_history_id) VALUES (?,?,?,?,?,?,?,?)`,
        [
          add_dynamic_case.insertId,
          dynbedgroup,
          dynbed,
          ipdEntity.revert_reason,
          ipdEntity.date,
          ipdEntity.is_active,
          ipdEntity.hospital_id,
          patients_bed_hist.insertId,
        ],
      );
      const Beddidd = await this.dynamicConnection.query(
        'SELECT bed FROM ipd_details WHERE id = ?',
        [dynamicipdIdd],
      );
      const YourBedidddd = Beddidd[0].bed;
      await this.dynamicConnection.query(
        `UPDATE bed 
   SET is_active = 'no'
   WHERE id = ?`,
        [YourBedidddd],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.RETURN_SUCCESS_MSG,
            IPD_values: await this.connection.query(
              'SELECT * FROM ipd_details where id = ?',
              [add_ipd_main_id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create_appt_ipd(ipdEntity: IpdMainModule) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [ipdEntity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` ${process.env.VALIDATION_CHECK} ${ipdEntity.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      let dynamicUPTDStaffId;
      if (ipdEntity.cons_doctor) {
        const [staffId] = await this.connection.query(
          'SELECT email FROM staff WHERE id = ?',
          [ipdEntity.cons_doctor],
        );
        if (!staffId || staffId.length === 0) {
          throw new Error(
            `${process.env.VALIDATION_STAFF} ${ipdEntity.cons_doctor} ${process.env.VALIDATION_NOT_FOUND}`,
          );
        }
        const docemail = staffId.email;
        const dynamicUpdateStaff = await this.dynamicConnection.query(
          'SELECT id FROM staff WHERE email = ?',
          [docemail],
        );
        dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      }
      const [check_duplicate] = await this.connection.query(
        `select * from ipd_details 
    where patient_id = ? and discharged = 'no'`,
        [ipdEntity.patient_id],
      );
      if (!check_duplicate) {
        const HOScaseRef = await this.connection.query(
          'INSERT INTO case_references values(default,default)',
        );

        const HOSbookAppnt = await this.connection.query(
          `insert into appointment(
  patient_id,
  module,
  case_reference_id,
  date,
  source,
  message,
  priority,
  appointment_status,
  doctor,
  appointment_status_id
 
  ) values(?,?,?,?,?,?,?,?,?,?)`,
          [
            ipdEntity.patient_id,
            'IPD',
            HOScaseRef.insertId,
            ipdEntity.date,
            'Offline',
            ipdEntity.note,
            3,
            'InProcess',
            ipdEntity.cons_doctor,
            5,
          ],
        );
        const hos_appointment_id = HOSbookAppnt.insertId;
        const [patientId] = await this.connection.query(
          'SELECT aayush_unique_id FROM patients WHERE id = ?',
          [ipdEntity.patient_id],
        );
        if (!patientId || patientId.length === 0) {
          throw new Error(
            ` ${process.env.VALIDATION_CHECK} ${ipdEntity.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
          );
        }
        const email = patientId.aayush_unique_id;

        let add_ipd_main_id;
        const add_ipd = await this.connection.query(
          `INSERT into ipd_details (
      patient_id,
      case_reference_id,
      height,
      weight,
      pulse,
      temperature,
      respiration,
      bp,
      bed,
      bed_group_id,
      case_type,
      casualty,
      symptoms,
      known_allergies,
      patient_old,
      note,
      refference,
      cons_doctor,
      organisation_id,
      credit_limit,
      payment_mode,
      date,
      discharged,
      live_consult
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            ipdEntity.patient_id,
            HOScaseRef.insertId,
            ipdEntity.height,
            ipdEntity.weight,
            ipdEntity.pulse,
            ipdEntity.temperature,
            ipdEntity.respiration,
            ipdEntity.bp,
            ipdEntity.bed,
            ipdEntity.bed_group_id,
            ipdEntity.case_type,
            ipdEntity.casualty,
            ipdEntity.symptoms,
            ipdEntity.known_allergies,
            ipdEntity.patient_old,
            ipdEntity.note,
            ipdEntity.refference,
            ipdEntity.cons_doctor,
            ipdEntity.organisation_id,
            ipdEntity.credit_limit,
            'Offline',
            ipdEntity.date,
            ipdEntity.discharged,
            ipdEntity.live_consult,
          ],
        );
        add_ipd_main_id = add_ipd.insertId;

        const patients_bed_hist = await this.connection.query(
          `INSERT into patient_bed_history (case_reference_id,bed_group_id,bed_id,revert_reason,from_date,is_active) VALUES (?,?,?,?,?,?)`,
          [
            HOScaseRef.insertId,
            ipdEntity.bed_group_id,
            ipdEntity.bed,
            ipdEntity.revert_reason,
            ipdEntity.date,
            ipdEntity.is_active,
          ],
        );
        const beddidd = await this.connection.query(
          'SELECT bed FROM ipd_details WHERE id = ?',
          [add_ipd_main_id],
        );
        const yourBedId = beddidd[0].bed;
        await this.connection.query(
          `UPDATE bed 
   SET is_active = 'no'
   WHERE id = ?`,
          [yourBedId],
        );
        const dynamicPatient = await this.dynamicConnection.query(
          'SELECT id FROM patients WHERE aayush_unique_id = ?',
          [email],
        );
        const dynamicIPDPatientId = dynamicPatient[0].id;

        const caseRef = await this.dynamicConnection.query(
          'INSERT INTO case_references values(default,default)',
        );

        let dynOrgId;
        if (ipdEntity.organisation_id) {
          [dynOrgId] = await this.dynamicConnection.query(
            `select id from organisation where Hospital_id = ? and hos_organisation_id = ?`,
            [ipdEntity.hospital_id, ipdEntity.organisation_id],
          );
        } else {
          dynOrgId = { id: null };
        }

        await this.dynamicConnection.query(
          `insert into appointment(
        patient_id,
        module,
  case_reference_id,
  date,
  source,
  message,
  priority,
  appointment_status,
  Hospital_id,
  hos_appointment_id,
  doctor,
  appointment_status_id
       
        ) values(?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            dynamicIPDPatientId,
            'IPD',
            caseRef.insertId,
            ipdEntity.date,
            'Offline',
            ipdEntity.note,
            3,
            'InProcess',
            ipdEntity.hospital_id,
            hos_appointment_id,
            dynamicUPTDStaffId,
            5,
          ],
        );

        const getbedgroupid = await this.dynamicConnection.query(
          'SELECT id FROM bed_group WHERE hospital_bed_group_id = ? and Hospital_id = ?',
          [ipdEntity.bed_group_id, ipdEntity.hospital_id],
        );
        const dynbedgroup = getbedgroupid[0].id;
        const getbedid = await this.dynamicConnection.query(
          'SELECT id FROM bed WHERE hospital_bed_id = ? and Hospital_id = ?',
          [ipdEntity.bed, ipdEntity.hospital_id],
        );
        const dynbed = getbedid[0].id;

        let dynamicipdIdd;
        const add_dynamic_ipd = await this.dynamicConnection.query(
          `INSERT into ipd_details (
        patient_id,
        case_reference_id,
        height,
        weight,
        pulse,
        temperature,
        respiration,
        bp,
        bed,
        bed_group_id,
        case_type,
        casualty,
        symptoms,
        known_allergies,
        patient_old,
        note,
        refference,
        cons_doctor,
        organisation_id,
        credit_limit,
        payment_mode,
        date,
        discharged,
        live_consult,
        hospital_id,
        hospital_ipd_details_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            dynamicIPDPatientId,
            caseRef.insertId,
            ipdEntity.height,
            ipdEntity.weight,
            ipdEntity.pulse,
            ipdEntity.temperature,
            ipdEntity.respiration,
            ipdEntity.bp,
            dynbed,
            dynbedgroup,
            ipdEntity.case_type,
            ipdEntity.casualty,
            ipdEntity.symptoms,
            ipdEntity.known_allergies,
            ipdEntity.patient_old,
            ipdEntity.note,
            ipdEntity.refference,
            dynamicUPTDStaffId,
            dynOrgId.id,
            ipdEntity.credit_limit,
            'Offline',
            ipdEntity.date,
            ipdEntity.discharged,
            ipdEntity.live_consult,
            ipdEntity.hospital_id,
            add_ipd.insertId,
          ],
        );
        dynamicipdIdd = add_dynamic_ipd.insertId;

        await this.dynamicConnection.query(
          `INSERT into patient_bed_history (case_reference_id,bed_group_id,bed_id,revert_reason,from_date,is_active,hospital_id,hospital_patient_bed_history_id) VALUES (?,?,?,?,?,?,?,?)`,
          [
            caseRef.insertId,
            dynbedgroup,
            dynbed,
            ipdEntity.revert_reason,
            ipdEntity.date,
            ipdEntity.is_active,
            ipdEntity.hospital_id,
            patients_bed_hist.insertId,
          ],
        );
        const Beddidd = await this.dynamicConnection.query(
          'SELECT bed FROM ipd_details WHERE id = ?',
          [dynamicipdIdd],
        );
        const YourBedidddd = Beddidd[0].bed;

        await this.dynamicConnection.query(
          `UPDATE bed 
       SET is_active = 'no'
       WHERE id = ?`,
          [YourBedidddd],
        );
        return [
          {
            'data ': {
              status: process.env.SUCCESS_STATUS,
              messege: process.env.RETURN_SUCCESS_MSG,
              IPD_values: await this.connection.query(
                'SELECT * FROM ipd_details where id = ?',
                [add_ipd_main_id],
              ),
            },
          },
        ];
      } else {
        return {
          status: process.env.ERROR_STATUS,
          message: process.env.IPD_ERROR_MESSAGE,
        };
      }
    } catch (error) {
      console.log(error, 'err');
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<IpdMainModule[]> {
    const getIpdDetails = await this.connection
      .query(`SELECT ipd_details.id,concat('IPDN',"",ipd_details.id) AS IPD_No,ipd_details.case_reference_id AS Case_ID,
    concat(patients.patient_name, "(",patients.id,")" ) AS patientName,patients.gender,patients.mobileno,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS staffname,concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
    ipd_details.credit_limit 
    FROM ipd_details 
    LEFT JOIN patients ON ipd_details.patient_id = patients.id 
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
    LEFT JOIN floor ON bed_group.floor = floor.id 
    WHERE 
    ipd_details.discharged = 'no'`);
    return getIpdDetails;
  }

  async findOne(id: string): Promise<IpdMainModule | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.DATA_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getIPDByID = await this.connection.query(
        `SELECT ipd_details.id,patients.id as PatientID,concat('IPDN',"",ipd_details.id) AS IPD_No,ipd_details.date as AdmissionDate,ipd_details.case_reference_id AS Case_ID,
    concat(patients.patient_name, "(",patients.id,")" ) AS patientName,patients.gender,patients.mobileno,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS staffname,concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,CONCAT(age, ' years, ', month, ' months, ', day, ' days') AS Age,
    ipd_details.credit_limit,
    ipd_prescription_basic.finding_description,
    ipd_details.known_allergies,
    ipd_details.symptoms
    FROM ipd_details 
    LEFT JOIN ipd_prescription_basic ON ipd_prescription_basic.ipd_id = ipd_details.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id 
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
    LEFT JOIN floor ON bed_group.floor = floor.id 
    WHERE 
    ipd_details.discharged = 'no'
    AND ipd_details.id = ? `,
        [id],
      );
      if (getIPDByID.length === 1) {
        return getIPDByID;
      } else {
        return null;
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findTitleByType(id: number): Promise<IpdMainModule | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM symptoms_classification WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.DATA_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

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
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findDescByOne(id: number): Promise<IpdMainModule | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM symptoms WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.DATA_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

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
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findBedByBedgroup(id: number): Promise<IpdMainModule | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM bed_group WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.DATA_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getBedByBedGroup = await this.connection.query(
        `SELECT * from bed where bed_group_id = ? and is_active = 'yes'`,
        [id],
      );
      return getBedByBedGroup;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByIPDIdByAll(search: string): Promise<IpdMainModule[]> {
    let query = `SELECT ipd_details.id,concat('IPDN',"",ipd_details.id) AS IPD_No,ipd_details.case_reference_id AS Case_ID,
      concat(patients.patient_name, "(",patients.id,")" ) AS patientName,patients.gender,patients.mobileno,
      CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS staffname,concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
      ipd_details.credit_limit 
      FROM ipd_details 
      LEFT JOIN patients ON ipd_details.patient_id = patients.id 
      LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
      LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
      LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
      LEFT JOIN bed ON ipd_details.bed = bed.id
      LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
      LEFT JOIN floor ON bed_group.floor = floor.id 
      WHERE 
      ipd_details.discharged = 'no' 
    `;
    let values = [];
    if (search) {
      query += `  and (ipd_details.id like ? or ipd_details.case_reference_id like ? or patients.patient_name like ? or patients.gender like ? or patients.mobileno like ? or staff.name like ? or bed.name like ?)  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }

    let final = query;
    const IpdSearch = await this.connection.query(final, values);
    return IpdSearch;
  }

  async update(id: number, ipdEntity: IpdMainModule) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [ipdEntity.cons_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${ipdEntity.cons_doctor} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `update ipd_details SET
      height=?,
      weight=?,
      pulse=?,
      temperature=?,
      respiration=?,
      bp=?,
      bed=?,
      bed_group_id=?,
      case_type=?,
      casualty=?,
      symptoms=?,
      known_allergies=?,
      patient_old=?,
      note=?,
      refference=?,
      cons_doctor=?,
      organisation_id=?,
      credit_limit=?,
      payment_mode=?,
      date=?,
      discharged=?,
      live_consult=?
      where id=?`,
        [
          ipdEntity.height,
          ipdEntity.weight,
          ipdEntity.pulse,
          ipdEntity.temperature,
          ipdEntity.respiration,
          ipdEntity.bp,
          ipdEntity.bed,
          ipdEntity.bed_group_id,
          ipdEntity.case_type,
          ipdEntity.casualty,
          ipdEntity.symptoms,
          ipdEntity.known_allergies,
          ipdEntity.patient_old,
          ipdEntity.note,
          ipdEntity.refference,
          ipdEntity.cons_doctor,
          ipdEntity.organisation_id,
          ipdEntity.credit_limit,
          ipdEntity.payment_mode,
          ipdEntity.date,
          ipdEntity.discharged,
          ipdEntity.live_consult,
          id,
        ],
      );

      const getfrstipdid = await this.connection.query(
        'SELECT case_reference_id FROM ipd_details WHERE id = ?',
        [id],
      );
      const IPDidfromcaseid = getfrstipdid[0].case_reference_id;
      const getipddddid = await this.connection.query(
        'SELECT id FROM patient_bed_history WHERE case_reference_id = ?',
        [IPDidfromcaseid],
      );
      const ipdddddidfromipd = getipddddid[0].id;
      await this.connection.query(
        `update patient_bed_history SET
      bed_group_id=?,
      bed_id=?
      where id=?`,
        [ipdEntity.bed_group_id, ipdEntity.bed, ipdddddidfromipd],
      );
      const dynamicUpdateIPD = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id= ? and hospital_id = ?',
        [id, ipdEntity.hospital_id],
      );
      const dynamicUPTDIPDId = dynamicUpdateIPD[0].id;
      const getdynipdcaseidd = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM ipd_details WHERE id = ?',
        [dynamicUPTDIPDId],
      );
      const caserefidfromdynipd = getdynipdcaseidd[0].case_reference_id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getbedgroupid = await this.dynamicConnection.query(
        'SELECT id FROM bed_group WHERE hospital_bed_group_id = ? and Hospital_id = ?',
        [ipdEntity.bed_group_id, ipdEntity.hospital_id],
      );
      const dynbedgroup = getbedgroupid[0].id;
      const getbedid = await this.dynamicConnection.query(
        'SELECT id FROM bed WHERE hospital_bed_id = ? and Hospital_id = ?',
        [ipdEntity.bed, ipdEntity.hospital_id],
      );
      const dynbed = getbedid[0].id;

      let dynOrgId;
      if (ipdEntity.organisation_id) {
        [dynOrgId] = await this.dynamicConnection.query(
          `select id from organisation where Hospital_id = ? and hos_organisation_id = ?`,
          [ipdEntity.hospital_id, ipdEntity.organisation_id],
        );
      } else {
        dynOrgId = { id: null };
      }

      await this.dynamicConnection.query(
        `update ipd_details SET 
      height=?,
      weight=?,
      pulse=?,
      temperature=?,
      respiration=?,
      bp=?,
      bed=?,
      bed_group_id=?,
      case_type=?,
      casualty=?,
      symptoms=?,
      known_allergies=?,
      patient_old=?,
      note=?,
      refference=?,
      cons_doctor=?,
      organisation_id=?,
      credit_limit=?,
      payment_mode=?,
      date=?,
      discharged=?,
      live_consult=?,
      hospital_id=?
      where id=?`,
        [
          ipdEntity.height,
          ipdEntity.weight,
          ipdEntity.pulse,
          ipdEntity.temperature,
          ipdEntity.respiration,
          ipdEntity.bp,
          dynbed,
          dynbedgroup,
          ipdEntity.case_type,
          ipdEntity.casualty,
          ipdEntity.symptoms,
          ipdEntity.known_allergies,
          ipdEntity.patient_old,
          ipdEntity.note,
          ipdEntity.refference,
          dynamicUPTDStaffId,
          dynOrgId.id,
          ipdEntity.credit_limit,
          ipdEntity.payment_mode,
          ipdEntity.date,
          ipdEntity.discharged,
          ipdEntity.live_consult,
          ipdEntity.hospital_id,
          dynamicUPTDIPDId,
        ],
      );

      const dynamicUpdateIPDPatientBedHistory =
        await this.dynamicConnection.query(
          'SELECT id FROM patient_bed_history WHERE case_reference_id=?',
          [caserefidfromdynipd],
        );
      const dynamicUPTDIPDBedHistoryId =
        dynamicUpdateIPDPatientBedHistory[0].id;
      await this.dynamicConnection.query(
        `update patient_bed_history SET
  bed_group_id=?,
  bed_id=?
  where id=?`,
        [dynbedgroup, dynbed, dynamicUPTDIPDBedHistoryId],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.IPD_UPDATE_MESSAGE,
            updated_values: await this.connection.query(
              'SELECT * FROM ipd_details WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async remove(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM ipd_details WHERE id = ?', [id]);
      let dynamicDeletedIPDId;
      const dynamicDeletedIPD = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id= ?',
        [id],
      );
      dynamicDeletedIPDId = dynamicDeletedIPD[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM ipd_details WHERE id = ? AND hospital_id = ?',
        [dynamicDeletedIPDId, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.VALIDATION_STAFF} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateIsIpdMoved(id: number, ipdEntity: IpdMainModule) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [ipdEntity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_CHECK} ${ipdEntity.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const email = patientId.aayush_unique_id;
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [ipdEntity.cons_doctor],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${ipdEntity.cons_doctor} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `update opd_details SET
          is_ipd_moved=?
          where id=?`,
        [1, id],
      );
      const CaseId = await this.connection.query(
        'SELECT case_reference_id FROM opd_details WHERE id = ?',
        [id],
      );
      const caseID = CaseId[0].case_reference_id;
      let add_ipd_main_id;
      const add_ipd = await this.connection.query(
        `INSERT into ipd_details (
            patient_id,
            case_reference_id,
            height,
            weight,
            pulse,
            temperature,
            respiration,
            bp,
            bed,
            bed_group_id,
            case_type,
            casualty,
            symptoms,
            known_allergies,
            patient_old,
            note,
            refference,
            cons_doctor,
            organisation_id,
            credit_limit,
            payment_mode,
            date,
            discharged,
            live_consult
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          ipdEntity.patient_id,
          caseID,
          ipdEntity.height,
          ipdEntity.weight,
          ipdEntity.pulse,
          ipdEntity.temperature,
          ipdEntity.respiration,
          ipdEntity.bp,
          ipdEntity.bed,
          ipdEntity.bed_group_id,
          ipdEntity.case_type,
          ipdEntity.casualty,
          ipdEntity.symptoms,
          ipdEntity.known_allergies,
          ipdEntity.patient_old,
          ipdEntity.note,
          ipdEntity.refference,
          ipdEntity.cons_doctor,
          ipdEntity.organisation_id,
          ipdEntity.credit_limit,
          ipdEntity.payment_mode,
          ipdEntity.date,
          ipdEntity.discharged,
          ipdEntity.live_consult,
        ],
      );

      add_ipd_main_id = add_ipd.insertId;
      const patients_bed_hist = await this.connection.query(
        `INSERT into patient_bed_history (case_reference_id,bed_group_id,bed_id,revert_reason,from_date,is_active) VALUES (?,?,?,?,?,?)`,
        [
          caseID,
          ipdEntity.bed_group_id,
          ipdEntity.bed,
          ipdEntity.revert_reason,
          ipdEntity.date,
          ipdEntity.is_active,
        ],
      );
      const beddidd = await this.connection.query(
        'SELECT bed FROM ipd_details WHERE id = ?',
        [add_ipd_main_id],
      );
      const yourBedId = beddidd[0].bed;
      await this.connection.query(
        `UPDATE bed 
         SET is_active = 'no'
         WHERE id = ?`,
        [yourBedId],
      );

      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getbedgroupid = await this.dynamicConnection.query(
        'SELECT id FROM bed_group WHERE hospital_bed_group_id = ? and Hospital_id = ?',
        [ipdEntity.bed_group_id, ipdEntity.hospital_id],
      );
      const dynbedgroup = getbedgroupid[0].id;
      const getbedid = await this.dynamicConnection.query(
        'SELECT id FROM bed WHERE hospital_bed_id = ? and Hospital_id = ?',
        [ipdEntity.bed, ipdEntity.hospital_id],
      );
      const dynbed = getbedid[0].id;
      const dynOPDId = await this.dynamicConnection.query(
        'SELECT id FROM opd_details WHERE hos_opd_id = ? and Hospital_id=?',
        [id, ipdEntity.hospital_id],
      );
      const DYNOPDID = dynOPDId[0].id;
      await this.dynamicConnection.query(
        `update opd_details SET
          is_ipd_moved=?,
          Hospital_id=?
          where id=?`,
        [1, ipdEntity.hospital_id, DYNOPDID],
      );
      const DYnCaseId = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM opd_details WHERE id = ?',
        [DYNOPDID],
      );
      const dYNcaseID = DYnCaseId[0].case_reference_id;
      let dynamicipdIdd;
      const add_dynamic_ipd = await this.dynamicConnection.query(
        `INSERT into ipd_details (
          patient_id,
          case_reference_id,
          height,
          weight,
          pulse,
          temperature,
          respiration,
          bp,
          bed,
          bed_group_id,
          case_type,
          casualty,
          symptoms,
          known_allergies,
          patient_old,
          note,
          refference,
          cons_doctor,
          organisation_id,
          credit_limit,
          payment_mode,
          date,
          discharged,
          live_consult,
          hospital_id,
          hospital_ipd_details_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicIPDPatientId,
          dYNcaseID,
          ipdEntity.height,
          ipdEntity.weight,
          ipdEntity.pulse,
          ipdEntity.temperature,
          ipdEntity.respiration,
          ipdEntity.bp,
          dynbed,
          dynbedgroup,
          ipdEntity.case_type,
          ipdEntity.casualty,
          ipdEntity.symptoms,
          ipdEntity.known_allergies,
          ipdEntity.patient_old,
          ipdEntity.note,
          ipdEntity.refference,
          dynamicUPTDStaffId,
          ipdEntity.organisation_id,
          ipdEntity.credit_limit,
          ipdEntity.payment_mode,
          ipdEntity.date,
          ipdEntity.discharged,
          ipdEntity.live_consult,
          ipdEntity.hospital_id,
          add_ipd.insertId,
        ],
      );
      dynamicipdIdd = add_dynamic_ipd.insertId;
      await this.dynamicConnection.query(
        `INSERT into patient_bed_history (case_reference_id,bed_group_id,bed_id,revert_reason,from_date,is_active,hospital_id,hospital_patient_bed_history_id) VALUES (?,?,?,?,?,?,?,?)`,
        [
          dYNcaseID,
          dynbedgroup,
          dynbed,
          ipdEntity.revert_reason,
          ipdEntity.date,
          ipdEntity.is_active,
          ipdEntity.hospital_id,
          patients_bed_hist.insertId,
        ],
      );

      const Beddidd = await this.dynamicConnection.query(
        'SELECT bed FROM ipd_details WHERE id = ?',
        [dynamicipdIdd],
      );
      const YourBedidddd = Beddidd[0].bed;

      await this.dynamicConnection.query(
        `UPDATE bed 
         SET is_active = 'no'
         WHERE id = ?`,
        [YourBedidddd],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.MOVE_OPD_TO_IPD_MESSAGE,
            IPD_values: await this.connection.query(
              'SELECT * FROM ipd_details where id = ?',
              [add_ipd_main_id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findIpdDetailsSearch(
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      let baseQuery = `
      SELECT ipd_details.id,concat('IPDN',"",ipd_details.id) AS IPD_No,appointment.id as AppointmentID,ipd_details.case_reference_id AS Case_ID,
      concat(patients.patient_name, "(",patients.id,")" ) AS patientName,patients.gender,patients.mobileno,
      CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS staffname,concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
      ipd_details.credit_limit,
      ipd_details.date
      FROM ipd_details 
      LEFT JOIN patients ON ipd_details.patient_id = patients.id 
      LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
      LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id
      LEFT JOIN appointment ON case_references.id = appointment.case_reference_id 
      LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
      LEFT JOIN bed ON ipd_details.bed = bed.id
      LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
      LEFT JOIN floor ON bed_group.floor = floor.id 
      WHERE 
      ipd_details.discharged = 'no' `;

      let countQuery = `
      SELECT COUNT(ipd_details.id) AS total 
      FROM ipd_details 
      LEFT JOIN patients ON ipd_details.patient_id = patients.id 
      LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
      LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id
      LEFT JOIN appointment ON case_references.id = appointment.case_reference_id 
      LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
      LEFT JOIN bed ON ipd_details.bed = bed.id
      LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
      LEFT JOIN floor ON bed_group.floor = floor.id 
      WHERE 
      ipd_details.discharged = 'no' `;

      if (search) {
        const condition = `
      and (concat('IPDN',"",ipd_details.id) like ? or appointment.id like ? or ipd_details.case_reference_id like ? or patients.patient_name like ? or patients.gender like ? or patients.mobileno like ? or staff.name like ? or bed.name like ? or ipd_details.date like ? ) `;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        values.push(
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
          pattern,
        );
      }

      baseQuery += ` ORDER BY ipd_details.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];

      const ipdDetailsSearchraw = await this.connection.query(
        baseQuery,
        paginatedValues,
      );

      const ipdDetailsSearch = ipdDetailsSearchraw.map((item: any) => ({
        ...item,
        credit_limit:
          item.credit_limit != null
            ? parseFloat(item.credit_limit).toFixed(2)
            : '0.00',
      }));

      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ipdDetailsSearch,
        total: countResult.total ?? 0,
      };
    } catch (error) {
      console.log(error, 'errr');
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findIpdDetailSearch(search: string, limit: number, page: number) {
    const offset = limit * (page - 1);
    let values: any[] = [];

    try {
      const ipd_details = await this.connection.query(
        `select id, case_reference_id, credit_limit, date, patient_id, cons_doctor, bed_group_id, bed from ipd_details where ipd_details.discharged = 'no' limit ${limit} offset ${offset}`,
      );
      if (ipd_details.length > 0) {
        const patient_id = ipd_details.map((app) => app.patient_id);
        const staff_id = ipd_details.map((app) => app.cons_doctor);
        const bed_group_id = ipd_details.map((app) => app.bed_group_id);
        const bed_id = ipd_details.map((app) => app.bed);
        const case_reference_Id = ipd_details.map(
          (app) => app.case_reference_id,
        );
        const ipd_id = ipd_details.map((app) => app.id);

        const [patient, staff, bed, bed_group, appointment] = await Promise.all(
          [
            this.connection.query(
              `select id, patient_name, gender, mobileno from patients where id in (?)`,
              [patient_id],
            ),
            this.connection.query(
              `select id, name, surname, employee_id from staff where id in (?)`,
              [staff_id],
            ),
            this.connection.query(
              `select id, name, bed_type_id from bed where id in (?)`,
              [bed_id],
            ),
            this.connection.query(
              `select id, name, floor from bed_group where id in (?)`,
              [bed_group_id],
            ),
            this.connection.query(
              `select case_reference_id, id from appointment where case_reference_id in (?)`,
              [case_reference_Id],
            ),
          ],
        );

        const [floor, bed_type] = await Promise.all([
          this.connection.query(`select id, name from floor where id in (?)`, [
            bed_group.map((app) => app.floor),
          ]),
          this.connection.query(
            `select id, name from bed_type where id in (?)`,
            [bed.map((app) => app.bed_type_id)],
          ),
        ]);

        const patientMap = new Map(patient_id.map((p) => [p.id, p]));
        const doctorMap = new Map(staff.map((s) => [s.id, s]));
        const bedMap = new Map(bed.map((b) => [b.id, b]));
        const bedGroupMap = new Map(bed_group.map((bg) => [bg.id, bg]));
        const appointmentMap = new Map(
          appointment.map((a) => [a.case_reference_id, a]),
        );
        const floor_map = new Map(floor.map((f) => [f.id, f]));
        const bed_type_map = new Map(bed_type.map((f) => [f.id, f]));

        const floor_mapped_details = await Promise.all(
          bed_group.map(async (det) => {
            det.floor_details = floor_map.get(Number(det.floor));
          }),
        );
        const bed_type_mapped_details = await Promise.all(
          bed.map(async (det) => {
            det.bed_type_details = bed_type_map.get(Number(det.bed_type_id));
          }),
        );

        const Ipd_mapped_details = await Promise.all(
          ipd_details.map(async (detail) => {
            detail.patient_details = patientMap.get(Number(detail.patient_id));
            detail.doctor_details = doctorMap.get(Number(detail.cons_doctor));
            detail.bed_details = bedMap.get(Number(detail.bed));
            detail.bed_group_details = bedGroupMap.get(
              Number(detail.bed_group_id),
            );
            detail.appointment_details = appointmentMap.get(
              detail.case_reference_id,
            );

            return ipd_details;
          }),
        );
      }

      const [count] = await this.connection.query(
        `select count(id) total from ipd_details where ipd_details.discharged = 'no'`,
      );

      return {
        details: ipd_details,
        count: count.total,
      };
    } catch (error) {
      console.log(error, 'errr');
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
