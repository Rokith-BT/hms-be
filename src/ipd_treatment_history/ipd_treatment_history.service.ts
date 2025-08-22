import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IpdTreatmentHistory } from './entities/ipd_treatment_history.entity';
import { CountDto } from './dto/ipd_treatment_history.dto';

@Injectable()
export class IpdTreatmentHistoryService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async findTreatmentHistorySearch(
    id: number,
    search: string,
  ): Promise<IpdTreatmentHistory | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM patients WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK} `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      let query = `SELECT concat('IPDN',"",ipd_details.id) AS IPD_No,
    ipd_details.symptoms AS Symptoms,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS Consultant,
    concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
    patients.id,
    ipd_details.discharged
    FROM ipd_details
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN floor ON bed_group.floor = floor.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    WHERE patients.id = ? AND ipd_details.discharged = 'yes'`;
      let values = [];
      values.push(id);
      if (search) {
        query += `  and (concat('IPDN',"",ipd_details.id) like ? or ipd_details.symptoms like ? or CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") like ? or concat(bed.name,"-",bed_group.name,"-",floor.name) like ? )  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }
      const getTreatmentHistorysch = await this.connection.query(query, values);
      return getTreatmentHistorysch;
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

  async findIpdTreatmentHistory(
    id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [id];
    let searchValues: any[] = [];

    try {
      let baseQuery = `
        SELECT concat('IPDN',"",ipd_details.id) AS IPD_No,
    ipd_details.symptoms AS Symptoms,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS Consultant,
    concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
    patients.id,
    ipd_details.discharged,
    discharge_card.id AS DichargeCardId,
    discharge_card.discharge_date
    FROM ipd_details
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN discharge_card ON ipd_details.id = discharge_card.ipd_details_id
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN floor ON bed_group.floor = floor.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    WHERE patients.id = ? AND ipd_details.discharged = 'yes'`;

      let countQuery = `
        SELECT COUNT(ipd_details.id) AS total
        FROM ipd_details
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN floor ON bed_group.floor = floor.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    WHERE patients.id = ? AND ipd_details.discharged = 'yes'`;

      if (search) {
        const condition = `
          and (concat('IPDN',"",ipd_details.id) like ? or ipd_details.symptoms like ? or CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") like ? or concat(bed.name,"-",bed_group.name,"-",floor.name) like ? )`;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        searchValues = Array(4).fill(pattern);
        values = [id, ...searchValues];
      }

      baseQuery += ` ORDER BY discharge_card.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const ipdTreatmentHistory = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ipdTreatmentHistory,
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


  async findIPDTreatmentHistory(
    id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [id];
    let searchValues: any[] = [];

    try {
      let baseQuery = `
        SELECT concat('IPDN',"",ipd_details.id) AS IPD_No,
    ipd_details.symptoms AS Symptoms,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS Consultant,
    concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,
    patients.id,
    ipd_details.discharged,
    discharge_card.id AS DichargeCardId,
    discharge_card.discharge_date
    FROM ipd_details
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN discharge_card ON ipd_details.id = discharge_card.ipd_details_id
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN floor ON bed_group.floor = floor.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    WHERE patients.id = ? AND ipd_details.discharged = 'yes'`;

      let countQuery = `
        SELECT COUNT(ipd_details.id) AS total
        FROM ipd_details
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id
    LEFT JOIN bed ON ipd_details.bed = bed.id
    LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
    LEFT JOIN floor ON bed_group.floor = floor.id
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    WHERE patients.id = ? AND ipd_details.discharged = 'yes'`;

      if (search) {
        const condition = `
          and (concat('IPDN',"",ipd_details.id) like ? or ipd_details.symptoms like ? or CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") like ? or concat(bed.name,"-",bed_group.name,"-",floor.name) like ? )`;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        searchValues = Array(4).fill(pattern);
        values = [id, ...searchValues];
      }

      baseQuery += ` ORDER BY discharge_card.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const ipdTreatmentHistory = await this.connection.query(
        baseQuery,
        paginatedValues,
      );
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ipdTreatmentHistory,
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
