import { Controller, Get, Param, Put, Body, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { PrintSettingService } from './print_setting.service';
import { PrintSetting } from './entities/print_setting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('print-settings')
export class PrintSettingController {
  constructor(private readonly printSettingService: PrintSettingService) { }
  @UseGuards(AuthGuard)
  @Get(':id')
  async getPrintSettingById(@Param('id') id: number) {
    const setting = await this.printSettingService.getPrintSettingById(id);
    if (!setting) {
      return { status: 'failed', message: `Print setting with id ${id} not found` };
    }
    return { status: 'success', data: setting };
  }
  @UseGuards(AuthGuard)
  @Post()
  async updateSettingFor(@Body() settings: PrintSetting) {
    return this.printSettingService.updateSettingFor(settings);
  }


}
