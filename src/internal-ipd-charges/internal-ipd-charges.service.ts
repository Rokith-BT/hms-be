import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalIpdCharge } from './entities/internal-ipd-charge.entity';
import { CountDto } from './dto/internal-ipd-charges.dto';
import { log } from 'console';

@Injectable()
export class InternalIpdChargesService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(charges_entitys: InternalIpdCharge[]) {
    try {
      for (const charges_entity of charges_entitys) {
        const [patId] = await this.connection.query(
          'SELECT patient_id FROM ipd_details WHERE id = ?',
          [charges_entity.ipd_id],
        );
        const patientsid = patId.patient_id;
        const [patientId] = await this.connection.query(
          'SELECT aayush_unique_id FROM patients WHERE id = ?',
          [patientsid],
        );
        if (!patientId || patientId.length === 0) {
          throw new Error(` ${process.env.VALIDATION_CHECK} ${patientsid} ${process.env.VALIDATION_NOT_FOUND}`);
        }
        const email = patientId.aayush_unique_id;

        const result = await this.connection.query(
          `Insert into patient_charges (date,ipd_id,qty,charge_id,patient_id,payment_status,standard_charge,
          tpa_charge,tax,apply_charge,amount,note,total)
        values (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            charges_entity.date,
            charges_entity.ipd_id,
            charges_entity.qty,
            charges_entity.charge_id,
            patientsid,
            'unpaid',
            charges_entity.standard_charge,
            charges_entity.tpa_charge,
            charges_entity.tax,
            charges_entity.apply_charge,
            charges_entity.amount,
            charges_entity.note,
            charges_entity.amount
          ],
        );

        const dynamicPatient = await this.dynamicConnection.query(
          'SELECT id FROM patients WHERE aayush_unique_id = ?',
          [email],
        );
        const dynamicIPDPatientId = dynamicPatient[0].id;

        const [ipd_id] = await this.dynamicConnection.query(
          `select id from ipd_details where hospital_id = ? and hospital_ipd_details_id = ?`,
          [charges_entity.Hospital_id, charges_entity.ipd_id],
        );

        const [charges] = await this.dynamicConnection.query(
          `select id from charges where Hospital_id = ? and hospital_charges_id = ?`,
          [charges_entity.Hospital_id, charges_entity.charge_id],
        );
        try {
          await this.dynamicConnection.query(
            `insert into patient_charges(date,ipd_id,qty,charge_id,patient_id,standard_charge,
      tpa_charge,tax,apply_charge,amount,note,Hospital_id,hos_patient_charges_id,payment_status,total) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              charges_entity.date,
              ipd_id.id,
              charges_entity.qty,
              charges.id,
              dynamicIPDPatientId,
              charges_entity.standard_charge,
              charges_entity.tpa_charge,
              charges_entity.tax,
              charges_entity.apply_charge,
              charges_entity.amount,
              charges_entity.note,
              charges_entity.Hospital_id,
              result.insertId,
              'unpaid',
              charges_entity.amount
            ],
          );
        } catch (error) {
          throw new Error(process.env.CHARGES_ERROR_MSG);
        }
      }
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.CHARGES_RETURN_MESSAGE,
          },
        },
      ];
    } catch (error) {
      throw new Error(process.env.CHARGES_ERROR_MSG);
    }
  }

  async findAll(ipd_id: number, patient_id: number) {
    const ipd_charges = await this.connection.query(
      `select patient_charges.id,patient_charges.date,charges.name as ChargeName,charge_type_master.charge_type as ChargeType,
      charge_categories.name as ChargeCategory,concat(patient_charges.qty," ",charge_units.unit)as qty,patient_charges.standard_charge,
      patient_charges.tpa_charge,CONCAT(FORMAT(( (patient_charges.apply_charge /10)), 2), "(", tax_category.percentage, "%)") AS tax1,
      patient_charges.apply_charge,patient_charges.amount
      from patient_charges
      join charges on charges.id = patient_charges.charge_id
      join charge_categories on charge_categories.id = charges.charge_category_id
      join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
      left join charge_units on charges.charge_unit_id =  charge_units.id
      left join tax_category on charges.tax_category_id = tax_category.id
      where ipd_id = ? and patient_id = ?;`,
      [ipd_id, patient_id],
    );
    return ipd_charges;
  }

  async update(id: string, charges_entitys: InternalIpdCharge) {
    try {
      await this.connection.query(
        `update patient_charges SET qty = ?,date = ?,note =?, standard_charge = ?,tpa_charge = ?,
        apply_charge = ?, amount = ? , tax = ?, total = ? where id = ?`,
        [
          charges_entitys.qty,
          charges_entitys.date,
          charges_entitys.note,
          charges_entitys.standard_charge,
          charges_entitys.tpa_charge,
          charges_entitys.apply_charge,
          charges_entitys.amount,
          charges_entitys.tax,
          charges_entitys.amount,
          id
        ],
      );

      await this.dynamicConnection.query(
        `update patient_charges SET qty = ?,date = ?,note =?, standard_charge = ?,tpa_charge = ?,
        apply_charge = ?, amount = ? , tax = ? ,total = ? where hos_patient_charges_id = ? and Hospital_id = ?`,
        [
          charges_entitys.qty,
          charges_entitys.date,
          charges_entitys.note,
          charges_entitys.standard_charge,
          charges_entitys.tpa_charge,
          charges_entitys.apply_charge,
          charges_entitys.amount,
          charges_entitys.tax,
          charges_entitys.amount,
          id,
          charges_entitys.Hospital_id
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.CHARGES_RETURN_UPDATE_MESSAGE,
          },
        },
      ];
    } catch (error) {
      throw new Error(process.env.CHARGES_ERROR_MSG);
    }
  }

  async remove(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM patient_charges WHERE id = ?', [
        id,
      ]);
      const dynamicDeletePatientCharges = await this.dynamicConnection.query(
        'SELECT id FROM patient_charges WHERE hos_patient_charges_id = ? and Hospital_id = ?',
        [id, Hospital_id],
      );
      const dynamicDeletePatientchargesId = dynamicDeletePatientCharges[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM patient_charges WHERE id = ? ',
        [dynamicDeletePatientchargesId],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.CHARGES_DELETE_MESSAGE} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new Error(process.env.CHARGES_ERROR_MSG);
    }
  }

  async findcharges(id: string) {
    const opd_charges = await this.connection.query(
      `select charges.id,charges.name from charges where charge_category_id = ?`,
      [id],
    );
    return opd_charges;
  }

  async findAmount(id: number) {
    const opd_amount = await this.connection.query(
      `select patient_charges.id,patient_charges.standard_charge,patient_charges.tax,patient_charges.apply_charge,
    patient_charges.amount from patient_charges where charge_id = ?`,
      [id],
    );
    return opd_amount;
  }

  async findOpdChargesDetailsSearch(
    patientId: number,
    ipdDetailsId: number,
    search: string,
  ): Promise<InternalIpdCharge[]> {
    let query = `select patient_charges.id,patient_charges.date,charges.name as ChargeName,charge_type_master.charge_type as ChargeType,
    charge_categories.name as ChargeCategory,concat(patient_charges.qty," ",charge_units.unit)as qty,patient_charges.standard_charge,
    patient_charges.tpa_charge,CONCAT(FORMAT(( (patient_charges.apply_charge /10)), 2), "(", tax_category.percentage, "%)") AS tax1,
    patient_charges.apply_charge,patient_charges.amount
    from patient_charges
    join charges on charges.id = patient_charges.charge_id
    join charge_categories on charge_categories.id = charges.charge_category_id
    join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
    left join charge_units on charges.charge_unit_id =  charge_units.id
    left join tax_category on charges.tax_category_id = tax_category.id
    where patient_id = ? and ipd_id = ? `;

    let values: (number | string)[] = [patientId, ipdDetailsId];

    if (search) {
      query += ` AND (patient_charges.date LIKE ?
                      OR charges.name LIKE ?
                      OR charge_type_master.charge_type LIKE ?
                      OR charge_categories.name LIKE ?
                      OR concat(patient_charges.qty," ",charge_units.unit) LIKE ?
                      OR charges.standard_charge LIKE ?
                      OR patient_charges.tpa_charge LIKE ?
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
      throw new Error(process.env.CHARGES_ERROR_MESSAGE);
    }
  }

  async findIpdChargeDetails(
    ipd_id: number,
    patient_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id, patient_id];
    let searchValues: any[] = [];

    try {
      let baseQuery = `
        select patient_charges.id,patient_charges.date,charges.name as ChargeName,charge_type_master.charge_type as ChargeType,
      charge_categories.name as ChargeCategory,concat(patient_charges.qty," ",charge_units.unit)as qty,patient_charges.standard_charge,
      patient_charges.tpa_charge,CONCAT(
    FORMAT(patient_charges.apply_charge * (tax_category.percentage / 100), 2),
    " (", tax_category.percentage, "%)"
  ) AS tax1,
      patient_charges.apply_charge,patient_charges.amount,
      patient_charges.payment_status 
      from patient_charges
      join charges on charges.id = patient_charges.charge_id
      join charge_categories on charge_categories.id = charges.charge_category_id
      join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
      left join charge_units on charges.charge_unit_id =  charge_units.id
      left join tax_category on charges.tax_category_id = tax_category.id
      where ipd_id = ? and patient_id = ? `;

      let countQuery = `
        SELECT COUNT(patient_charges.id) AS total
        from patient_charges
      join charges on charges.id = patient_charges.charge_id
      join charge_categories on charge_categories.id = charges.charge_category_id
      join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
      left join charge_units on charges.charge_unit_id =  charge_units.id
      left join tax_category on charges.tax_category_id = tax_category.id
      where ipd_id = ? and patient_id = ?`;

      if (search) {
        const condition = `
          AND (patient_charges.date LIKE ?
                      OR charges.name LIKE ?
                      OR charge_type_master.charge_type LIKE ?
                      OR charge_categories.name LIKE ?
                      OR concat(patient_charges.qty," ",charge_units.unit) LIKE ?
                      OR charges.standard_charge LIKE ?
                      OR patient_charges.tpa_charge LIKE ?
                      OR patient_charges.apply_charge LIKE ?
                      OR CONCAT(
    FORMAT(patient_charges.apply_charge * (tax_category.percentage / 100), 2),
    " (", tax_category.percentage, "%)"
  ) LIKE ?
                      OR patient_charges.amount LIKE ?
                      OR patient_charges.payment_status LIKE ? )`;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        searchValues = Array(11).fill(pattern);
        values = [ipd_id, patient_id, ...searchValues];
      }

      baseQuery += ` ORDER BY patient_charges.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const ipdChargesraw = await this.connection.query(
        baseQuery,
        paginatedValues,
      );

      const ipdCharges = ipdChargesraw.map((item: any) => ({
        ...item,
        standard_charge: item.standard_charge != null ? parseFloat(item.standard_charge).toFixed(2) : '0.00',
        tpa_charge: item.tpa_charge != null ? parseFloat(item.tpa_charge).toFixed(2) : '0.00',
        apply_charge: item.apply_charge != null ? parseFloat(item.apply_charge).toFixed(2) : '0.00',
        amount: item.amount != null ? parseFloat(item.amount).toFixed(2) : '0.00',
      }));


      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ipdCharges,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
          process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  async findIpdChargeDetail(
    ipd_id: number,
    patient_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id, patient_id];
    let searchValues: any[] = [];

    try {
      let baseQuery = `
        SELECT 
  patient_charges.id,
  patient_charges.date,
  charges.name AS ChargeName,
  charge_type_master.charge_type AS ChargeType,
  charge_categories.name AS ChargeCategory,
  CONCAT(patient_charges.qty, " ", charge_units.unit) AS qty,
  patient_charges.standard_charge,
  patient_charges.tpa_charge,
  SELECT 
  patient_charges.id,
  patient_charges.date,
  charges.name AS ChargeName,
  charge_type_master.charge_type AS ChargeType,
  charge_categories.name AS ChargeCategory,
  CONCAT(patient_charges.qty, " ", charge_units.unit) AS qty,
  patient_charges.standard_charge,
  patient_charges.tpa_charge,
  CONCAT(
    FORMAT(patient_charges.apply_charge * (tax_category.percentage / 100), 2),
    " (", tax_category.percentage, "%)"
  ) AS tax1,
  patient_charges.apply_charge,
  patient_charges.amount,
  patient_charges.payment_status 
FROM 
  patient_charges
JOIN 
  charges ON charges.id = patient_charges.charge_id
JOIN 
  charge_categories ON charge_categories.id = charges.charge_category_id
JOIN 
  charge_type_master ON charge_type_master.id = charge_categories.charge_type_id
LEFT JOIN 
  charge_units ON charges.charge_unit_id = charge_units.id
LEFT JOIN 
  tax_category ON charges.tax_category_id = tax_category.id
WHERE 
  ipd_id = ? AND patient_id = ?
,
  patient_charges.apply_charge,
  patient_charges.amount,
  patient_charges.payment_status 
FROM 
  patient_charges
JOIN 
  charges ON charges.id = patient_charges.charge_id
JOIN 
  charge_categories ON charge_categories.id = charges.charge_category_id
JOIN 
  charge_type_master ON charge_type_master.id = charge_categories.charge_type_id
LEFT JOIN 
  charge_units ON charges.charge_unit_id = charge_units.id
LEFT JOIN 
  tax_category ON charges.tax_category_id = tax_category.id
WHERE 
  ipd_id = ? AND patient_id = ?
 `;

      let countQuery = `
        SELECT COUNT(patient_charges.id) AS total
        from patient_charges
      join charges on charges.id = patient_charges.charge_id
      join charge_categories on charge_categories.id = charges.charge_category_id
      join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
      left join charge_units on charges.charge_unit_id =  charge_units.id
      left join tax_category on charges.tax_category_id = tax_category.id
      where ipd_id = ? and patient_id = ?`;

      if (search) {
        const condition = `
          AND (patient_charges.date LIKE ?
                      OR charges.name LIKE ?
                      OR charge_type_master.charge_type LIKE ?
                      OR charge_categories.name LIKE ?
                      OR concat(patient_charges.qty," ",charge_units.unit) LIKE ?
                      OR charges.standard_charge LIKE ?
                      OR patient_charges.tpa_charge LIKE ?
                      OR patient_charges.apply_charge LIKE ?
                      OR CONCAT(
    FORMAT(patient_charges.apply_charge * (tax_category.percentage / 100), 2),
    " (", tax_category.percentage, "%)"
  ) LIKE ?
                      OR patient_charges.amount LIKE ?
                      OR patient_charges.payment_status LIKE ? )`;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        searchValues = Array(11).fill(pattern);
        values = [ipd_id, patient_id, ...searchValues];
      }

      baseQuery += ` ORDER BY patient_charges.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const ipdChargesraw = await this.connection.query(
        baseQuery,
        paginatedValues,
      );

      const ipdCharges = ipdChargesraw.map((item: any) => ({
        ...item,
        standard_charge: item.standard_charge != null ? parseFloat(item.standard_charge).toFixed(2) : '0.00',
        tpa_charge: item.tpa_charge != null ? parseFloat(item.tpa_charge).toFixed(2) : '0.00',
        apply_charge: item.apply_charge != null ? parseFloat(item.apply_charge).toFixed(2) : '0.00',
        amount: item.amount != null ? parseFloat(item.amount).toFixed(2) : '0.00',
      }));


      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ipdCharges,
        total: countResult?.total ?? 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
          process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }




}
