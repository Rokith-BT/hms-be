import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConsultationProcessList } from './entities/consultation-process-list.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CryptoService } from 'src/qr-encrpyt/qr-encrpyt.service';

@Injectable()
export class ConsultationProcessListService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => CryptoService))
    private readonly EncryptedService: CryptoService,
  ) {}
  async create(Entity: ConsultationProcessList) {
    try {
      const insertInHos = await this.connection.query(
        `insert into PT_consultation_process_list (process_name,
  process_description,lattitude,longitude
) values(?,?,?,?)`,
        [
          Entity.process_name,
          Entity.process_description,
          Entity.lattitude,
          Entity.longitude,
        ],
      );

      await this.dynamicConnection.query(
        `insert into PT_consultation_process_list (process_name,
  process_description,
  hospital_id,
  hos_PT_consultation_process_list_id,lattitude,longitude
) values(?,?,?,?,?,?)`,
        [
          Entity.process_name,
          Entity.process_description,
          Entity.hospital_id,
          insertInHos.insertId,
          Entity.lattitude,
          Entity.longitude,
        ],
      );

      return {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.CONSULTATION_PROCESS,
        inserted_details: await this.connection.query(
          `select * from PT_consultation_process_list where id = ?`,
          [insertInHos.insertId],
        ),
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

  async findAll() {
    try {
      const getAll = await this.connection.query(
        `select * from PT_consultation_process_list`,
      );
      return getAll;
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

  async findOne(id: number) {
    try {
      const getAll = await this.connection.query(
        `select * from PT_consultation_process_list where id = ?`,
        [id],
      );

      return getAll;
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

  async findOneQR(id: number) {
    try {
      const [getAll] = await this.connection.query(
        `select * from PT_consultation_process_list where id = ?`,
        [id],
      );
      let resp = {
        QR_type_id: 2,
        QR_type: 'consultaionProcessQR',
        conslutation_process_details: getAll,
      };

      return resp;
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

  async EncryptedfindOneQR(id: number, hospital_id: number) {
    try {
      const [getAll] = await this.connection.query(
        `select id, process_name, process_description from PT_consultation_process_list where id = ?`,
        [id],
      );
      getAll.QR_type_id = 2;
      getAll.QR_type = 'consultaionProcessQR';
      let resp = getAll;
      getAll.hospital_id = hospital_id;

      const encrypt_apicall = await this.EncryptedService.encrypt(
        JSON.stringify(resp),
        process.env.encryption_key,
        process.env.encryption_iv,
      );
      getAll.hospital_id = hospital_id;
      return encrypt_apicall;
    } catch (error) {
      console.log(error, 'error');

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, Entity: ConsultationProcessList) {
    try {
      await this.connection.query(
        `update PT_consultation_process_list set process_name = ?,
  process_description = ?
where id = ?`,
        [Entity.process_name, Entity.process_description, id],
      );
      await this.dynamicConnection.query(
        `update  PT_consultation_process_list SET process_name = ?,
  process_description = ? where
  hospital_id = ? and
  hos_PT_consultation_process_list_id = ?`,
        [
          Entity.process_name,
          Entity.process_description,
          Entity.hospital_id,
          id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CONSULTATION_PROCESS_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM PT_consultation_process_list WHERE id = ?',
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
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    await this.connection.query(
      `delete from PT_consultation_process_list where id = ?`,
      [id],
    );

    try {
      const deladmin = await this.dynamicConnection.query(
        `select id from PT_consultation_process_list where hos_PT_consultation_process_list_id = ? `,
        [id],
      );
      const deleteadmin = deladmin[0].id;

      await this.dynamicConnection.query(
        `delete from PT_consultation_process_list where id = ? and hospital_id = ?`,
        [deleteadmin, hospital_id],
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
}
