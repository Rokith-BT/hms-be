import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupFindingsFinding } from "./entities/setup-findings-finding.entity";

@Injectable()
export class SetupFindingsFindingService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    findingEntity: SetupFindingsFinding,
  ): Promise<{ [key: string]: any }[]> {

    try {

      const [existingExpense] = await this.connection.query(`
        SELECT id FROM finding WHERE name = ? LIMIT 1`,
      [findingEntity.name])

      if(existingExpense) {
        return [{
          status: process.env.DUPLICATE_NAME,
          message: process.env.FINDING_EXIST
        }]
      }

      const result = await this.connection.query(
        'INSERT INTO finding (name,description,finding_category_id) VALUES (?,?,?)',
        [
          findingEntity.name,
          findingEntity.description,
          findingEntity.finding_category_id,
        ],
      );

      const [finding_category] = await this.dynamicConnection.query(
        `select id from finding_category where Hospital_id = ? and hospital_finding_category_id = ?`,
        [findingEntity.Hospital_id, findingEntity.finding_category_id],
      );

      await this.dynamicConnection.query(
        'insert into finding (name,description,finding_category_id,Hospital_id,hospital_finding_id) values (?,?,?,?,?)',
        [
          findingEntity.name,
          findingEntity.description,
          finding_category.id,
          findingEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.FINDING,
            inserted_data: await this.connection.query(
              'SELECT * FROM finding WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupFindingsFindingService[]> {
    try {
      const finding = await this.connection
        .query(`select finding.id,finding.name,finding.description,finding_category.category from finding 
    join finding_category ON finding.finding_category_id = finding_category.id`);
      return finding;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findOne(id: string): Promise<SetupFindingsFindingService | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding WHERE id = ?',
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
      const finding = await this.connection.query(
        `select finding.id,finding.name,finding.description,finding_category.category from finding 
  join finding_category ON finding.finding_category_id = finding_category.id WHERE finding.id = ?`,
        [id],
      );

      return finding;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }


  }

  async update(
    id: string,
    findingEntity: SetupFindingsFinding,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding WHERE id = ?', [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, 
         message: process.env.EXISTING_RECORD}];
    }

    try {
      await this.connection.query(
        'UPDATE finding SET name =?,description =?,finding_category_id =?  WHERE id = ?',
        [
          findingEntity.name,
          findingEntity.description,
          findingEntity.finding_category_id,
          id,
        ],
      );

      await this.dynamicConnection.query(
        'update finding SET  name =?,description =?,finding_category_id =? where hospital_finding_id = ? and Hospital_id = ?',
        [
          findingEntity.name,
          findingEntity.description,
          findingEntity.finding_category_id,
          id,
          findingEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.FINDING_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM finding WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM finding WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'DELETE FROM finding WHERE id = ?',
        [id],
      );

      const [finding] = await this.dynamicConnection.query(
        `select id from finding where hospital_finding_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from finding where id = ? and Hospital_id = ?`,
        [finding.id, Hospital_id],
      );

      return [
        {
          status:  process.env.SUCCESS_STATUS_V2,
          message:  process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setupFinding(search: string): Promise<SetupFindingsFinding[]> {
    let query = ` select finding.id,finding.name,finding.description,finding_category.category from finding 
    join finding_category ON finding.finding_category_id = finding_category.id `;

    let values = [];
    if (search) {
      query += ` WHERE ( finding.name LIKE ? OR finding_category.category LIKE ? OR finding.description LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const Setupfinding = await this.connection.query(final, values);

    return Setupfinding;
  }

//   async find_findings(limit: number, page: number, search:string) {
//     try {

//       const offset = limit * (page - 1);
//       let searchClause = '';
//       let dateCondition = '';

//       if(search) {
//         searchClause = `(
//         finding.name LIKE '%${search}%' OR
//         finding_category.category LIKE '%${search}%' OR
//         finding.description  LIKE '%${search}%'
//         )`;
//         dateCondition = ` AND ${searchClause}`;
//       }

//       const findings = await this.connection.query(`select finding.id as id, finding.name as name, finding.description as description,
// finding.finding_category_id as finding_category_id,
// finding_category.category as finding_category from finding
// left join finding_category ON finding.finding_category_id = finding_category.id WHERE finding.id ${dateCondition} LIMIT ? OFFSET ?`,
//         [Number(limit), Number(offset)]);

//       let [totallist] = await this.connection.query(`select count(id) as total FROM finding 
//         WHERE finding.id ${dateCondition}`);

//       let variable = {
//         details: findings,
//         total: totallist.total,
//         page:page,
//         limit:limit
//       }
//       return variable;



//     } catch (error) {
//       throw new HttpException({
//         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//         message: process.env.ERROR_MESSAGE,
//       }, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

async find_findings(limit: number, page: number, search: string) {
  try {
    const offset = limit * (page - 1);

    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ` AND (
        finding.name LIKE '%${search}%' OR
        finding_category.category LIKE '%${search}%' OR
        finding.description LIKE '%${search}%'
      )`;
    }

    const findings = await this.connection.query(
      `SELECT finding.id AS id, finding.name AS name, finding.description AS description,
        finding.finding_category_id AS finding_category_id,
        finding_category.category AS finding_category 
      FROM finding
      LEFT JOIN finding_category ON finding.finding_category_id = finding_category.id 
      ${whereClause}
      LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );

    const [totallist] = await this.connection.query(
      `SELECT COUNT(finding.id) AS total 
       FROM finding 
       LEFT JOIN finding_category ON finding.finding_category_id = finding_category.id 
       ${whereClause}`
    );

    return {
      details: findings,
      total: totallist.total,
      page: page,
      limit: limit
    };
  } catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}
