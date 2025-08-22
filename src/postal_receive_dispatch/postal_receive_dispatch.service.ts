import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostalReceiveDispatch } from "./entities/postal_receive_dispatch.entity";

@Injectable()
export class PostalReceiveDispatchService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createPostalReceiveDispatch: PostalReceiveDispatch) {
    try {
      const addDispatch = await this.connection.query(
        `INSERT into dispatch_receive(
       reference_no,
       to_title,
       address,
       note,
       from_title,
       date,
       image,
       type
        ) VALUES (?,?,?,?,?,?,?,?)`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          createPostalReceiveDispatch.date,
          createPostalReceiveDispatch.image,
          'dispatch'
        ],
      )
      const addDispatchID = addDispatch.insertId;
      await this.dynamicConnection.query(
        `INSERT into dispatch_receive(
       reference_no,
       to_title,
       address,
       note,
       from_title,
       date,
       image,
       type,
       hospital_id,
       hos_dispatch_receive_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          createPostalReceiveDispatch.date,
          createPostalReceiveDispatch.image,
          'dispatch',
          createPostalReceiveDispatch.hospital_id,
          addDispatchID
        ],
      )

      return [{
        "data ": {
          status: "success",
          "messege": "Postal Dispatch details added successfully ",
          "Dispatch_Details": await this.connection.query('SELECT * FROM dispatch_receive WHERE id = ?', [addDispatchID])
        }
      }];


    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async updateDispatch(id: number, createPostalReceiveDispatch: PostalReceiveDispatch) {
    try {
      const fromDate = new Date()
      console.log(fromDate, 'dateeeeee')
      const timestamp = fromDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

      await this.connection.query(`update dispatch_receive SET
      reference_no=?,
       to_title=?,
       address=?,
       note=?,
       from_title=?,
       date=?,
       image=?
       where id=?`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          timestamp,
          createPostalReceiveDispatch.image,
          id
        ],
      )


      const [dyndispatch] = await this.dynamicConnection.query(`select id from dispatch_receive where hospital_id = ? and  hos_dispatch_receive_id = ?`, [createPostalReceiveDispatch.hospital_id, id])
      const dyndispatchID = dyndispatch.id;


      await this.dynamicConnection.query(`update dispatch_receive SET
       reference_no=?,
       to_title=?,
       address=?,
       note=?,
       from_title=?,
       date=?,
       image=?,
       hospital_id=?
       where id=?`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          timestamp,
          createPostalReceiveDispatch.image,
          createPostalReceiveDispatch.hospital_id,
          dyndispatchID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Postal dispatch updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM dispatch_receive WHERE id = ?', [id])
        }
      }];


    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }


  async removeFrontofficePostalDispatch(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM dispatch_receive WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM dispatch_receive WHERE hos_dispatch_receive_id = ? and hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: 'success',
          message: `postal dispatch details with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async createReceive(createPostalReceiveDispatch: PostalReceiveDispatch) {
    try {
      const addReceive = await this.connection.query(
        `INSERT into dispatch_receive(
         reference_no,
         to_title,
         address,
         note,
         from_title,
         date,
         image,
         type
          ) VALUES (?,?,?,?,?,?,?,?)`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          createPostalReceiveDispatch.date,
          createPostalReceiveDispatch.image,
          'receive'
        ],
      )
      const addReceiveID = addReceive.insertId;
      await this.dynamicConnection.query(
        `INSERT into dispatch_receive(
         reference_no,
         to_title,
         address,
         note,
         from_title,
         date,
         image,
         type,
         hospital_id,
         hos_dispatch_receive_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          createPostalReceiveDispatch.date,
          createPostalReceiveDispatch.image,
          'receive',
          createPostalReceiveDispatch.hospital_id,
          addReceiveID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Postal receive details added successfully ",
          "Rceive_Details": await this.connection.query('SELECT * FROM dispatch_receive WHERE id = ?', [addReceiveID])
        }
      }];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }


  async updateReceive(id: number, createPostalReceiveDispatch: PostalReceiveDispatch) {
    try {
      await this.connection.query(`update dispatch_receive SET
        reference_no=?,
         to_title=?,
         address=?,
         note=?,
         from_title=?,
         date=?,
         image=?
         where id=?`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          createPostalReceiveDispatch.date,
          createPostalReceiveDispatch.image,
          id
        ],
      )
      const [dyndispatch] = await this.dynamicConnection.query(`select id from dispatch_receive where hospital_id = ? and  hos_dispatch_receive_id = ?`, [createPostalReceiveDispatch.hospital_id, id])
      const dyndispatchID = dyndispatch.id;
      await this.dynamicConnection.query(`update dispatch_receive SET
         reference_no=?,
         to_title=?,
         address=?,
         note=?,
         from_title=?,
         date=?,
         image=?,
         hospital_id=?
         where id=?`,
        [
          createPostalReceiveDispatch.reference_no,
          createPostalReceiveDispatch.to_title,
          createPostalReceiveDispatch.address,
          createPostalReceiveDispatch.note,
          createPostalReceiveDispatch.from_title,
          createPostalReceiveDispatch.date,
          createPostalReceiveDispatch.image,
          createPostalReceiveDispatch.hospital_id,
          dyndispatchID
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Postal receive updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM dispatch_receive WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      return error
    }
  }




  async removeFrontofficePostalReceive(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM dispatch_receive WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM dispatch_receive WHERE hos_dispatch_receive_id = ? and hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: 'success',
          message: `postal receive details with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }

}
