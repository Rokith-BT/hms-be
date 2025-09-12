
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StaffIdCard } from './entities/staff_id_card.entity';

@Injectable()
export class StaffIdCardService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createStaffIdCard: StaffIdCard) {
    try {
      let Staff_ID_Card_id;

      const Staff_ID_Card = await this.connection.query(
        `INSERT into staff_id_card (
       title,
       hospital_name,
       hospital_address,
       background,
       logo,
       sign_image,
       header_color,
       enable_staff_role,
       enable_staff_id,
       enable_staff_department,
       enable_designation,
       enable_name,
       enable_fathers_name,
       enable_mothers_name,
       enable_date_of_joining,
       enable_permanent_address,
       enable_staff_dob,
       enable_staff_phone,
       status
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [createStaffIdCard.title,
        createStaffIdCard.hospital_name,
        createStaffIdCard.hospital_address,
        createStaffIdCard.background,
        createStaffIdCard.logo,
        createStaffIdCard.sign_image,
        createStaffIdCard.header_color,
        createStaffIdCard.enable_staff_role,
        createStaffIdCard.enable_staff_id,
        createStaffIdCard.enable_staff_department,
        createStaffIdCard.enable_designation,
        createStaffIdCard.enable_name,
        createStaffIdCard.enable_fathers_name,
        createStaffIdCard.enable_mothers_name,
        createStaffIdCard.enable_date_of_joining,
        createStaffIdCard.enable_permanent_address,
        createStaffIdCard.enable_staff_dob,
        createStaffIdCard.enable_staff_phone,
        createStaffIdCard.status
        ],
      );

      Staff_ID_Card_id = Staff_ID_Card.insertId;

      // -------------------------------------//


      await this.dynamicConnection.query(
        `INSERT into staff_id_card (
       title,
       hospital_name,
       hospital_address,
       background,
       logo,
       sign_image,
       header_color,
       enable_staff_role,
       enable_staff_id,
       enable_staff_department,
       enable_designation,
       enable_name,
       enable_fathers_name,
       enable_mothers_name,
       enable_date_of_joining,
       enable_permanent_address,
       enable_staff_dob,
       enable_staff_phone,
       status,
       hospital_id,
       hos_staff_id_card_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [createStaffIdCard.title,
        createStaffIdCard.hospital_name,
        createStaffIdCard.hospital_address,
        createStaffIdCard.background,
        createStaffIdCard.logo,
        createStaffIdCard.sign_image,
        createStaffIdCard.header_color,
        createStaffIdCard.enable_staff_role,
        createStaffIdCard.enable_staff_id,
        createStaffIdCard.enable_staff_department,
        createStaffIdCard.enable_designation,
        createStaffIdCard.enable_name,
        createStaffIdCard.enable_fathers_name,
        createStaffIdCard.enable_mothers_name,
        createStaffIdCard.enable_date_of_joining,
        createStaffIdCard.enable_permanent_address,
        createStaffIdCard.enable_staff_dob,
        createStaffIdCard.enable_staff_phone,
        createStaffIdCard.status,
        createStaffIdCard.hospital_id,
          Staff_ID_Card_id
        ],
      );

      return [{
        "data ": {
          status: "success",
          "messege": "Staff ID Card details added successfully ",
          "Added_staff_id_card_values": await this.connection.query('SELECT * FROM staff_id_card where id = ?', [Staff_ID_Card_id])
        }
      }];


    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async updateStaffIdCard(id: number, createStaffIdCard: StaffIdCard) {

    try {

      await this.connection.query(`update staff_id_card SET
       title=?,
       hospital_name=?,
       hospital_address=?,
       background=?,
       logo=?,
       sign_image=?,
       header_color=?,
       enable_staff_role=?,
       enable_staff_id=?,
       enable_staff_department=?,
       enable_designation=?,
       enable_name=?,
       enable_fathers_name=?,
       enable_mothers_name=?,
       enable_date_of_joining=?,
       enable_permanent_address=?,
       enable_staff_dob=?,
       enable_staff_phone=?,
       status=?
       where id=?`,
        [
          createStaffIdCard.title,
          createStaffIdCard.hospital_name,
          createStaffIdCard.hospital_address,
          createStaffIdCard.background,
          createStaffIdCard.logo,
          createStaffIdCard.sign_image,
          createStaffIdCard.header_color,
          createStaffIdCard.enable_staff_role,
          createStaffIdCard.enable_staff_id,
          createStaffIdCard.enable_staff_department,
          createStaffIdCard.enable_designation,
          createStaffIdCard.enable_name,
          createStaffIdCard.enable_fathers_name,
          createStaffIdCard.enable_mothers_name,
          createStaffIdCard.enable_date_of_joining,
          createStaffIdCard.enable_permanent_address,
          createStaffIdCard.enable_staff_dob,
          createStaffIdCard.enable_staff_phone,
          createStaffIdCard.status,
          id
        ],
      )


      const dynStaffIDCard = await this.dynamicConnection.query('SELECT id FROM staff_id_card WHERE hos_staff_id_card_id=? and hospital_id=?', [id, createStaffIdCard.hospital_id]);
      const dynStaffIDCardID = dynStaffIDCard[0].id;


      await this.dynamicConnection.query(
        `update staff_id_card SET
       title=?,
       hospital_name=?,
       hospital_address=?,
       background=?,
       logo=?,
       sign_image=?,
       header_color=?,
       enable_staff_role=?,
       enable_staff_id=?,
       enable_staff_department=?,
       enable_designation=?,
       enable_name=?,
       enable_fathers_name=?,
       enable_mothers_name=?,
       enable_date_of_joining=?,
       enable_permanent_address=?,
       enable_staff_dob=?,
       enable_staff_phone=?,
       status=?,
       hospital_id=?
       where id=?`,
        [
          createStaffIdCard.title,
          createStaffIdCard.hospital_name,
          createStaffIdCard.hospital_address,
          createStaffIdCard.background,
          createStaffIdCard.logo,
          createStaffIdCard.sign_image,
          createStaffIdCard.header_color,
          createStaffIdCard.enable_staff_role,
          createStaffIdCard.enable_staff_id,
          createStaffIdCard.enable_staff_department,
          createStaffIdCard.enable_designation,
          createStaffIdCard.enable_name,
          createStaffIdCard.enable_fathers_name,
          createStaffIdCard.enable_mothers_name,
          createStaffIdCard.enable_date_of_joining,
          createStaffIdCard.enable_permanent_address,
          createStaffIdCard.enable_staff_dob,
          createStaffIdCard.enable_staff_phone,
          createStaffIdCard.status,
          createStaffIdCard.hospital_id,
          dynStaffIDCardID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Staff ID card details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM staff_id_card WHERE id = ?', [id])
        }
      }];

    } catch (error) {

      console.error('Error while posting data:', error);
    }
  }


  async removeStaffIDcard(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM staff_id_card WHERE id = ?', [id]);
      const [GetDynStaffidcard] = await this.dynamicConnection.query(
        'SELECT id FROM staff_id_card WHERE hos_staff_id_card_id=? and hospital_id=?',
        [id, hospital_id]
      );
      const GetDynstaffidcardID = GetDynStaffidcard.id;
      await this.dynamicConnection.query('DELETE FROM staff_id_card WHERE id = ?', [GetDynstaffidcardID]);
      return [
        {
          status: 'success',
          message: `staff ID card with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }

}
