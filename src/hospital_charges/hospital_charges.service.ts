import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { HospitalCharge } from "./entities/hospital_charge.entity"



@Injectable()
export class HospitalChargesService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,

  ) { }

  async update(id: string, hos_chargesEntity: HospitalCharge) {
    try {
      const check = await this.dynamicConnection.query(`select hospital_consulting_charge from hospitals where plenome_id = ?`, [hos_chargesEntity.hospital_id])
      if (check) {
        if ((hos_chargesEntity.hospital_consulting_charge || hos_chargesEntity.tax_percentage || hos_chargesEntity.tax_amount) == "") {
          return {
            "status": "failed",
            "message": "enter all the necessary values to update",
          }
        }
        else {
           await this.dynamicConnection.query(`
    update hospitals set
    hospital_consulting_charge = ?,
    tax_percentage = ?,
    tax_amount = ?
    where plenome_id = ?`, [
            hos_chargesEntity.hospital_consulting_charge,
            hos_chargesEntity.tax_percentage,
            hos_chargesEntity.tax_amount,
            hos_chargesEntity.hospital_id
          ])
          return {
            "status": "success",
            "message": "hospitals details updated successfully",
          }
        }
      }
      else {
        return {
          "status": "failed",
          "message": "Enter correct hospital_id to set charges",
        }
      }
    }

    catch (error) {
      return error
    }
  }


  async findall(plenome_id: string) {
    try {
      const hospital = await this.dynamicConnection.query(`   SELECT
    hospitals .plenome_id,
    hospitals.hospital_name,
   hospitals.hospital_consulting_charge,
   hospitals.tax_percentage,
   hospitals.tax_amount,
      concat((hospitals.hospital_consulting_charge + (hospitals.hospital_consulting_charge * (hospitals.tax_percentage/100)))) as amount
  FROM
     hospitals
  WHERE
  plenome_id = ?;`, [plenome_id]
      )
      return hospital;

    } catch (error) {
      return error
    }
  }
}