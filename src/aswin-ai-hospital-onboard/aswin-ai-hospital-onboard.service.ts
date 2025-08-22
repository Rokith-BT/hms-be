import { Injectable } from '@nestjs/common';
import { CreateAswinAiHospitalOnboardDto } from './dto/create-aswin-ai-hospital-onboard.dto';
import { UpdateAswinAiHospitalOnboardDto } from './dto/update-aswin-ai-hospital-onboard.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AswinAiHospitalOnboardService {
  constructor(
    @InjectDataSource('aswinConnection')
    private readonly connection: DataSource,
  ) { }
  async create(createAswinAiHospitalOnboardDto: CreateAswinAiHospitalOnboardDto) {
    try {
      const insertHospital = await this.connection.query(`insert into hospitals (
      HealthFacilityID,
      hospital_name,
      contact_no,
      hospital_consulting_charge,
      hospital_opening_timing,
      hospital_closing_timing,
      address,
      state,
      district,
      pincode,
      website,
      email,
      hospital_reg_no,
      hospital_reg_date,
      hospital_reg_expiry_date,
      specialty,
      logo,
      bedcount,
      overview,
      tax_percentage,
      tax_amount,
      lattitude,
      longitude,
      country,
      hospital_type,
      hospital_certificate,
      secondary_mobile_no,
      primary_mobile_no_country_code,
      secondary_mobile_no_country_code
      ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        createAswinAiHospitalOnboardDto.HealthFacilityID || "HF" + Math.floor(Math.random() * 1000000),
        createAswinAiHospitalOnboardDto.hospital_name,
        createAswinAiHospitalOnboardDto.contact_no,
        createAswinAiHospitalOnboardDto.hospital_consulting_charge || 0,
        createAswinAiHospitalOnboardDto.hospital_opening_timing,
        createAswinAiHospitalOnboardDto.hospital_closing_timing,
        createAswinAiHospitalOnboardDto.address,
        createAswinAiHospitalOnboardDto.state,
        createAswinAiHospitalOnboardDto.district,
        createAswinAiHospitalOnboardDto.pincode,
        createAswinAiHospitalOnboardDto.website || "",
        createAswinAiHospitalOnboardDto.email,
        createAswinAiHospitalOnboardDto.hospital_reg_no,
        createAswinAiHospitalOnboardDto.hospital_reg_date,
        createAswinAiHospitalOnboardDto.hospital_reg_expiry_date,
        createAswinAiHospitalOnboardDto.specialty,
        createAswinAiHospitalOnboardDto.logo || "",
        createAswinAiHospitalOnboardDto.bedcount || 0,
        createAswinAiHospitalOnboardDto.overview || "",
        createAswinAiHospitalOnboardDto.tax_percentage || 0,
        createAswinAiHospitalOnboardDto.tax_amount || 0,
        createAswinAiHospitalOnboardDto.lattitude,
        createAswinAiHospitalOnboardDto.longitude,
        createAswinAiHospitalOnboardDto.country,
        createAswinAiHospitalOnboardDto.hospital_type,
        createAswinAiHospitalOnboardDto.hospital_certificate,
        createAswinAiHospitalOnboardDto.secondary_mobile_no,
        createAswinAiHospitalOnboardDto.primary_mobile_no_country_code,
        createAswinAiHospitalOnboardDto.secondary_mobile_no_country_code
      ])
      for (const a of createAswinAiHospitalOnboardDto.image) {
        if (a) {
          this.connection.query(`insert into hospital_images (hospital_id, hospital_images) values(?,?)`, [insertHospital.insertId, a])
        }
      }
      return insertHospital;
    } catch (error) {
      console.log(error, 'Error in createAswinAiHospitalOnboardDto');
      return error;
    }
  }

  findAll() {
    return `This action returns all aswinAiHospitalOnboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aswinAiHospitalOnboard`;
  }

  update(id: number, updateAswinAiHospitalOnboardDto: UpdateAswinAiHospitalOnboardDto) {
    return `This action updates a #${id} aswinAiHospitalOnboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} aswinAiHospitalOnboard`;
  }
}
