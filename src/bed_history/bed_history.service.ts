import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BedHistory } from './entities/bed_history.entity';
import {CountDto} from './dto/bed_history.dto';

@Injectable()
export class BedHistoryService {
  constructor(private readonly connection: DataSource) {}

  async findBedHistory(id: number): Promise<BedHistory | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
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
      const getBedHistoryByID = await this.connection.query(
        `SELECT bed_group.name AS BedGroup, 
    bed.name AS Bed, 
    patient_bed_history.from_date AS FromDate, 
    patient_bed_history.to_date AS ToDate,
    patient_bed_history.is_active AS ActiveBed,
    patient_bed_history.case_reference_id,
    ipd_details.id
    FROM patient_bed_history
    LEFT JOIN bed_group ON patient_bed_history.bed_group_id = bed_group.id
    LEFT JOIN bed ON patient_bed_history.bed_id = bed.id
    LEFT JOIN case_references ON patient_bed_history.case_reference_id = case_references.id
    left join ipd_details on ipd_details.case_reference_id = case_references.id
    WHERE ipd_details.id = ?`,
        [id],
      );

      return getBedHistoryByID;
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

  async findBedHistorySearch(
    id: number,
    search: string,
  ): Promise<BedHistory | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
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
      let query = `SELECT bed_group.name AS BedGroup, 
      bed.name AS Bed, 
      patient_bed_history.from_date AS FromDate, 
      patient_bed_history.to_date AS ToDate,
      patient_bed_history.is_active AS ActiveBed,
      patient_bed_history.case_reference_id,
      ipd_details.id
      FROM patient_bed_history
      LEFT JOIN bed_group ON patient_bed_history.bed_group_id = bed_group.id
      LEFT JOIN bed ON patient_bed_history.bed_id = bed.id
      LEFT JOIN case_references ON patient_bed_history.case_reference_id = case_references.id
      left join ipd_details on ipd_details.case_reference_id = case_references.id
      WHERE ipd_details.id = ?`;

      let values = [];
      values.push(id);

      if (search) {
        query += `  and (bed.name like ? or patient_bed_history.from_date like ? or patient_bed_history.to_date like ? or patient_bed_history.is_active like ? or bed_group.name like ?)  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }
      const getBedHistorysch = await this.connection.query(query, values);
      return getBedHistorysch;
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


  async findIpdBedHistoryDetails(
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
        SELECT bed_group.name AS BedGroup, 
      bed.name AS Bed, 
      patient_bed_history.from_date AS FromDate, 
      patient_bed_history.to_date AS ToDate,
      patient_bed_history.is_active AS ActiveBed,
      patient_bed_history.case_reference_id,
      ipd_details.id
      FROM patient_bed_history
      LEFT JOIN bed_group ON patient_bed_history.bed_group_id = bed_group.id
      LEFT JOIN bed ON patient_bed_history.bed_id = bed.id
      LEFT JOIN case_references ON patient_bed_history.case_reference_id = case_references.id
      left join ipd_details on ipd_details.case_reference_id = case_references.id
      WHERE ipd_details.id = ?`;
  
      let countQuery = `
        SELECT COUNT(patient_bed_history.id) AS total
        FROM patient_bed_history
      LEFT JOIN bed_group ON patient_bed_history.bed_group_id = bed_group.id
      LEFT JOIN bed ON patient_bed_history.bed_id = bed.id
      LEFT JOIN case_references ON patient_bed_history.case_reference_id = case_references.id
      left join ipd_details on ipd_details.case_reference_id = case_references.id
      WHERE ipd_details.id = ?`;
  
      if (search) {
        const condition = `
          and (bed.name like ? or patient_bed_history.from_date like ? or patient_bed_history.to_date like ? or patient_bed_history.is_active like ? or bed_group.name like ?)`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(5).fill(pattern);
        values = [id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY patient_bed_history.to_date DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdBedHistory = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdBedHistory,
        total: countResult?.total ?? 0,
      };
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



  async findIpdBedHistoryDetail(
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
        SELECT bed_group.name AS BedGroup, 
      bed.name AS Bed, 
      patient_bed_history.from_date AS FromDate, 
      patient_bed_history.to_date AS ToDate,
      patient_bed_history.is_active AS ActiveBed,
      patient_bed_history.case_reference_id,
      ipd_details.id
      FROM patient_bed_history
      LEFT JOIN bed_group ON patient_bed_history.bed_group_id = bed_group.id
      LEFT JOIN bed ON patient_bed_history.bed_id = bed.id
      LEFT JOIN case_references ON patient_bed_history.case_reference_id = case_references.id
      left join ipd_details on ipd_details.case_reference_id = case_references.id
      WHERE ipd_details.id = ?`;
  
      let countQuery = `
        SELECT COUNT(patient_bed_history.id) AS total
        FROM patient_bed_history
      LEFT JOIN bed_group ON patient_bed_history.bed_group_id = bed_group.id
      LEFT JOIN bed ON patient_bed_history.bed_id = bed.id
      LEFT JOIN case_references ON patient_bed_history.case_reference_id = case_references.id
      left join ipd_details on ipd_details.case_reference_id = case_references.id
      WHERE ipd_details.id = ?`;
  
      if (search) {
        const condition = `
          and (bed.name like ? or patient_bed_history.from_date like ? or patient_bed_history.to_date like ? or patient_bed_history.is_active like ? or bed_group.name like ?)`;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        searchValues = Array(5).fill(pattern);
        values = [id, ...searchValues];
      }
  
      baseQuery += ` ORDER BY patient_bed_history.to_date DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];
  
      const ipdBedHistory = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: ipdBedHistory,
        total: countResult?.total ?? 0,
      };
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



}
