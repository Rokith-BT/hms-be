import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { IpdTreatmentHistoryService } from './ipd_treatment_history.service';
import { IpdTreatmentHistory } from './entities/ipd_treatment_history.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('ipd-treatment-history')
export class IpdTreatmentHistoryController {
  constructor(
    private readonly ipdTreatmentHistoryService: IpdTreatmentHistoryService,
  ) { }
  @UseGuards(AuthGuard)
  @Get('/TreatmentHistory/:id')
  findTreatmentHistorySearch(
    @Param('id') id: number,
    @Query('search') search: string,
  ) {
    return this.ipdTreatmentHistoryService.findTreatmentHistorySearch(
      id,
      search,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/v2/get_ipd_treatment_history')
  async findIpdTreatmentHistory(
    @Query('id') id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'patient ID is required',
        };
      }

      const final_out =
        await this.ipdTreatmentHistoryService.findIpdTreatmentHistory(
          id,
          search,
          limit || 10,
          page || 1,
        );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
          data: [],
          total: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v3/get_ipd_treatment_history')
  async findIPDTreatmentHistory(
    @Query('id') id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'patient ID is required',
        };
      }

      const final_out =
        await this.ipdTreatmentHistoryService.findIPDTreatmentHistory(
          id,
          search,
          limit || 10,
          page || 1,
        );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
          data: [],
          total: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }


}
