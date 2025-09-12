import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ReferralPerson } from "./entities/referral_person.entity";

@Injectable()
export class ReferralPersonService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createReferralPerson: ReferralPerson) {
    try {
      const addReferralPerson = await this.connection.query(
        `INSERT into referral_person(
        name,
        category_id,
        contact,
        person_name,
        person_phone,
        standard_commission,
        address
      ) VALUES (?,?,?,?,?,?,?)`,
        [
          createReferralPerson.name,
          createReferralPerson.category_id,
          createReferralPerson.contact,
          createReferralPerson.person_name,
          createReferralPerson.person_phone,
          createReferralPerson.standard_commission,
          createReferralPerson.address
        ],
      )
      const addedReferralPersonId = addReferralPerson.insertId;
      const dynnncategoryid = await this.dynamicConnection.query('SELECT id FROM referral_category WHERE hospital_referral_category_id = ? and Hospital_id = ?', [createReferralPerson.category_id, createReferralPerson.Hospital_id]);
      const dynnnCateid = dynnncategoryid[0].id;
      await this.dynamicConnection.query(
        `INSERT into referral_person(
       name,
       category_id,
       contact,
       person_name,
       person_phone,
       standard_commission,
       address,
       hos_referral_person_id,
       Hospital_id
     ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          createReferralPerson.name,
          dynnnCateid,
          createReferralPerson.contact,
          createReferralPerson.person_name,
          createReferralPerson.person_phone,
          createReferralPerson.standard_commission,
          createReferralPerson.address,
          addedReferralPersonId,
          createReferralPerson.Hospital_id
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege":process.env.REFERRAL_PERSON,
          "Added_values": await this.connection.query('SELECT * FROM referral_person WHERE id = ?', [addedReferralPersonId])
        }
      }];



    } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }






  async update(id: number, createReferralPerson: ReferralPerson) {
    try {
      await this.connection.query(
        `UPDATE referral_person SET
        name=?,
        category_id=?,
        contact=?,
        person_name=?,
        person_phone=?,
        standard_commission=?,
        address=?
        WHERE id = ?
        `,
        [
          createReferralPerson.name,
          createReferralPerson.category_id,
          createReferralPerson.contact,
          createReferralPerson.person_name,
          createReferralPerson.person_phone,
          createReferralPerson.standard_commission,
          createReferralPerson.address,
          id
        ],
      )
      const dynnnAdmincategoryid = await this.dynamicConnection.query('SELECT id FROM referral_category WHERE hospital_referral_category_id = ? and Hospital_id = ?', [createReferralPerson.category_id, createReferralPerson.Hospital_id]);
      const dynnnADMINCateid = dynnnAdmincategoryid[0].id;
      const dynnnAdminrefPersonid = await this.dynamicConnection.query('SELECT id FROM referral_person WHERE hos_referral_person_id = ? and Hospital_id = ?', [id, createReferralPerson.Hospital_id]);
      const dynnnAdminrefPersonidddd = dynnnAdminrefPersonid[0].id;
      await this.dynamicConnection.query(
        `UPDATE referral_person SET
        name=?,
        category_id=?,
        contact=?,
        person_name=?,
        person_phone=?,
        standard_commission=?,
        address=?,
        Hospital_id=?
        WHERE id = ?
        `,
        [
          createReferralPerson.name,
          dynnnADMINCateid,
          createReferralPerson.contact,
          createReferralPerson.person_name,
          createReferralPerson.person_phone,
          createReferralPerson.standard_commission,
          createReferralPerson.address,
          createReferralPerson.Hospital_id,
          dynnnAdminrefPersonidddd
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.REFERRAL_PERSON_UPDATED,
          "Updated_values": await this.connection.query('SELECT * FROM referral_person WHERE id = ?', [id])
        }
      }];

    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }



  async findAll(): Promise<ReferralPerson[]> {
    try {
       const getReferralPersonDetails = await this.connection.query(`SELECT
    rp.id,
    rp.name,
    GROUP_CONCAT(CONCAT(rt.name, ' - ', RPC.commission, '%') ORDER BY rc.name SEPARATOR '\n') AS commission,
    rc.name AS category_name,
    rp.contact AS referralcontact,
    rp.person_name AS contactpersonname,
    rp.person_phone AS contactpersonphone,
    rp.address
FROM referral_person rp
LEFT JOIN referral_category rc ON rp.category_id = rc.id
LEFT JOIN referral_person_commission RPC ON rp.id = RPC.referral_person_id
LEFT JOIN referral_type rt ON RPC.referral_type_id = rt.id
GROUP BY rp.id,rp.name, rc.name, rp.contact, rp.person_name, rp.person_phone, rp.address`);
    return getReferralPersonDetails;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }


  async findreferralPersonSearch(search: string): Promise<ReferralPerson | null> {
    try {
         let query = `SELECT
    rp.id,
    rp.name,
    GROUP_CONCAT(CONCAT(rt.name, ' - ', RPC.commission, '%') ORDER BY rc.name SEPARATOR '\n') AS commission,
    rc.name AS category_name,
    rp.contact AS referralcontact,
    rp.person_name AS contactpersonname,
    rp.person_phone AS contactpersonphone,
    rp.address
FROM referral_person rp
LEFT JOIN referral_category rc ON rp.category_id = rc.id
LEFT JOIN referral_person_commission RPC ON rp.id = RPC.referral_person_id
LEFT JOIN referral_type rt ON RPC.referral_type_id = rt.id
where rp.id
`
    let values = []
    if (search) {
      query += ` and  (rp.name like ? or rc.name like ? or rp.contact like ? or rp.person_name like ? or rp.person_phone like ? or rp.address like ?)  `
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")

    }
    let last = `GROUP BY rp.id,rp.name, rc.name, rp.contact, rp.person_name, rp.person_phone, rp.address`
    let final = query + last
    const getReferralPersonsch = await this.connection.query(final, values)
    return getReferralPersonsch;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
 
  }










  async remove(referral_person_id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM referral_person_commission WHERE referral_person_id = ?', [referral_person_id]);

      await this.connection.query('DELETE FROM referral_person WHERE id = ?', [referral_person_id]);
      const adminreferralPerson = await this.dynamicConnection.query(`select id from referral_person where hos_referral_person_id = ? and Hospital_id = ?`, [referral_person_id, Hospital_id]);
      const adminReferralPersonID = adminreferralPerson[0].id;
      await this.dynamicConnection.query(`delete from referral_person_commission where referral_person_id = ?`, [adminReferralPersonID])
      await this.dynamicConnection.query(`delete from referral_person where id = ?`, [adminReferralPersonID])
      return [{
        "status": process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
      }
      ];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }




  async findRefCategory() {
    try {
       const ReferralCategory = await this.connection.query('SELECT id,name from referral_category');
    return ReferralCategory;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }







}
