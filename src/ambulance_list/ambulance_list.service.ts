import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AmbulanceList } from './entities/ambulance_list.entity';

@Injectable()
export class AmbulanceListService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly  dynamicConnection: DataSource,
  ) { }


  async create(createAmbulanceList: AmbulanceList) {
    try {
      const addAmbulanceList = await this.connection.query(
        `INSERT into vehicles(
     
          createAmbulanceList.driver_contact,
          createAmbulanceList.note,
          createAmbulanceList.vehicle_type

      const addAmbulanceListID = addAmbulanceList.insertId;
      await this.dynamicConnection.query(
        `INSERT into vehicles(
         vehicle_no,
         vehicle_model,
         manufacture_year,
         driver_name,
         driver_licence,
         driver_contact,
         note,
         vehicle_type,
         hospital_id,
         hos_vehicles_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          createAmbulanceList.vehicle_no,
          createAmbulanceList.vehicle_model,
          createAmbulanceList.manufacture_year,
          createAmbulanceList.driver_name,
          createAmbulanceList.driver_licence,
          createAmbulanceList.driver_contact,
          createAmbulanceList.note,
          createAmbulanceList.vehicle_type,
          createAmbulanceList.hospital_id,
          addAmbulanceListID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Ambulance list details added successfully ",
          "Ambulance_list_Values": await this.connection.query('SELECT * FROM vehicles WHERE id = ?', [addAmbulanceListID])
        }
      }];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }


  }




  async updateAmbulanceList(id: number, createAmbulanceList: AmbulanceList) {
    try {
      await this.connection.query(`update vehicles SET
    vehicle_no=?,
    vehicle_model=?,
    manufacture_year=?,
    driver_name=?,
    driver_licence=?,
    driver_contact=?,
    note=?,
    vehicle_type=?
    where id=?`,
        [
          createAmbulanceList.vehicle_no,
          createAmbulanceList.vehicle_model,
          createAmbulanceList.manufacture_year,
          createAmbulanceList.driver_name,
          createAmbulanceList.driver_licence,
          createAmbulanceList.driver_contact,
          createAmbulanceList.note,
          createAmbulanceList.vehicle_type,
          id
        ],
      )



      const [dynAmbList] = await this.dynamicConnection.query(`select id from vehicles where hospital_id = ? and  hos_vehicles_id = ?`, [createAmbulanceList.hospital_id, id])
      const dynAmbListID = dynAmbList.id;
      console.log(dynAmbListID, "dynAmbListIDDDD");




      await this.dynamicConnection.query(`update vehicles SET
    vehicle_no=?,
    vehicle_model=?,
    manufacture_year=?,
    driver_name=?,
    driver_licence=?,
    driver_contact=?,
    note=?,
    vehicle_type=?,
    hospital_id=?
    where id=?`,
        [
          createAmbulanceList.vehicle_no,
          createAmbulanceList.vehicle_model,
          createAmbulanceList.manufacture_year,
          createAmbulanceList.driver_name,
          createAmbulanceList.driver_licence,
          createAmbulanceList.driver_contact,
          createAmbulanceList.note,
          createAmbulanceList.vehicle_type,
          createAmbulanceList.hospital_id,
          dynAmbListID
        ],
      )




      return [{
        "data ": {
          status: "success",
          "messege": "Ambulance details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM vehicles WHERE id = ?', [id])
        }
      }];


    } catch (error) {

      console.error('Error while posting data:', error);
    }
  }

  async removeAmbulanceList(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM vehicles WHERE id = ?', [id]);

      await this.dynamicConnection.query('DELETE FROM vehicles WHERE hos_vehicles_id = ? AND hospital_id = ?', [id, hospital_id]);

      return [
        {
          status: 'success',
          message: `Ambulance list with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }


}
