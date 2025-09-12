import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PathologyTest } from './entities/pathology_test.entity';

@Injectable()
export class PathologyTestService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}
  async create(createPathologyTest: PathologyTest) {
    try {
      const addPathologyTest = await this.connection.query(
        `INSERT into pathology(
       test_name,
       short_name,
       test_type,
       pathology_category_id,
       unit,
       sub_category,
       report_days,
       method,
       charge_id
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          createPathologyTest.test_name,
          createPathologyTest.short_name,
          createPathologyTest.test_type,
          createPathologyTest.pathology_category_id,
          createPathologyTest.unit,
          createPathologyTest.sub_category,
          createPathologyTest.report_days,
          createPathologyTest.method,
          createPathologyTest.charge_id,
        ],
      );

      const addedPathologyId = addPathologyTest.insertId;
      const dynPathologyCate = await this.dynamicConnection.query(
        'SELECT id FROM pathology_category WHERE hospital_pathology_category_id = ? and Hospital_id = ?',
        [
          createPathologyTest.pathology_category_id,
          createPathologyTest.hospital_id,
        ],
      );
      const dynPathologyCateID = dynPathologyCate[0].id;
      const [dynCharge] = await this.dynamicConnection.query(
        'SELECT id FROM charges WHERE hospital_charges_id = ? and Hospital_id = ?',
        [createPathologyTest.charge_id, createPathologyTest.hospital_id],
      );
      const dynChargeID = dynCharge.id;
      await this.dynamicConnection.query(
        `INSERT into pathology(
         test_name,
         short_name,
         test_type,
         pathology_category_id,
         unit,
         sub_category,
         report_days,
         method,
         charge_id,
         hospital_id,
         hos_pathology_id
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPathologyTest.test_name,
          createPathologyTest.short_name,
          createPathologyTest.test_type,
          dynPathologyCateID,
          createPathologyTest.unit,
          createPathologyTest.sub_category,
          createPathologyTest.report_days,
          createPathologyTest.method,
          dynChargeID,
          createPathologyTest.hospital_id,
          addedPathologyId,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.PATHOLOGY_TEST_MESSAGE,
            Pathology_Values: await this.connection.query(
              'SELECT * FROM pathology WHERE id = ?',
              [addedPathologyId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createpathologyParameterDetails(createPathologyTest: PathologyTest[]) {
    try {
      const results = [];
      for (const pathology_parameter_detailsEntity of createPathologyTest) {
        const result = await this.connection.query(
          'INSERT into pathology_parameterdetails(pathology_id,pathology_parameter_id) VALUES (?,?)',
          [
            pathology_parameter_detailsEntity.pathology_id,
            pathology_parameter_detailsEntity.pathology_parameter_id,
          ],
        );
        const [dynPathology] = await this.dynamicConnection.query(
          `select id from pathology where hospital_id = ? and  hos_pathology_id = ?`,
          [
            pathology_parameter_detailsEntity.hospital_id,
            pathology_parameter_detailsEntity.pathology_id,
          ],
        );
        const dynPathologyID = dynPathology.id;
        const dynPathologyParameter = await this.dynamicConnection.query(
          'SELECT id FROM pathology_parameter WHERE hospital_pathology_parameter_id = ? and Hospital_id = ?',
          [
            pathology_parameter_detailsEntity.pathology_parameter_id,
            pathology_parameter_detailsEntity.hospital_id,
          ],
        );
        const dynPathologyParameterID = dynPathologyParameter[0].id;
        await this.dynamicConnection.query(
          'INSERT into pathology_parameterdetails(pathology_id,pathology_parameter_id,hospital_id,hos_pathology_parameterdetails_id) VALUES (?,?,?,?)',
          [
            dynPathologyID,
            dynPathologyParameterID,
            pathology_parameter_detailsEntity.hospital_id,
            result.insertId,
          ],
        );
        const pathologyParameterdetails = await this.connection.query(
          'SELECT * FROM pathology_parameterdetails where id = ?',
          [result.insertId],
        );
        results.push({
          status: process.env.SUCCESS_STATUS,
          message: process.env.PATHOLOGY_PARAMETER_MESSAGE,
          pathologyparameterdetails: pathologyParameterdetails[0],
          originalInsertId: result.insertId,
        });
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.PATHOLOGY_PARAMETER_MESSAGE,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removePathology(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM pathology_parameterdetails WHERE pathology_id = ?',
        [id],
      );
      await this.connection.query('DELETE FROM pathology WHERE id = ?', [id]);
      let dynamicPathologyId;
      const dynamicDeletePathology = await this.dynamicConnection.query(
        'SELECT id FROM pathology WHERE hos_pathology_id= ? and hospital_id = ?',
        [id, hospital_id],
      );
      dynamicPathologyId = dynamicDeletePathology[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM pathology_parameterdetails WHERE pathology_id = ? AND hospital_id = ?',
        [dynamicPathologyId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pathology WHERE id = ? AND hospital_id = ?',
        [dynamicPathologyId, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.PATHOLOGY_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updatePathology(id: number, createPathologyTest: PathologyTest) {
    try {
      await this.connection.query(
        `update pathology SET
      test_name=?,
      short_name=?,
      test_type=?,
      pathology_category_id=?,
      unit=?,
      sub_category=?,
      report_days=?,
      method=?,
      charge_id=?
      where id=?`,
        [
          createPathologyTest.test_name,
          createPathologyTest.short_name,
          createPathologyTest.test_type,
          createPathologyTest.pathology_category_id,
          createPathologyTest.unit,
          createPathologyTest.sub_category,
          createPathologyTest.report_days,
          createPathologyTest.method,
          createPathologyTest.charge_id,
          id,
        ],
      );
      const dynPathologyCate = await this.dynamicConnection.query(
        'SELECT id FROM pathology_category WHERE hospital_pathology_category_id = ? and Hospital_id = ?',
        [
          createPathologyTest.pathology_category_id,
          createPathologyTest.hospital_id,
        ],
      );
      const dynPathologyCateID = dynPathologyCate[0].id;

      const [dynCharge] = await this.dynamicConnection.query(
        'SELECT id FROM charges WHERE hospital_charges_id = ? and Hospital_id = ?',
        [createPathologyTest.charge_id, createPathologyTest.hospital_id],
      );
      const dynChargeID = dynCharge.id;

      const [dynPathology] = await this.dynamicConnection.query(
        `select id from pathology where hospital_id = ? and  hos_pathology_id = ?`,
        [createPathologyTest.hospital_id, id],
      );
      const dynPathologyID = dynPathology.id;

      await this.dynamicConnection.query(
        `update pathology SET
       test_name=?,
       short_name=?,
       test_type=?,
       pathology_category_id=?,
       unit=?,
       sub_category=?,
       report_days=?,
       method=?,
       charge_id=?,
       hospital_id=?
       where id=?`,
        [
          createPathologyTest.test_name,
          createPathologyTest.short_name,
          createPathologyTest.test_type,
          dynPathologyCateID,
          createPathologyTest.unit,
          createPathologyTest.sub_category,
          createPathologyTest.report_days,
          createPathologyTest.method,
          dynChargeID,
          createPathologyTest.hospital_id,
          dynPathologyID,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.PATHOLOGY_UPDATE_MESSAGE,
            updated_values: await this.connection.query(
              'SELECT * FROM pathology WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async removePathologyparameterdetails(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM pathology_parameterdetails WHERE id = ?',
        [id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pathology_parameterdetails WHERE hos_pathology_parameterdetails_id = ? and hospital_id = ?',
        [id, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.PATHOLOGY_PARAMETER_BILL} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updatePathologyParameterDetails(createPathologyTest: PathologyTest[]) {
    try {
      for (const patho_parameterdetailsEntity of createPathologyTest) {
        const [getAdminPathologyID] = await this.dynamicConnection.query(
          `select id from pathology where hospital_id = ? and hos_pathology_id = ?`,
          [
            patho_parameterdetailsEntity.hospital_id,
            patho_parameterdetailsEntity.pathology_id,
          ],
        );
        const [getAdminPathoParameterId] = await this.dynamicConnection.query(
          `select id from pathology_parameter where Hospital_id = ? and hospital_pathology_parameter_id = ?`,
          [
            patho_parameterdetailsEntity.hospital_id,
            patho_parameterdetailsEntity.pathology_parameter_id,
          ],
        );
        if (patho_parameterdetailsEntity.id) {
          const [getAdminPathoParameterDetails_id] =
            await this.dynamicConnection.query(
              `select id from pathology_parameterdetails where hospital_id = ? and hos_pathology_parameterdetails_id = ?`,
              [
                patho_parameterdetailsEntity.hospital_id,
                patho_parameterdetailsEntity.id,
              ],
            );

          await this.connection.query(
            `update pathology_parameterdetails set pathology_id = ?,
  pathology_parameter_id = ? where id = ?`,
            [
              patho_parameterdetailsEntity.pathology_id,
              patho_parameterdetailsEntity.pathology_parameter_id,
              patho_parameterdetailsEntity.id,
            ],
          );

          await this.dynamicConnection.query(
            `update pathology_parameterdetails set pathology_id = ?,
    pathology_parameter_id = ? where id = ?`,
            [
              getAdminPathologyID.id,
              getAdminPathoParameterId.id,
              getAdminPathoParameterDetails_id.id,
            ],
          );
        } else {
          const insertInHms = await this.connection.query(
            `insert into pathology_parameterdetails (pathology_id,
              pathology_parameter_id) values (?,?)`,
            [
              patho_parameterdetailsEntity.pathology_id,
              patho_parameterdetailsEntity.pathology_parameter_id,
            ],
          );
          await this.dynamicConnection.query(
            `insert into pathology_parameterdetails (pathology_id,
                pathology_parameter_id,
                hospital_id,
                hos_pathology_parameterdetails_id) values (?,?,?,?)`,
            [
              getAdminPathologyID.id,
              getAdminPathoParameterId.id,
              patho_parameterdetailsEntity.hospital_id,
              insertInHms.insertId,
            ],
          );
        }
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.PATHOLOGY_PARAMETER_UPDATE_MESSAGE,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
