import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FindingsCategory } from "./entities/findings_category.entity";
import { CountDto } from "./findings_category.dto";

@Injectable()
export class FindingsCategoryService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }



  async create(findings_categoryEntity: FindingsCategory): Promise<{ [key: string]: any }[]> {

    try {

      const [existingExpense] = await this.connection.query(`
        SELECT id FROM finding_category WHERE category = ? LIMIT 1`,
        [findings_categoryEntity.category,]);

      if (existingExpense) {
        return [{
          status: process.env.DUPLICATE_NAME,
          message: process.env.FINDING_CATEGORY_EXIST,
        }]
      }

      const result = await this.connection.query('INSERT INTO finding_category (category) VALUES (?)',
        [findings_categoryEntity.category]);
      await this.dynamicConnection.query(`INSERT INTO finding_category (category,Hospital_id,hospital_finding_category_id) VALUES (?,?,?)`, [
        findings_categoryEntity.category,
        findings_categoryEntity.Hospital_id,
        result.insertId
      ])
      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.FINDING_CATEGORY,
          "inserted_data": await this.connection.query('SELECT * FROM finding_category WHERE id = ?', [result.insertId])
        }
      }];

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async findAll(): Promise<FindingsCategory[]> {
    try {
      const finding_category = await this.connection.query('SELECT * FROM finding_category');
      return finding_category;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findOne(id: string): Promise<FindingsCategory | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding_category WHERE id = ?',
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
      const finding_category = await this.connection.query('SELECT * FROM finding_category WHERE id = ?', [id]);
      if (finding_category.length === 1) {
        return finding_category;
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

  async update(id: string, findings_categoryEntity: FindingsCategory): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding_category WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{
        status: process.env.ERROR,
        message: process.env.EXISTING_RECORD
      }];
    }

    try {
      await this.connection.query(
        'UPDATE finding_category SET category =? WHERE id = ?',
        [findings_categoryEntity.category,
          id
        ]
      );
      await this.dynamicConnection.query(
        'update finding_category SET category = ? where hospital_finding_category_id = ? and Hospital_id= ?',

        [findings_categoryEntity.category,
          id,
        findings_categoryEntity.Hospital_id
        ]

      );

      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.FINDING_CATEGORY_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM finding_category WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding_category WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{
        status: process.env.ERROR,
        message: process.env.EXISTING_RECORD,
      }];
    }

    try {
      await this.connection.query('DELETE FROM finding_category WHERE id = ?', [id]);
      const [finding_category] = await this.dynamicConnection.query(`select id from finding_category where hospital_finding_category_id = ?`, [id]);
      await this.dynamicConnection.query(`delete from finding_category where id = ? and Hospital_id = ? `, [
        finding_category.id,
        Hospital_id
      ])

      return [{
        "status": process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
      }
      ];
    }

    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async SetupFindingCategory(search: string): Promise<FindingsCategory[]> {
    let query = ` SELECT * FROM finding_category `
    let values = []
    if (search) {
      query += ` WHERE ( finding_category.category LIKE ? )  `
      values.push("%" + search + "%")
    }
    let final = query;
    const SetupFindingcategory = await this.connection.query(final, values);
    return SetupFindingcategory;
  }

  async find_finding_category(limit: number, page: number, search: string): Promise<CountDto> {
    try {



      const offset = limit * (page - 1);
      let searchClause = '';
      let dateCondition = '';

      if (search) {
        searchClause = `(
        finding_category.category LIKE '%${search}%'
        )`;
        dateCondition = ` AND ${searchClause}`;
      }


      const finding_categorys = await this.connection.query(`SELECT  * FROM finding_category where finding_category.id ${dateCondition}  LIMIT ? OFFSET ?`, [
        Number(limit), Number(offset)
      ]);

      let [total_list] = await this.connection.query(`select count(id) as total from finding_category where finding_category.id ${dateCondition}`);

      let variable = {
        details: finding_categorys,
        total: total_list.total,
        page: page,
        limit: limit

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
