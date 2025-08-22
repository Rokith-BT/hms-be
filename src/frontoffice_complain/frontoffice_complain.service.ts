import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FrontofficeComplain } from "./entities/frontoffice_complain.entity";


@Injectable()
export class FrontofficeComplainService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createFrontofficeComplain: FrontofficeComplain) {

    try {
      const addComplaint = await this.connection.query(
        `INSERT into complaint(
       complaint_type_id,
       source,
       name,
       contact,
       email,
       date,
       description,
       action_taken,
       assigned,
       note,
       image
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createFrontofficeComplain.complaint_type_id,
          createFrontofficeComplain.source,
          createFrontofficeComplain.name,
          createFrontofficeComplain.contact,
          createFrontofficeComplain.email,
          createFrontofficeComplain.date,
          createFrontofficeComplain.description,
          createFrontofficeComplain.action_taken,
          createFrontofficeComplain.assigned,
          createFrontofficeComplain.note,
          createFrontofficeComplain.image
        ],
      )

      const addComplaintID = addComplaint.insertId;

      await this.dynamicConnection.query(
        `INSERT into complaint(
       complaint_type_id,
       source,
       name,
       contact,
       email,
       date,
       description,
       action_taken,
       assigned,
       note,
       image,
       hospital_id,
       hos_complaint_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createFrontofficeComplain.complaint_type_id,
          createFrontofficeComplain.source,
          createFrontofficeComplain.name,
          createFrontofficeComplain.contact,
          createFrontofficeComplain.email,
          createFrontofficeComplain.date,
          createFrontofficeComplain.description,
          createFrontofficeComplain.action_taken,
          createFrontofficeComplain.assigned,
          createFrontofficeComplain.note,
          createFrontofficeComplain.image,
          createFrontofficeComplain.hospital_id,
          addComplaintID
        ],
      )

      return [{
        "data ": {
          status: "success",
          "messege": "Complaint added successfully ",
          "complaint_Details": await this.connection.query('SELECT * FROM complaint WHERE id = ?', [addComplaintID])
        }
      }];


    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async update(id: number, createFrontofficeComplain: FrontofficeComplain) {

    try {
      await this.connection.query(`update complaint SET
       complaint_type_id=?,
       source=?,
       name=?,
       contact=?,
       email=?,
       date=?,
       description=?,
       action_taken=?,
       assigned=?,
       note=?,
       image=?
       where id=?`,
        [
          createFrontofficeComplain.complaint_type_id,
          createFrontofficeComplain.source,
          createFrontofficeComplain.name,
          createFrontofficeComplain.contact,
          createFrontofficeComplain.email,
          createFrontofficeComplain.date,
          createFrontofficeComplain.description,
          createFrontofficeComplain.action_taken,
          createFrontofficeComplain.assigned,
          createFrontofficeComplain.note,
          createFrontofficeComplain.image,
          id
        ],
      )


      const [dynCallLogs] = await this.dynamicConnection.query(`select id from complaint where hospital_id = ? and  hos_complaint_id = ?`, [createFrontofficeComplain.hospital_id, id])
      const dynCallLogsID = dynCallLogs.id;

      await this.dynamicConnection.query(`update complaint SET
       complaint_type_id=?,
       source=?,
       name=?,
       contact=?,
       email=?,
       date=?,
       description=?,
       action_taken=?,
       assigned=?,
       note=?,
       image=?,
       hospital_id=?
       where id=?`,
        [
          createFrontofficeComplain.complaint_type_id,
          createFrontofficeComplain.source,
          createFrontofficeComplain.name,
          createFrontofficeComplain.contact,
          createFrontofficeComplain.email,
          createFrontofficeComplain.date,
          createFrontofficeComplain.description,
          createFrontofficeComplain.action_taken,
          createFrontofficeComplain.assigned,
          createFrontofficeComplain.note,
          createFrontofficeComplain.image,
          createFrontofficeComplain.hospital_id,
          dynCallLogsID
        ],
      )

      return [{
        "data ": {
          status: "success",
          "messege": "Complaint updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM complaint WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async removeFrontofficeComplaint(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM complaint WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM complaint WHERE hos_complaint_id = ? and hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: 'success',
          message: `Complaint details with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }

}
