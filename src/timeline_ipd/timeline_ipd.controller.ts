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
} from '@nestjs/common';
import { TimelineIpdService } from './timeline_ipd.service';
import { TimelineIpd } from './entities/timeline_ipd.entity';

@Controller('timeline-ipd')
export class TimelineIpdController {
  constructor(private readonly timelineIpdService: TimelineIpdService) {}

  @Post()
  create(@Body() createTimelineIpd: TimelineIpd) {
    return this.timelineIpdService.create(createTimelineIpd);
  }

  @Get('/patTimeline/:patient_id')
  findOne(@Param('patient_id') patient_id: number) {
    return this.timelineIpdService.findOne(patient_id);
  }

  @Patch('/:id')
  update(@Param('id') id: number, @Body() createTimelineIpd: TimelineIpd) {
    return this.timelineIpdService.update(id, createTimelineIpd);
  }

  @Delete('/:id')
  async removePatientTimeline(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.timelineIpdService.remove(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }

  @Get('/v2/get_ipd_timeline')
  async findIpdTimelineDetails(
    @Query('patient_id') patient_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {

      if (!patient_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Patient ID is required',
        };
      }
  
      const final_out = await this.timelineIpdService.findIpdTimelineDetails(
        patient_id,
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
