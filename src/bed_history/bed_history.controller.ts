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
import { BedHistoryService } from './bed_history.service';
import { BedHistory } from './entities/bed_history.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('bed-history')
export class BedHistoryController {
  constructor(private readonly bedHistoryService: BedHistoryService) { }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findBedHistory(@Param('id') id: number) {
    return this.bedHistoryService.findBedHistory(id);
  }
  @UseGuards(AuthGuard)
  @Get('/BedHistory/:id')
  findBedHistorySearch(
    @Param('id') id: number,
    @Query('search') search: string,
  ) {
    return this.bedHistoryService.findBedHistorySearch(id, search);
  }
  @UseGuards(AuthGuard)
  @Get('/v2/get_ipd_bed_history')
  async findIpdBedHistoryDetails(
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
          message: 'IPD ID is required',
        };
      }

      const final_out = await this.bedHistoryService.findIpdBedHistoryDetails(
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
  @Get('/v3/get_ipd_bed_history')
  async findIpdBedHistoryDetail(
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
          message: 'IPD ID is required',
        };
      }

      const final_out = await this.bedHistoryService.findIpdBedHistoryDetail(
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
