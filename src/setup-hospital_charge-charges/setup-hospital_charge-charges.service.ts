import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupHospitalChargeCharge } from "./entities/setup-hospital_charge-charge.entity";


@Injectable()
export class SetupHospitalChargeChargesService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    chargesEntity: SetupHospitalChargeCharge,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO charges (charge_category_id,tax_category_id,charge_unit_id,name,standard_charge,date,description,status) VALUES (?,?,?,?,?,?,?,?)',
        [
          chargesEntity.charge_category_id,
          chargesEntity.tax_category_id,
          chargesEntity.charge_unit_id,
          chargesEntity.name,
          chargesEntity.standard_charge,
          chargesEntity.date,
          chargesEntity.description,
          chargesEntity.status,
        ],
      );

      const [charges1] = await this.dynamicConnection.query(
        `select id from charge_categories where Hospital_id = ? and hospital_charge_categories_id = ?`,
        [chargesEntity.Hospital_id, chargesEntity.charge_category_id],
      );

      const [charges2] = await this.dynamicConnection.query(
        'select id from tax_category where Hospital_id = ? and hospital_tax_category_id = ?',
        [chargesEntity.Hospital_id, chargesEntity.tax_category_id],
      );

      const [charges3] = await this.dynamicConnection.query(
        `select id from charge_units where Hospital_id = ? and hospital_charge_units_id = ?`,
        [chargesEntity.Hospital_id, chargesEntity.charge_unit_id],
      );

      try {
        await this.dynamicConnection.query(
          `insert into charges (charge_category_id,tax_category_id,charge_unit_id,name,
    standard_charge,date,description,status,Hospital_id,hospital_charges_id)
   values (?,?,?,?,?,?,?,?,?,?)`,
          [
            charges1.id,
            charges2.id,
            charges3.id,
            chargesEntity.name,
            chargesEntity.standard_charge,
            chargesEntity.date,
            chargesEntity.description,
            chargesEntity.status,
            chargesEntity.Hospital_id,
            result.insertId,
          ],
        );
      } catch (error) {
        return error;
      }

      return [
        {
          data: {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE,
            "inserted_data": await this.connection.query('SELECT * FROM charges WHERE id = ?', [result.insertId])
          },
        },
      ];
    } catch (error) {
throw new HttpException({
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
message: process.env.ERROR_MESSAGE,
}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  async findAll(): Promise<SetupHospitalChargeCharge[]> {
    try {
      const charges = await this.connection.query(
        `select charges.id,charges.date,charges.description,charges.status,charges.name,charge_categories.name as charge_category,
        charge_categories.id as charge_category_id,charge_type_master.charge_type,charge_units.unit,charge_units.id as unitid,
        charge_units.unit as unit_name,tax_category.percentage as tax,tax_category.id as tax_category_id,tax_category.name as tax_category_name,
         charges.standard_charge from charges  left join charge_categories ON charges.charge_category_id = charge_categories.id 
          left join charge_units ON charges.charge_unit_id = charge_units.id left join tax_category ON charges.tax_category_id = tax_category.id 
          left join charge_type_master ON charge_type_master.id = charge_categories.charge_type_id;`,
      );
      return charges;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

  async findOne(id: string): Promise<SetupHospitalChargeCharge | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charges WHERE id = ?', [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
           status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const charges = await this.connection.query(
        'select charges.id,charges.name,charge_categories.name as charge_category,charge_type_master.charge_type,charge_units.unit,tax_category.percentage as tax, charges.standard_charge from charges  left join charge_categories ON charges.charge_category_id = charge_categories.id  left join charge_units ON charges.charge_unit_id = charge_units.id left join tax_category ON charges.tax_category_id = tax_category.id left join charge_type_master ON charge_type_master.id = charge_categories.charge_type_id WHERE charges.id = ?',
        [id],
      );
  
        return charges;
     
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }

  async update(
    id: string,
    chargesEntity: SetupHospitalChargeCharge,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charges WHERE id = ?', [id],
    );

    if (!existingRecord ) {
      return [{ status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD  }];
    }

    try {
      await this.connection.query(
        'UPDATE charges SET charge_category_id =?,tax_category_id =? ,charge_unit_id =? ,name =? ,standard_charge =? ,date =? ,description =? ,status =?  WHERE id = ?',
        [
          chargesEntity.charge_category_id,
          chargesEntity.tax_category_id,
          chargesEntity.charge_unit_id,
          chargesEntity.name,
          chargesEntity.standard_charge,
          chargesEntity.date,
          chargesEntity.description,
          chargesEntity.status,
          id,
        ],
      );

      await this.dynamicConnection.query(
        `select id from charges where Hospital_id = ? and hospital_charges_id = ?`,
        [chargesEntity.Hospital_id, id],
      );

      const [admin_charge_category_id] = await this.dynamicConnection.query(
        `select id from charge_categories where Hospital_id = ? and hospital_charge_categories_id = ?`,
        [chargesEntity.Hospital_id, chargesEntity.charge_category_id],
      );

      const [admin_tax_category_id] = await this.dynamicConnection.query(
        `select id from tax_category where Hospital_id = ? and hospital_tax_category_id = ?`,
        [chargesEntity.Hospital_id, chargesEntity.tax_category_id],
      );

      const [admin_charge_unit] = await this.dynamicConnection.query(
        `select id from charge_units where Hospital_id = ? and hospital_charge_units_id = ?`,
        [chargesEntity.Hospital_id, chargesEntity.charge_unit_id],
      );

      await this.dynamicConnection.query(
        'update charges SET charge_category_id =?,tax_category_id =? ,charge_unit_id =? ,name =? ,standard_charge =? ,date =? ,description =? ,status =? where hospital_charges_id =? and Hospital_id =? ',
        [
          admin_charge_category_id.id,
          admin_tax_category_id.id,
          admin_charge_unit.id,
          chargesEntity.name,
          chargesEntity.standard_charge,
          chargesEntity.date,
          chargesEntity.description,
          chargesEntity.status,
          id,
          chargesEntity.Hospital_id,
        ],
      );

      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM charges WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({ 
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charges WHERE id = ?', [id],
    );

    if(!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }

    try{

    await this.connection.query(
      'DELETE FROM charges WHERE id = ?',
      [id],
    );

      
      const charge = await this.dynamicConnection.query(
        `select id from charges where hospital_charges_id = ?`,
        [id],
      );
      const chargee = charge[0].id;

      await this.dynamicConnection.query(
        `delete from charges where id = ? and Hospital_id = ?`,
        [chargee, Hospital_id],
      );

      return [
        {
          status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR, 
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  async HospitalChargesCharge(
    search: string,
  ): Promise<SetupHospitalChargeCharge[]> {
    try {
      let query = ` select charges.date,charges.description,charges.status,charges.id,charges.name,charge_categories.name as charge_category,charge_categories.id as charge_category_id,charge_type_master.charge_type,charge_units.unit,charge_units.id as unitid,charge_units.unit as unit_name,tax_category.percentage as tax,tax_category.id as tax_category_id,tax_category.name as tax_category_name, charges.standard_charge from charges  left join charge_categories ON charges.charge_category_id = charge_categories.id  left join charge_units ON charges.charge_unit_id = charge_units.id left join tax_category ON charges.tax_category_id = tax_category.id left join charge_type_master ON charge_type_master.id = charge_categories.charge_type_id `;
      let values = [];
  
      if (search) {
        query += ` WHERE ( charges.name LIKE ? OR charge_categories.name LIKE ? OR charge_type_master.charge_type LIKE ? OR charge_units.unit LIKE ? OR tax_category.percentage LIKE ? OR charges.standard_charge LIKE ? )  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }
      let final = query;
      const setupHospitalChargesChargeSearch = await this.connection.query(
        final,
        values,
      );
      return setupHospitalChargesChargeSearch;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
  
  }

  async find_charges(limit:number, page:number, search:string) {
    try {
      
      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';
    
      if(search) {
        const searchClause = `(
        charges.name  LIKE '%${search}%' OR
        charge_categories.name LIKE '%${search}%' OR
        charge_type_master.charge_type LIKE '%${search}%' OR
        charge_units.unit LIKE '%${search}%' OR
        tax_category.percentage LIKE '%${search}%' OR
        charges.standard_charge LIKE '%${search}%'
        )`;

        dateCondition = ` AND ${searchClause}`;
      }



      const charges = await this.connection.query(`select charges.id,charges.date,charges.description,charges.status,charges.name,charge_categories.name as charge_category,
        charge_categories.id as charge_category_id,charge_type_master.charge_type,charge_units.unit,charge_units.id as unitid,
        charge_units.unit as unit_name,tax_category.percentage as tax,tax_category.id as tax_category_id,tax_category.name as tax_category_name,
         charges.standard_charge from charges  left join charge_categories ON charges.charge_category_id = charge_categories.id 
          left join charge_units ON charges.charge_unit_id = charge_units.id left join tax_category ON charges.tax_category_id = tax_category.id 
          left join charge_type_master ON charge_type_master.id = charge_categories.charge_type_id WHERE charges.id ${dateCondition} LIMIT ? OFFSET ?`,[
            Number(limit),Number(offset)
          ])

          let [totallist] = await this.connection.query(`SELECT count(charges.id) as total from charges  left join charge_categories ON charges.charge_category_id = charge_categories.id 
          left join charge_units ON charges.charge_unit_id = charge_units.id left join tax_category ON charges.tax_category_id = tax_category.id 
          left join charge_type_master ON charge_type_master.id = charge_categories.charge_type_id WHERE charges.id  ${dateCondition}`);

          let variable = {
            details : charges,
            total : totallist.total,
            page:page,
            limit:limit
          }

          return variable;

    } catch (error) {
      
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
