import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupHumanResourcePayslipCategory } from "./entities/setup-human_resource-payslip_category.entity";

@Injectable()
export class SetupHumanResourcePayslipCategoryService {
  
constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly  dynamicConnection: DataSource,
 
  ) {}
 
  async create(payslip_categoryEntity:SetupHumanResourcePayslipCategory )   {
             try {
           const payslip_category = await this.connection.query(` insert into payslip_category (category_name) values (?)`,
            [
              payslip_categoryEntity.category_name
            ]
          )
           await this.dynamicConnection.query(`insert into payslip_category (category_name, hospital_id, hos_payslip_category_id) values (?,?,?)`,[
            payslip_categoryEntity.category_name,
            payslip_categoryEntity.hospital_id,
            payslip_category.insertId
          ])
         
          return [{"data":{"id":payslip_category.insertId,
            "status":process.env.SUCCESS_STATUS_V2,
            "message":process.env.PAYSLIP_CATEGORY,
            "inserted_data": await this.connection.query('SELECT * FROM payslip_category where id = ?', [payslip_category.insertId])
          }}]
        } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);        }
  }
 
async findAll() {
  try {
     const payslip_Entity = await this.connection.query(`select * from payslip_category`);
  return payslip_Entity;
  } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR); 
  }
 
}
 
async findone(id:string) {
  try {
    const payslip_entity_id = await this.connection.query(`select * from payslip_category where id = ?`,[id]);
   return payslip_entity_id;
}
   catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR); 
  }
   
}
 
async update(id:string, payslip_categoryEntity:SetupHumanResourcePayslipCategory) {
 try {
 await this.connection.query(`update payslip_category SET category_name = ?
    where id = ?`,[
      payslip_categoryEntity.category_name,
      id
    ])
 
   await this.dynamicConnection.query(`
      update payslip_category SET category_name = ? where hos_payslip_category_id = ? and hospital_id = ?`,
    [
      payslip_categoryEntity.category_name,
      id,
      payslip_categoryEntity.hospital_id
    ])
    
    return [{"data": {
      status: process.env.SUCCESS_STATUS_V2,
      "message": process.env.PAYSLIP_CATEGORY_UPDATED,
      "updated_values":await this.connection.query(`select * from payslip_category where id = ?`,[id])
    }}]
 
} catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR); 
} 
}
 
async remove(id:string, hospital_id:number) {
 

  try {
 
 await this.connection.query(`delete from payslip_category where id = ?`, [id]);
console.log("deleted");

await this.dynamicConnection.query(`delete from payslip_category where hos_payslip_category_id = ? and hospital_id = ?`,[
  id,
  hospital_id
])
console.log("admin deleted");
 
return [{"data": {
  status: process.env.SUCCESS_STATUS_V2,
  "message": process.env.DELETED
}}] 
 
  } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
}