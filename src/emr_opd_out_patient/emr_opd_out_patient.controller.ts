import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { EmrOpdOutPatientService } from './emr_opd_out_patient.service';
import { EmrOpdOutPatient } from './entities/emr_opd_out_patient.entity';

@Controller('emr-opd-out-patient')
export class EmrOpdOutPatientController {
  constructor(private readonly emrOpdOutPatientService: EmrOpdOutPatientService) {}

  @Post()
  create(@Body() Entity_opd: EmrOpdOutPatient) {
    return this.emrOpdOutPatientService.create(Entity_opd);
  }

  @Get('/date')
  findAll(@Query('date') date: string) {
    const appointmentDate = new Date(date);
console.log("controller");

    return this.emrOpdOutPatientService.findAll(appointmentDate);
  }

  @Get()
  find() {
    
    return this.emrOpdOutPatientService.find();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log("qqqqqqqqqqqqqqqq");

    return this.emrOpdOutPatientService.findone(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() Entity_opd: EmrOpdOutPatient) {
    return this.emrOpdOutPatientService.update(+id, Entity_opd);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.emrOpdOutPatientService.remove(+id);
  // }


  @Put('/opdstatus')
  updates( @Body()  Entity_opd: EmrOpdOutPatient) {
    console.log("controller");
    
    return this.emrOpdOutPatientService.opd_status_update(Entity_opd)
  }

  @Get('/opdCounts/get')
  findopdcountwithpercentage(@Query('date') date:any) {
    console.log("controller opd count",date);

    return this.emrOpdOutPatientService.opd_findCountWithPercentage(date);
    
  }
}
