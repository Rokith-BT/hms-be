import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CryptoService } from 'src/qr-encrpyt/qr-encrpyt.service';

@Injectable()
export class HospitalsService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => CryptoService))
    private readonly EncryptedService: CryptoService,
  ) {}

  async findOne(id: string) {
    try {
      const hospitals = await this.dynamicConnection.query(
        `SELECT * FROM hospitals WHERE plenome_id = ?`,
        [id],
      );
      return hospitals;
    } catch (error) {
      return error;
    }
  }

  async findoneQR(id: number) {
    try {
      const [getall] = await this.dynamicConnection.query(
        `select hospitals.plenome_id as hospital_id, hospitals.HealthFacilityID,hospitals.hospital_name,
    hospitals.contact_no,hospitals.hospital_consulting_charge,hospitals.hospital_opening_timing,
    hospitals.hospital_closing_timing,hospitals.address,hospitals.state,hospitals.district,hospitals.pincode,
    hospitals.website,hospitals.email,hospitals.hospital_reg_no,hospitals.hospital_reg_date,hospitals.hospital_reg_expiry_date,
    hospitals.specialty,hospitals.image,hospitals.logo,hospitals.bedcount,hospitals.overview,hospitals.created_at,
    hospitals.tax_percentage,hospitals.tax_amount,hospitals.lattitude,hospitals.longitude from hospitals WHERE plenome_id = ?`,
        [id],
      );
      let resp = {
        QR_type_id: 1,
        QR_type: 'HospitalQR',
        hospitals: getall,
      };
      return resp;
    } catch (error) {
      return error;
    }
  }

  async EncryptedfindoneQR(id: number) {
    try {
      const [getall] = await this.dynamicConnection.query(
        `select hospitals.plenome_id as hospital_id from hospitals WHERE plenome_id = ?`,
        [id],
      );
      let resp = {
        QR_type_id: 1,
        QR_type: 'HospitalQR',
        hospitals_id: getall?.hospital_id,
      };
      const encrypt_apicall = await this.EncryptedService.encrypt(
        JSON.stringify(resp),
        process.env.encryption_key,
        process.env.encryption_iv,
      );
      return encrypt_apicall;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, HospitalEntity: Hospital) {
    try {
      await this.dynamicConnection.query(
        `update hospitals SET hospital_name = ?,
          contact_no = ?,
          hospital_consulting_charge = ?,
          hospital_opening_timing = ?,
          hospital_closing_timing = ?,
          address = ?,
          state = ?,
          district = ?,
          pincode = ?,
          website = ?,
          email = ?,
          hospital_reg_no = ?,
      hospital_reg_date = ?,
      hospital_reg_expiry_date = ?,
      specialty = ?,
      image = ?,
      logo = ?,
      bedcount = ?,
      overview = ?
   where plenome_id = ?
          `,
        [
          HospitalEntity.hospital_name,
          HospitalEntity.contact_no,
          HospitalEntity.hospital_consulting_charge,
          HospitalEntity.hospital_opening_timing,
          HospitalEntity.hospital_closing_timing,
          HospitalEntity.address,
          HospitalEntity.state,
          HospitalEntity.district,
          HospitalEntity.pincode,
          HospitalEntity.website,
          HospitalEntity.email,
          HospitalEntity.hospital_reg_no,
          HospitalEntity.hospital_reg_date,
          HospitalEntity.hospital_reg_expiry_date,
          JSON.stringify(HospitalEntity.specialty),
          HospitalEntity.image,
          HospitalEntity.logo,
          HospitalEntity.bedcount,
          HospitalEntity.overview,
          id,
        ],
      );

      return [
        {
          data: {
            status: 'success',
            message: 'hospitals details updated successfully',
            updated_values: await this.dynamicConnection.query(
              `select * from hospitals where plenome_id = ?`,
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      return [
        {
          status: 'failed',
          messege: 'cannot update hospitals profile',
          error: error,
        },
      ];
    }
  }
}
