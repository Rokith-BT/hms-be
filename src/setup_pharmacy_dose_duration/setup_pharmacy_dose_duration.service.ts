import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPharmacyDoseDuration } from "./entities/setup_pharmacy_dose_duration.entity";


@Injectable()
export class SetupPharmacyDoseDurationService {
  constructor(
   private readonly connection: DataSource,
       @InjectDataSource('AdminConnection')
       private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    dose_durationEntity: SetupPharmacyDoseDuration,
  ): Promise<{ [key: string]: any }[]> {
    
    try {
      const result = await this.connection.query(
        'INSERT INTO dose_duration (name) VALUES (?)',
        [dose_durationEntity.name],
      );

       await this.dynamicConnection.query(
        'INSERT INTO dose_duration (name,Hospital_id,hospital_dose_duration_id) VALUES (?,?,?)',
        [
          dose_durationEntity.name,
          dose_durationEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: 'success',
            messege: 'dose_duration details added successfully ',
            inserted_data: await this.connection.query(
              'SELECT * FROM dose_duration WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async findAll(): Promise<SetupPharmacyDoseDuration[]> {
    try {
      const dose_duration = await this.connection.query(
        'SELECT * FROM dose_duration',
      );
      return dose_duration;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
   
  }

  async findOne(id: string): Promise<SetupPharmacyDoseDuration | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM dose_duration WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'identity',
          message: `ID ${id} does not exist or has already been deleted`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
try {
  const dose_duration = await this.connection.query(
    'SELECT * FROM dose_duration WHERE id = ?',
    [id],
  );

    return dose_duration as SetupPharmacyDoseDuration;
} catch (error) {
  throw new HttpException({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
  }, HttpStatus.INTERNAL_SERVER_ERROR);
  
}
   
    
  }

  async update(
    id: string,
    dose_durationEntity: SetupPharmacyDoseDuration,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM dose_duration WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'identity',
          message: `ID ${id} does not exist or has already been deleted`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
   
    try {
       await this.connection.query(
        'UPDATE dose_duration SET name =? WHERE id = ?',
        [dose_durationEntity.name, id],
      );

      await this.dynamicConnection.query(
        'update dose_duration SET name = ? where hospital_dose_duration_id = ? and Hospital_id = ?',
        [dose_durationEntity.name, id, dose_durationEntity.Hospital_id],
      );

      return [
        {
          'data ': {
            status: 'success',
            messege: 'dose_duration details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM dose_duration WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM dose_duration WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
    }
   
    try {
       await this.connection.query(
        'DELETE FROM dose_duration WHERE id = ?',
        [id],
      );

      const [dose_duration] = await this.dynamicConnection.query(
        `select id from dose_duration where hospital_dose_duration_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from dose_duration where id = ? and Hospital_id = ?`,
        [dose_duration.id, Hospital_id],
      );
    
    return [
      {
        status: 'success',
        message: ' id: ' + id + ' deleted successfully',
      },
    ];
  }catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
    }, HttpStatus.INTERNAL_SERVER_ERROR);  } }

  async setupPharmacyDoseDuration(
    search: string,
  ): Promise<SetupPharmacyDoseDuration[]> {
    let query = ` SELECT * FROM dose_duration `;
    let values = [];

    if (search) {
      query += ` WHERE ( dose_duration.name LIKE ? ) `;
      values.push('%' + search + '%');
    }

    let final = query;

    const setupPharmacyDoseDurationSearch = await this.connection.query(
      final,
      values,
    );

    return setupPharmacyDoseDurationSearch;
  }

  async findALLdose_duration(limit:number, page:number) {
    try {
      
      const offset = limit * (page - 1);

      const dose_durations = await this.connection.query(`SELECT * FROM dose_duration LIMIT ? OFFSET ?`,[
        Number(limit),Number(offset)
      ]);

      let [totallist] = await this.connection.query(`select count(id) as total from dose_duration`)

      let variable = {
        details : dose_durations,
        total : totallist.total,
        page:page,
        limit:limit
      }

      return variable;

    }  catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

}
