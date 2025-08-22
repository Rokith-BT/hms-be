import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PhrConsultationProcessService } from './phr-consultation-process.service';
import { PhrConsultationProcess } from './entities/phr-consultation-process.entity';

@Controller('phr-consultation-process')
export class PhrConsultationProcessController {
  constructor(private readonly phrConsultationProcessService: PhrConsultationProcessService) { }

  @Get()
  async findAll(@Query('hospital_id') hospital_id: number) {
    return this.phrConsultationProcessService.findAllColorCode(hospital_id);
  }

  @Get('process')
  async findAllprocess(@Query('appointment_id') appointment_id: number) {
    return this.phrConsultationProcessService.findAllProcessList(appointment_id);
  }

  @Get('tracking')
  async findAllprocesstrack(@Query('appointment_id') appointment_id: string) {
    return this.phrConsultationProcessService.findAllProcessTrackList(appointment_id);
  }

  @Get('process_history')
  async findAllprocesstrackhistory(@Query('appointment_id') appointment_id: number) {
    return this.phrConsultationProcessService.ProcessTrackHistory(appointment_id);
  }

  @Get('stats')
  async getConsultationProcessStats(@Query('appointment_id') appointment_id: string) {
    return this.phrConsultationProcessService.gettrackstats(appointment_id);
  }

  @Post()
  async waitingPost(
    @Body() updateConsultation: PhrConsultationProcess,
  ): Promise<any> {
    return this.phrConsultationProcessService.createWaiting(updateConsultation);
  }

  @Post('/check')
  async check(
    @Body() updateConsultation: PhrConsultationProcess,
  ): Promise<any> {
    return this.phrConsultationProcessService.checkbooked(updateConsultation);
  }


}
