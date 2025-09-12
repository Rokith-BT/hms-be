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
import { SetupBedBedStatusService } from './setup-bed-bed_status.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-bed-bed-status')
export class SetupBedBedStatusController {
  constructor(
    private readonly setupBedBedStatusService: SetupBedBedStatusService,
  ) { }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupBedBedStatusService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupBedBedStatusService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupBedStatus/:search')
  setupBedStatus(@Param('search') search: string) {
    return this.setupBedBedStatusService.setupBedStatus(search);
  }
  @UseGuards(AuthGuard)
  @Get("/v2/getAllBedStatus")
  async findAllBedStatus(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedBedStatusService.findAllBedStatus(
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
  @Get("/v2/Setup_Bed_Status")
  async findBedStatusSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupBedBedStatusService.findBedStatusSearch(
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
