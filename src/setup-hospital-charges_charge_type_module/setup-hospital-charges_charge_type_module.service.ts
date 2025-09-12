import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { SetupHospitalChargesChargeTypeModule } from "./entities/setup-hospital-charges_charge_type_module.entity"


@Injectable()
export class SetupHospitalChargesChargeTypeModuleService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,

  ) { }

  async create(charge_type_moduleEntity: SetupHospitalChargesChargeTypeModule): Promise<{ [key: string]: any }[]> {
    try {
      const [check] = await this.connection.query(`select id from charge_type_module where charge_type_master_id = ? and module_shortcode =?`, [
        charge_type_moduleEntity.charge_type_master_id, charge_type_moduleEntity.module_shortcode
      ])
      if (check) {
        const [getadmin] = await this.dynamicConnection.query(`select id from charge_type_module where Hospital_id =? and hospital_charge_type_module_id = ?`, [
          charge_type_moduleEntity.Hospital_id, check.id
        ])
        await this.dynamicConnection.query(`delete from charge_type_module where id = ?`, [getadmin.id])
        await this.connection.query(`delete from charge_type_module where id = ?`, [check.id])
        return [{
          "data": {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.DELETED
          }
        }]
      } else {
        const result = await this.connection.query(
          'INSERT INTO charge_type_module (charge_type_master_id,module_shortcode) VALUES (?,?)',
          [charge_type_moduleEntity.charge_type_master_id,
          charge_type_moduleEntity.module_shortcode,

          ]
        );
        const [getAdminMaster] = await this.dynamicConnection.query(`select id from charge_type_master where
      hospital_charge_type_master_id = ? and
      Hospital_id = ?
     `, [
          charge_type_moduleEntity.charge_type_master_id,
          charge_type_moduleEntity.Hospital_id
        ])

         await this.dynamicConnection.query('INSERT INTO charge_type_module (charge_type_master_id,module_shortcode,Hospital_id,hospital_charge_type_module_id) VALUES (?,?,?,?)', [
          getAdminMaster.id,
          charge_type_moduleEntity.module_shortcode,
          charge_type_moduleEntity.Hospital_id,
          result.insertId
        ])

        return [{
          "data ": {
            "id  ": result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_TYPE_MODULE,
            "inserted_data": await this.connection.query('SELECT * FROM charge_type_module WHERE id = ?', [result.insertId])
          }
        }];
      }
    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }


  async findAll(): Promise<SetupHospitalChargesChargeTypeModuleService[]> {
    try {
      
    
    const q =
      `SELECT
    charge_type_master.id,
    charge_type_master.charge_type AS charge_type,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', charge_type_module.id,
            'module_shortcode', charge_type_module.module_shortcode
        )
    ) AS modules
  FROM charge_type_master
  LEFT JOIN charge_type_module ON charge_type_module.charge_type_master_id = charge_type_master.id
  GROUP BY charge_type_master.id;
  `
    const charge_type_modules = await this.connection.query(q);
    const predefinedModules = ['appointment', 'ipd', 'opd', 'pathology', 'radiology', 'bloodbank', 'ambulance'];
    const mapModules = (modules) => {
      return predefinedModules.reduce((acc, moduleName) => {
        const module = modules.find((module) => module.module_shortcode === moduleName);
        const id = module ? module.id : null;
        acc[moduleName] = { id, value: !!module };
        return acc;
      }, {});
    };


    const formattedResults = charge_type_modules.map(chargeTypeModule => {
      return {
        id: chargeTypeModule.id,
        charge_type: chargeTypeModule.charge_type,
        modules: Array.isArray(chargeTypeModule.modules)
          ? mapModules(chargeTypeModule.modules)
          : {},
      };
    });
    return formattedResults;
  } catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  }


  async findOne(id: string): Promise<SetupHospitalChargesChargeTypeModuleService> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charge_type_module WHERE id = ?',
      [id],
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
    const charge_type_module = await this.connection.query('SELECT * FROM charge_type_module WHERE id = ?', [id]);
      return charge_type_module;
} catch (error) {
  throw new HttpException({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message:process.env.ERROR_MESSAGE,
  }
  , HttpStatus.INTERNAL_SERVER_ERROR);
}   }

  // async update(id: string, charge_type_moduleEntity: SetupHospitalChargesChargeTypeModule): Promise<{ [key: string]: any }[]> {

  //   const [existingRecord] = await this.connection.query(
  //     'SELECT id FROM charge_type_module WHERE id = ?',
  //     [id],
  //   );

  //   if (!existingRecord) {
  //     return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
  //   }

  //      try {
  //     await this.connection.query(
  //       'UPDATE charge_type_module SET charge_type_master_id =?,  module_shortcode =?  WHERE id = ?',
  //       [charge_type_moduleEntity.charge_type_master_id,
  //       charge_type_moduleEntity.module_shortcode,
  //         id
  //       ]
  //     );
  //     await this.dynamicConnection.query(
  //       'update charge_type_module SET charge_type_master_id =?,  module_shortcode =? where hospital_charge_type_module_id = ? and Hospital_id = ?',
  //       [
  //         charge_type_moduleEntity.charge_type_master_id,
  //         charge_type_moduleEntity.module_shortcode,
  //         id,
  //         charge_type_moduleEntity.hospital_charge_type_module_id
  //       ]
  //     )
  //     return [{
  //       "data ": {
  //         status: "success",
  //         "messege": "charge_type_module details updated successfully inserted",
  //         "updated_values": await this.connection.query('SELECT * FROM charge_type_module WHERE id = ?', [id])
  //       }
  //     }];
  //   } catch (error) {
  //     throw new HttpException({
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
  //     }, HttpStatus.INTERNAL_SERVER_ERROR);
  //   } 
  // }

  // async remove(id: string): Promise<{ [key: string]: any }[]> {

  //   const [existingRecord] = await this.connection.query(
  //     'SELECT id FROM charge_type_module WHERE id = ?',
  //     [id],
  //   );

  //   if (!existingRecord) {
  //     return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
  //   }

  //   try {
  //     await this.connection.query('DELETE FROM charge_type_module WHERE id = ?', [id]);
  //   return [{
  //     "status": "success",
  //     "message": " id: " + id + " deleted successfully"
  //   }
  //   ];
  //   } catch (error) {
  //     throw new HttpException({
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
  //     }, HttpStatus.INTERNAL_SERVER_ERROR);
      
  //   }

     
  // }
}