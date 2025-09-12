import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RadiologyTest } from './entities/radiology_test.entity';

@Injectable()
export class RadiologyTestService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createRadiologyTest: RadiologyTest) {
    try {
      const addRadiologyTest = await this.connection.query(
        `INSERT into radio(
       test_name,
       short_name,
       test_type,
       radiology_category_id,
       sub_category,
       report_days,
       charge_id
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          createRadiologyTest.test_name,
          createRadiologyTest.short_name,
          createRadiologyTest.test_type,
          createRadiologyTest.radiology_category_id,
          createRadiologyTest.sub_category,
          createRadiologyTest.report_days,
          createRadiologyTest.charge_id,
        ],
      );
      const addedRadiologyId = addRadiologyTest.insertId;
      const dynRadiologyCate = await this.dynamicConnection.query(
        'SELECT id FROM lab WHERE hospital_lab_id = ? and Hospital_id = ?',
        [
          createRadiologyTest.radiology_category_id,
          createRadiologyTest.hospital_id,
        ],
      );
      const dynRadiologyCateID = dynRadiologyCate[0].id;
      const [dynCharge] = await this.dynamicConnection.query(
        'SELECT id FROM charges WHERE hospital_charges_id = ? and Hospital_id = ?',
        [createRadiologyTest.charge_id, createRadiologyTest.hospital_id],
      );
      const dynChargeID = dynCharge.id;
      await this.dynamicConnection.query(
        `INSERT into radio(
       test_name,
       short_name,
       test_type,
       radiology_category_id,
       sub_category,
       report_days,
       charge_id,
       hospital_id,
       hos_radio_id
          ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          createRadiologyTest.test_name,
          createRadiologyTest.short_name,
          createRadiologyTest.test_type,
          dynRadiologyCateID,
          createRadiologyTest.sub_category,
          createRadiologyTest.report_days,
          dynChargeID,
          createRadiologyTest.hospital_id,
          addedRadiologyId,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.RADIOLOGY_TEST_MESSAGE,
            Radiology_Values: await this.connection.query(
              'SELECT * FROM radio WHERE id = ?',
              [addedRadiologyId],
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

  async createRadiologyParameterDetails(createRadiologyTest: RadiologyTest[]) {
    try {
      const results = [];
      for (const radiology_parameter_detailsEntity of createRadiologyTest) {
        const result = await this.connection.query(
          'INSERT into radiology_parameterdetails(radiology_id,radiology_parameter_id) VALUES (?,?)',
          [
            radiology_parameter_detailsEntity.radiology_id,
            radiology_parameter_detailsEntity.radiology_parameter_id,
          ],
        );
        const [dynRadiology] = await this.dynamicConnection.query(
          `select id from radio where hospital_id = ? and  hos_radio_id = ?`,
          [
            radiology_parameter_detailsEntity.hospital_id,
            radiology_parameter_detailsEntity.radiology_id,
          ],
        );
        const dynRadiologyID = dynRadiology.id;
        const dynRadiologyParameter = await this.dynamicConnection.query(
          'SELECT id FROM radiology_parameter WHERE hospital_radiology_parameter_id = ? and Hospital_id = ?',
          [
            radiology_parameter_detailsEntity.radiology_parameter_id,
            radiology_parameter_detailsEntity.hospital_id,
          ],
        );
        const dynRadiologyParameterID = dynRadiologyParameter[0].id;
        await this.dynamicConnection.query(
          'INSERT into radiology_parameterdetails(radiology_id,radiology_parameter_id,hospital_id,hos_radiology_parameterdetails_id) VALUES (?,?,?,?)',
          [
            dynRadiologyID,
            dynRadiologyParameterID,
            radiology_parameter_detailsEntity.hospital_id,
            result.insertId,
          ],
        );
        const radiologyParameterdetails = await this.connection.query(
          'SELECT * FROM radiology_parameterdetails where id = ?',
          [result.insertId],
        );
        results.push({
          status: process.env.SUCCESS_STATUS,
          message: process.env.RADIOLOGY_PARAMETER_MESSAGE,
          pathologyparameterdetails: radiologyParameterdetails[0],
          originalInsertId: result.insertId,
        });
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.RADIOLOGY_PARAMETER_MESSAGE,
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

  async updateRadio(id: number, createRadiologyTest: RadiologyTest) {
    try {
      await this.connection.query(
        `update radio SET
    test_name=?,
    short_name=?,
    test_type=?,
    radiology_category_id=?,
    sub_category=?,
    report_days=?,
    charge_id=?
    where id=?`,
        [
          createRadiologyTest.test_name,
          createRadiologyTest.short_name,
          createRadiologyTest.test_type,
          createRadiologyTest.radiology_category_id,
          createRadiologyTest.sub_category,
          createRadiologyTest.report_days,
          createRadiologyTest.charge_id,
          id,
        ],
      );

      const dynRadiologyCate = await this.dynamicConnection.query(
        'SELECT id FROM lab WHERE hospital_lab_id = ? and Hospital_id = ?',
        [
          createRadiologyTest.radiology_category_id,
          createRadiologyTest.hospital_id,
        ],
      );
      const dynRadiologyCateID = dynRadiologyCate[0].id;

      const [dynCharge] = await this.dynamicConnection.query(
        'SELECT id FROM charges WHERE hospital_charges_id = ? and Hospital_id = ?',
        [createRadiologyTest.charge_id, createRadiologyTest.hospital_id],
      );
      const dynChargeID = dynCharge.id;
      const [dynRadio] = await this.dynamicConnection.query(
        `select id from radio where hospital_id = ? and hos_radio_id = ?`,
        [createRadiologyTest.hospital_id, id],
      );
      const dynRadioID = dynRadio.id;
      await this.dynamicConnection.query(
        `update radio SET
        test_name=?,
        short_name=?,
        test_type=?,
        radiology_category_id=?,
        sub_category=?,
        report_days=?,
        charge_id=?,
        hospital_id=?
        where id=?`,
        [
          createRadiologyTest.test_name,
          createRadiologyTest.short_name,
          createRadiologyTest.test_type,
          dynRadiologyCateID,
          createRadiologyTest.sub_category,
          createRadiologyTest.report_days,
          dynChargeID,
          createRadiologyTest.hospital_id,
          dynRadioID,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.RADIOLOGY_DETAILS_UPDATE_MESSAGE,
            updated_values: await this.connection.query(
              'SELECT * FROM radio WHERE id = ?',
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

  async updateRadiologyParameterDetails(createRadiologyTest: RadiologyTest[]) {
    try {
      for (const radiology_parameterdetailsEntity of createRadiologyTest) {
        const [getAdminRadiologyID] = await this.dynamicConnection.query(
          `select id from radio where hospital_id = ? and hos_radio_id = ?`,
          [
            radiology_parameterdetailsEntity.hospital_id,
            radiology_parameterdetailsEntity.radiology_id,
          ],
        );
        const [getAdminRadioParameterId] = await this.dynamicConnection.query(
          `select id from radiology_parameter where Hospital_id = ? and hospital_radiology_parameter_id = ?`,
          [
            radiology_parameterdetailsEntity.hospital_id,
            radiology_parameterdetailsEntity.radiology_parameter_id,
          ],
        );
        if (radiology_parameterdetailsEntity.id) {
          const [getAdminRadioParameterDetails_id] =
            await this.dynamicConnection.query(
              `select id from radiology_parameterdetails where hospital_id = ? and hos_radiology_parameterdetails_id = ?`,
              [
                radiology_parameterdetailsEntity.hospital_id,
                radiology_parameterdetailsEntity.id,
              ],
            );
          await this.connection.query(
            `update radiology_parameterdetails set radiology_id = ?,
    radiology_parameter_id = ? where id = ?`,
            [
              radiology_parameterdetailsEntity.radiology_id,
              radiology_parameterdetailsEntity.radiology_parameter_id,
              radiology_parameterdetailsEntity.id,
            ],
          );
          await this.dynamicConnection.query(
            `update radiology_parameterdetails set radiology_id = ?,
      radiology_parameter_id = ? where id = ?`,
            [
              getAdminRadiologyID.id,
              getAdminRadioParameterId.id,
              getAdminRadioParameterDetails_id.id,
            ],
          );
        } else {
          const insertInHms = await this.connection.query(
            `insert into radiology_parameterdetails (radiology_id,
                radiology_parameter_id) values (?,?)`,
            [
              radiology_parameterdetailsEntity.radiology_id,
              radiology_parameterdetailsEntity.radiology_parameter_id,
            ],
          );
          await this.dynamicConnection.query(
            `insert into radiology_parameterdetails (radiology_id,
                  radiology_parameter_id,
                  hospital_id,
                  hos_radiology_parameterdetails_id) values (?,?,?,?)`,
            [
              getAdminRadiologyID.id,
              getAdminRadioParameterId.id,
              radiology_parameterdetailsEntity.hospital_id,
              insertInHms.insertId,
            ],
          );
        }
      }
      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.RADIOLOGY_PARAMETER_MESSAGE,
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

  async removeRadiology(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM radiology_parameterdetails WHERE radiology_id = ?',
        [id],
      );
      await this.connection.query('DELETE FROM radio WHERE id = ?', [id]);
      let dynamicRadiologyId;
      const dynamicDeleteRadilogy = await this.dynamicConnection.query(
        'SELECT id FROM radio WHERE hos_radio_id= ? and hospital_id = ?',
        [id, hospital_id],
      );
      dynamicRadiologyId = dynamicDeleteRadilogy[0].id;
      await this.dynamicConnection.query(
        'DELETE FROM radiology_parameterdetails WHERE radiology_id = ? AND hospital_id = ?',
        [dynamicRadiologyId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM radio WHERE id = ? AND hospital_id = ?',
        [dynamicRadiologyId, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.RADIOLOGY_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
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

  async removeRadiologyparameterdetails(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM radiology_parameterdetails WHERE id = ?',
        [id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM radiology_parameterdetails WHERE hos_radiology_parameterdetails_id = ? and hospital_id = ?',
        [id, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.RADIOLOGY_BILL_PARAMETER} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
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
}
