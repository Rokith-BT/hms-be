import { Injectable } from '@nestjs/common';
import { CreateSarvamJobOpdIdMappingDto } from './dto/create-sarvam_job_opd_id_mapping.dto';
import { UpdateSarvamJobOpdIdMappingDto } from './dto/update-sarvam_job_opd_id_mapping.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SarvamJobOpdIdMappingService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createSarvamJobOpdIdMappingDto: CreateSarvamJobOpdIdMappingDto) {
    const insertQuery = `INSERT INTO sarvam_job_id_opd_id (sarvam_job_id, opd_id) values (?, ?)`;
    const values = [createSarvamJobOpdIdMappingDto.job_id, createSarvamJobOpdIdMappingDto.opd_id];
     await this.dynamicConnection.query(insertQuery, values);
    return {
      status: 'success',
      message: 'Sarvam Job Opd Id Mapping created successfully'
    };
  }

 async findAll(opd_id:number) {
    const getData = await this.dynamicConnection.query(`select sarvam_job_id from sarvam_job_id_opd_id where opd_id  = ?`,[opd_id]);

    return {
      status: 'success',
      message: 'Sarvam Job Opd Id Mapping fetched successfully',
      data: getData
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} sarvamJobOpdIdMapping`;
  }

  update(id: number, updateSarvamJobOpdIdMappingDto: UpdateSarvamJobOpdIdMappingDto) {
    return `This action updates a #${id} sarvamJobOpdIdMapping`;
  }

  remove(id: number) {
    return `This action removes a #${id} sarvamJobOpdIdMapping`;
  }
}
