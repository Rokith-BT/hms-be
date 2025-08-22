import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalOpdCharge } from './entities/internal-opd-charge.entity';
import { CountDto } from './internal-opd-charges.dto';

@Injectable()
export class InternalOpdChargesService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(charges_entitys: InternalOpdCharge[]) {
    try {
      for (const charges_entity of charges_entitys) {
        const [hosPatient] = await this.connection.query(
          `select patient_id from opd_details where opd_details.id = ?`,
          [charges_entity.opd_id],
        );
        const hos_patient_id = hosPatient.patient_id;
        const [patientId] = await this.connection.query(
          'SELECT aayush_unique_id FROM patients WHERE id = ?',
          [hos_patient_id],
        );
        if (!patientId || patientId.length === 0) {
          throw new Error(` with id: ${hos_patient_id} not found.`);
        }
        const email = patientId.aayush_unique_id;
        const dynamicPatient = await this.dynamicConnection.query(
          'SELECT id FROM patients WHERE aayush_unique_id = ?',
          [email],
        );
        const dynamicOPDPatientId = dynamicPatient[0].id;
        const result = await this.connection.query(
          `Insert into patient_charges (date,opd_id,qty,charge_id,standard_charge,
        tpa_charge,tax,apply_charge,amount,note,patient_id,payment_status,total)
      values (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            charges_entity.date,
            charges_entity.opd_id,
            charges_entity.qty,
            charges_entity.charge_id,
            charges_entity.standard_charge,
            charges_entity.tpa_charge,
            charges_entity.tax,
            charges_entity.apply_charge,
            charges_entity.amount,
            charges_entity.note,
            hos_patient_id,
            'unpaid',
            charges_entity.amount,
          ],
        );

        const [opd_id] = await this.dynamicConnection.query(
          `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
          [charges_entity.Hospital_id, charges_entity.opd_id],
        );

        const [charges] = await this.dynamicConnection.query(
          `select id from charges where Hospital_id = ? and hospital_charges_id = ?`,
          [charges_entity.Hospital_id, charges_entity.charge_id],
        );

        try {
          await this.dynamicConnection.query(
            `insert into patient_charges(date,opd_id,qty,charge_id,standard_charge,
    tpa_charge,tax,apply_charge,amount,note,patient_id,Hospital_id,hos_patient_charges_id,payment_status,total) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              charges_entity.date,
              opd_id.id,
              charges_entity.qty,
              charges.id,
              charges_entity.standard_charge,
              charges_entity.tpa_charge,
              charges_entity.tax,
              charges_entity.apply_charge,
              charges_entity.amount,
              charges_entity.note,
              dynamicOPDPatientId,
              charges_entity.Hospital_id,
              result.insertId,
              'unpaid',
              charges_entity.amount,
            ],
          );
        } catch (error) {}
      }
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PATIENT_CHARGES,
          },
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

  async findAll(opd_id: number, patient_id: number) {
    try {
      const opd_charges = await this.connection.query(
        `select distinct patients.id, patient_charges.date,
    charges.name,
    patient_charges.note,
    charge_type_master.charge_type,
    charge_categories.name as charge_category,
    concat(patient_charges.qty," ",charge_units.unit)as qty,
    charges.standard_charge,
    organisations_charges.org_charge as TPA_charge,
    CONCAT(FORMAT(( (patient_charges.apply_charge /10)), 2), "(", tax_category.percentage, "%)") AS tax1,
    patient_charges.apply_charge as applied_charges,
    patient_charges.total as amount from charges
    left join charge_categories on charges.charge_category_id = charge_categories.id
    left join charge_units on charges.charge_unit_id =  charge_units.id
    left join organisations_charges on organisations_charges.charge_id = charges.id
    left join tax_category on charges.tax_category_id = tax_category.id
    left join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
    left join patient_charges on patient_charges.charge_id = charges.id
    left join opd_details on opd_details.id = patient_charges.opd_id
    left join patients on opd_details.patient_id = patients.id
    where opd_id = ? and patients.id = ?`,
        [opd_id, patient_id],
      );
      return opd_charges;
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

  async update(id: string, charges_entity: InternalOpdCharge) {
    try {
      await this.connection.query(
        `update patient_charges SET qty = ?,date = ?,note =?, standard_charge = ?,tpa_charge = ?,
      apply_charge = ?, amount = ? , tax = ?, total = ? where id = ?`,
        [
          charges_entity.qty,
          charges_entity.date,
          charges_entity.note,
          charges_entity.standard_charge,
          charges_entity.tpa_charge,
          charges_entity.apply_charge,
          charges_entity.amount,
          charges_entity.tax,
          charges_entity.amount,
          id,
        ],
      );
      await this.dynamicConnection.query(
        `update patient_charges SET qty = ?,date = ?,note =?, standard_charge = ?,tpa_charge = ?,
      apply_charge = ?, amount = ? , tax = ?, total = ? where hos_patient_charges_id = ? and Hospital_id = ?`,
        [
          charges_entity.qty,
          charges_entity.date,
          charges_entity.note,
          charges_entity.standard_charge,
          charges_entity.tpa_charge,
          charges_entity.apply_charge,
          charges_entity.amount,
          charges_entity.tax,
          charges_entity.amount,
          id,
          charges_entity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PATIENT_CHARGES_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM patient_charges WHERE id = ?',
              [id],
            ),
          },
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
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    await this.connection.query('DELETE FROM patient_charges WHERE id = ?', [
      id,
    ]);

    try {
      const opd_charge = await this.dynamicConnection.query(
        `select id from patient_charges where hos_patient_charges_id = ?`,
        [id],
      );
      const opd_charges = opd_charge[0].id;
      await this.dynamicConnection.query(
        `DELETE FROM patient_charges where id = ? and  Hospital_id = ? `,
        [opd_charges, Hospital_id],
      );
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

  async findcharges(id: string) {
    try {
      const opd_charges = await this.connection.query(
        `select charges.id,charges.name from charges where charge_category_id = ?`,
        [id],
      );
      return opd_charges;
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
  async findAmount(id: number) {
    try {
      const opd_amount = await this.connection.query(
        `select patient_charges.standard_charge,patient_charges.tax,patient_charges.apply_charge,
  patient_charges.amount from patient_charges where charge_id = ?`,
        [id],
      );
      return opd_amount;
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
  async findOpdChargesDetailsSearch(
    patientId: number,
    opdDetailsId: number,
    search: string,
  ): Promise<InternalOpdCharge[]> {
    let query = `select distinct patients.id, patient_charges.date,
  charges.name,
  patient_charges.note,
  charge_type_master.charge_type,
  charge_categories.name as charge_category,
  concat(patient_charges.qty," ",charge_units.unit)as qty,
  charges.standard_charge,
  organisations_charges.org_charge as TPA_charge,
  CONCAT(FORMAT(( (patient_charges.apply_charge /10)), 2), "(", tax_category.percentage, "%)") AS tax1,
  patient_charges.apply_charge as applied_charges,
  patient_charges.amount as amount from charges
  left join charge_categories on charges.charge_category_id = charge_categories.id
  left join charge_units on charges.charge_unit_id =  charge_units.id
  left join organisations_charges on organisations_charges.charge_id = charges.id
  left join tax_category on charges.tax_category_id = tax_category.id
  left join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
  left join patient_charges on patient_charges.charge_id = charges.id
  left join opd_details on opd_details.id = patient_charges.opd_id
  left join patients on opd_details.patient_id = patients.id
  where patients.id = ? and opd_id = ? `;
    let values: (number | string)[] = [patientId, opdDetailsId];

    if (search) {
      query += ` AND (patient_charges.date LIKE ?
                    OR charges.name LIKE ?
                    OR charge_type_master.charge_type LIKE ?
                    OR charge_categories.name LIKE ?
                    OR concat(patient_charges.qty," ",charge_units.unit) LIKE ?
                    OR charges.standard_charge LIKE ?
                    OR organisations_charges.org_charge LIKE ?
                    OR patient_charges.apply_charge LIKE ?
                    OR CONCAT(FORMAT(( (patient_charges.apply_charge /10)), 2), "(", tax_category.percentage, "%)") LIKE ?
                    OR patient_charges.amount LIKE ? )`;

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

  async findOpdChargesDetailsSearchCount(
    limit: number,
    page: number,
    opdDetailsId: number,
    search: string,
  ): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';

      if (search) {
        searchClause = `
      (
        patient_charges.date LIKE '%${search}%' OR
        charges.name LIKE '%${search}%' OR
        patient_charges.standard_charge LIKE '%${search}%' OR
        patient_charges.apply_charge LIKE '%${search}%' OR
        patient_charges.additional_charge LIKE '%${search}%' OR
        patient_charges.discount_amount LIKE '%${search}%' OR
        patient_charges.tax LIKE '%${search}%' OR
        patient_charges.amount LIKE '%${search}%' OR
        patient_charges.tpa_charge LIKE '%${search}%' OR
        patient_charges.payment_status LIKE '%${search}%' 
              )
    `;
        dateCondition += ` AND ${searchClause}`;
      }

      const charges = await this.connection.query(
        `select patient_charges.id as patient_charge_id,patients.id, date(patient_charges.date) as Date,
    charges.name, patient_charges.qty as qty, patient_charges.standard_charge as standard_charge, 
    patient_charges.apply_charge as applied_charge, patient_charges.additional_charge as additional_charges,
    patient_charges.discount_amount, patient_charges.discount_percentage, 
   ROUND( ((patient_charges.apply_charge + patient_charges.additional_charge) - patient_charges.discount_amount ),2) as sub_total,
    patient_charges.tax as tax_percentage, 
    Round((((patient_charges.apply_charge + patient_charges.additional_charge) - patient_charges.discount_amount )*patient_charges.tax/100),2) as tax_amount,
    patient_charges.amount as net_amount,
    patient_charges.payment_status,
    patient_charges.tpa_charge,
    patient_charges.total as total 
    from patient_charges
    left join patients on patient_charges.patient_id = patients.id
    left join charges on patient_charges.charge_id = charges.id
    where opd_id = ? ${dateCondition} LIMIT ? OFFSET ? `,
        [opdDetailsId, Number(limit), Number(offset)],
      );
      console.log('aaa', charges);

      const [totalCount] = await this.connection.query(
        `
  SELECT COUNT(*) AS total_count
  FROM patient_charges
  LEFT JOIN charges ON patient_charges.charge_id = charges.id
  WHERE opd_id = ?  ${dateCondition}
`,
        [opdDetailsId],
      );

      let variable = {
        details: charges,
        limit: limit,
        page: page,
        total: totalCount.total_count,
      };

      return variable;
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
