import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetupHumanResourcePayslipSettingsService } from './setup-human_resource-payslip_settings.service';
import { SetupHumanResourcePayslipSetting } from './entities/setup-human_resource-payslip_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-human-resource-payslip-settings')
export class SetupHumanResourcePayslipSettingsController {
  constructor(
    private readonly setupHumanResourcePayslipSettingsService: SetupHumanResourcePayslipSettingsService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() payslip_setting_entity: SetupHumanResourcePayslipSetting) {
    console.log('controller');

    return this.setupHumanResourcePayslipSettingsService.create(
      payslip_setting_entity,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHumanResourcePayslipSettingsService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.setupHumanResourcePayslipSettingsService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payslip_setting_entity: SetupHumanResourcePayslipSetting,
  ) {
    return this.setupHumanResourcePayslipSettingsService.update(
      +id,
      payslip_setting_entity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number, @Query('hospital_id') hospital_id: number) {
    return this.setupHumanResourcePayslipSettingsService.remove(
      id,
      hospital_id,
    );
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllPayrollSettings")
  async findAllPayrollSettings(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourcePayslipSettingsService.findAllPayrollSettings(
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }

  @UseGuards(AuthGuard)
  @Get("/v2/SetupHRPayrollSettings")
  async findPayrollSettingsSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourcePayslipSettingsService.findPayrollSettingsSearch(
        search,
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }


}
