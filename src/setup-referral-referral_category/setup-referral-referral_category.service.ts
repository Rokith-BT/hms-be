import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupReferralReferralCategory } from "./entities/setup-referral-referral_category.entity";
import {CountDto} from "./dto/setup-referral-referral_category.dto"


@Injectable()
export class SetupReferralReferralCategoryService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(referral_categoryEntity: SetupReferralReferralCategory): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query('INSERT INTO referral_category (name,is_active) VALUES (?,?)',
        [referral_categoryEntity.name,
        referral_categoryEntity.is_active

        ]
      );
      await this.dynamicConnection.query(`INSERT INTO referral_category (name,is_active,Hospital_id,hospital_referral_category_id) VALUES (?,?,?,?)`, [
        referral_categoryEntity.name,
        referral_categoryEntity.is_active,
        referral_categoryEntity.Hospital_id,
        result.insertId
      ])

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.REFERRAL_CATEGORY,
          "inserted_data": await this.connection.query('SELECT * FROM referral_category WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }




  async findAll(): Promise<SetupReferralReferralCategory[]> {
    try {
       const referral_category = await this.connection.query('SELECT * FROM referral_category');
    return referral_category;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }


  async findOne(id: string): Promise<SetupReferralReferralCategory | null> {
    try {
        const referral_category = await this.connection.query('SELECT * FROM referral_category WHERE id = ?', [id]);

    if (referral_category.length === 1) {
      return referral_category;
    } else {
      return null;
    }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
  
  }


  async update(id: string, referral_categoryEntity: SetupReferralReferralCategory): Promise<{ [key: string]: any }[]> {

    try {


       await this.connection.query(
        'UPDATE referral_category SET name =? WHERE id = ?',
        [referral_categoryEntity.name,
          id
        ]
      );

       await this.dynamicConnection.query(
        'update referral_category SET name = ? where hospital_referral_category_id = ? and Hospital_id= ?',

        [referral_categoryEntity.name,
          id,
        referral_categoryEntity.Hospital_id
        ]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.REFERRAL_CATEGORY_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM referral_category WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      const referral_category = await this.connection.query('SELECT * FROM referral_category WHERE id = ?', [id]);

    if (referral_category.length === 1) {
      return referral_category;
    } else {
      return null;
    }
    }
  }

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM referral_category WHERE id = ?', [id]);
      const [admin] = await this.dynamicConnection.query(`select id from referral_category where hospital_referral_category_id = ?`, [id])
      await this.dynamicConnection.query(`delete from referral_category where id = ? and Hospital_id = ?`, [
        admin.id,
        Hospital_id
      ])
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
    return [{
      status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
    }
    ];
  }


  async setupReferralCategory(search: string): Promise<SetupReferralReferralCategory[]> {
   let query = ` SELECT * FROM referral_category `
    let values = []
    if (search) {
      query += ` WHERE ( referral_category.name LIKE ? )  `
      values.push("%" + search + "%")
    }
    let final = query;
    const setupReferralcategory = await this.connection.query(final, values);
    return setupReferralcategory;
  }



  async findReferralCategorySearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM referral_category `;

    let countQuery = `
      SELECT COUNT(referral_category.id) AS total FROM referral_category `;

    if (search) {

      const condition = `
      WHERE referral_category.name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY referral_category.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const ReferralCategorySearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: ReferralCategorySearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




}
