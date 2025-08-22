import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OpHubVitalsVibrasenseService } from './op-hub-vitals-vibrasense.service';
import { VitalsVibrasense } from './entities/op-hub-vitals-vibrasense.entity';

@Controller('op-hub-vitals-vibrasense')
export class OpHubVitalsVibrasenseController {
  constructor(private readonly vitalsVibrasenseService: OpHubVitalsVibrasenseService) {}

  @Post()
  create(@Body() createVitalsVibrasenseDto: VitalsVibrasense) {
    return this.vitalsVibrasenseService.create(createVitalsVibrasenseDto);
  }

  @Get()
  findAll(@Query('opd_id')opd_id:any,@Query('hospital_id')hospital_id:any) {
    return this.vitalsVibrasenseService.findAll(opd_id,hospital_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vitalsVibrasenseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVitalsVibrasenseDto: VitalsVibrasense) {
    return this.vitalsVibrasenseService.update(+id, updateVitalsVibrasenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vitalsVibrasenseService.remove(+id);
  }
}
