import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PhoneCallLogService } from './phone_call_log.service';
import { PhoneCallLog } from './entities/phone_call_log.entity';


@Controller('phone-call-log')
export class PhoneCallLogController {
  constructor(private readonly phoneCallLogService: PhoneCallLogService) {}

  @Post()
  create(@Body() createPhoneCallLog: PhoneCallLog) {
    return this.phoneCallLogService.create(createPhoneCallLog);
  }


  @Patch(':id')
  update(@Param('id') id:number, @Body() createPhoneCallLog: PhoneCallLog) {
    return this.phoneCallLogService.update(id, createPhoneCallLog);
  }



  @Delete('/removeFrontofficeCallLogs/:id')
  async removeFrontofficeCallLogs(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deleteFrontofficeCallLogs = await this.phoneCallLogService.removeFrontofficeCallLogs(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }



  // @Get()
  // findAll() {
  //   return this.phoneCallLogService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.phoneCallLogService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createPhoneCallLog: PhoneCallLog) {
  //   return this.phoneCallLogService.update(+id, createPhoneCallLog);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.phoneCallLogService.remove(+id);
  // }
}
