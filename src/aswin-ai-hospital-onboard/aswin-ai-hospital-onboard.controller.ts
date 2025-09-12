import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AswinAiHospitalOnboardService } from './aswin-ai-hospital-onboard.service';
import { CreateAswinAiHospitalOnboardDto } from './dto/create-aswin-ai-hospital-onboard.dto';
import { UpdateAswinAiHospitalOnboardDto } from './dto/update-aswin-ai-hospital-onboard.dto';

@Controller('aswin-ai-hospital-onboard')
export class AswinAiHospitalOnboardController {
  constructor(private readonly aswinAiHospitalOnboardService: AswinAiHospitalOnboardService) { }

  @Post()
  async create(@Body() createAswinAiHospitalOnboardDto: CreateAswinAiHospitalOnboardDto) {
    if (!createAswinAiHospitalOnboardDto.hospital_name ||
      !createAswinAiHospitalOnboardDto.contact_no ||
      !createAswinAiHospitalOnboardDto.hospital_opening_timing ||
      !createAswinAiHospitalOnboardDto.address ||
      !createAswinAiHospitalOnboardDto.pincode ||
      !createAswinAiHospitalOnboardDto.email ||
      !createAswinAiHospitalOnboardDto.hospital_reg_no ||
      !createAswinAiHospitalOnboardDto.hospital_reg_date ||
      !createAswinAiHospitalOnboardDto.country ||
      !createAswinAiHospitalOnboardDto.hospital_type ||
      !createAswinAiHospitalOnboardDto.hospital_certificate ||
      !createAswinAiHospitalOnboardDto.primary_mobile_no_country_code) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }
    if (createAswinAiHospitalOnboardDto.contact_no == createAswinAiHospitalOnboardDto.secondary_mobile_no) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: "Primary and Secondary mobile numbers cannot be the same."
      }

    }
    try {
      const getOut = await this.aswinAiHospitalOnboardService.create(createAswinAiHospitalOnboardDto);
      if (getOut && getOut.affectedRows > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_INSERT_V2,
          data: getOut.insertId
        }
      } else {
        return {
          status_code: process.env.ERROR_STATUS_CODE_V2,
          status: process.env.ERROR_STATUS_V2,
          message: process.env.ERROR_MESSAGE_V2,
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      }
    }
  }

  @Get()
  findAll() {
    return this.aswinAiHospitalOnboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aswinAiHospitalOnboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAswinAiHospitalOnboardDto: UpdateAswinAiHospitalOnboardDto) {
    return this.aswinAiHospitalOnboardService.update(+id, updateAswinAiHospitalOnboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aswinAiHospitalOnboardService.remove(+id);
  }
}
