import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPharmacyDoseInterval } from "./entities/setup-pharmacy-dose_interval.entity";


@Injectable()
export class SetupPharmacyDoseIntervalService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(dose_intervalEntity: SetupPharmacyDoseInterval): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO dose_interval (name) VALUES (?)',
        [dose_intervalEntity.name
        ]
      );

      await this.dynamicConnection.query(`INSERT INTO dose_interval (name,Hospital_id,hospital_dose_interval_id) VALUES (?,?,?)`, [
        dose_intervalEntity.name,
        dose_intervalEntity.Hospital_id,
        result.insertId
      ])

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": "success",
          "messege": "dose_interval details added successfully ",
          "inserted_data": await this.connection.query('SELECT * FROM dose_interval WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
          throw new HttpException({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
          }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }




  async findAll(): Promise<SetupPharmacyDoseInterval[]> {
    try {
       const dose_interval = await this.connection.query('SELECT * FROM dose_interval');
    return dose_interval;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }





  async findOne(id: string): Promise<SetupPharmacyDoseInterval | null> {

     const [existingRecord] = await this.connection.query(
      'SELECT id FROM dose_interval WHERE id = ?',
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
      const dose_interval = await this.connection.query('SELECT * FROM dose_interval WHERE id = ?', [id]);


      return dose_interval;
  
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }




  async update(id: string, dose_intervalEntity: SetupPharmacyDoseInterval): Promise<{ [key: string]: any }[]> {

      const [existingRecord] = await this.connection.query(
      'SELECT id FROM dose_interval WHERE id = ?',
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
        'UPDATE dose_interval SET name =? WHERE id = ?',
        [dose_intervalEntity.name,
          id
        ]
      );


      await this.dynamicConnection.query(
        'update dose_interval SET name = ? where hospital_dose_interval_id = ? and Hospital_id= ?',
        [dose_intervalEntity.name,
          id,
        dose_intervalEntity.Hospital_id
        ]
      );
      return [{
        "data ": {
          status: "success",
          "messege": "dose_interval details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM dose_interval WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

 const [existingRecord] = await this.connection.query(
      'SELECT id FROM dose_interval WHERE id = ?',
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
      await this.connection.query('DELETE FROM dose_interval WHERE id = ?', [id]);
      const [admin] = await this.dynamicConnection.query(`select id from dose_interval where hospital_dose_interval_id = ?`, [id])
      await this.dynamicConnection.query(`delete from dose_interval where id = ? and Hospital_id = ?`, [
        admin.id,
        Hospital_id
      ])
 return [{
      "status": "success",
      "message": " id: " + id + " deleted successfully"
    }
    ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }



  async setupPharmacyDoseInterval(
    search: string,
  ): Promise<SetupPharmacyDoseInterval[]> {
    let query = ` SELECT * FROM dose_interval `;
    let values = [];
    if (search) {
      query += ` WHERE ( dose_interval.name LIKE ? ) `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupPharmacyDoseIntervalSearch = await this.connection.query(final, values);
    return setupPharmacyDoseIntervalSearch;

  }






}
