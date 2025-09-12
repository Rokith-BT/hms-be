import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmrHumanResourceAddStaffService } from './emr_human_resource_add_staff.service';
import { EmrHumanResourceAddStaff } from './entities/emr_human_resource_add_staff.entity';

@Controller('emr-human-resource-add-staff')
export class EmrHumanResourceAddStaffController {
  constructor(private readonly emrHumanResourceAddStaffService: EmrHumanResourceAddStaffService) {}

  @Post()
  create(@Body() EmrHumanResourceAddStaffEntity:EmrHumanResourceAddStaff) {
    console.log("controller");
    
    return this.emrHumanResourceAddStaffService.create(EmrHumanResourceAddStaffEntity);
  }

  // @Get()
  // findAll() {
  //   return this.emrHumanResourceAddStaffService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.emrHumanResourceAddStaffService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEmrHumanResourceAddStaffDto: UpdateEmrHumanResourceAddStaffDto) {
  //   return this.emrHumanResourceAddStaffService.update(+id, updateEmrHumanResourceAddStaffDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.emrHumanResourceAddStaffService.remove(+id);
  // }


   @Get('active_Status')
  findAll(@Query('active_Status') active_Status:string) {
    return this.emrHumanResourceAddStaffService.find_active_or_inactive_staff(active_Status);
  }

  @Get('/staffCounts/get')
  findstaffcount(@Query('date') date:any) {
    console.log("controller staff count",date);

    return this.emrHumanResourceAddStaffService.find_total_count(date);
    
  }

  @Get('/present_staff_counts/get')
  find_present_staff_count(@Query('date') date:any) {
    console.log("controller present staff count");
    return this.emrHumanResourceAddStaffService.find_present_staff(date);
  }

  @Get(`/absend_staff_counts/get`)
  find_absend_staff_count(@Query('date') date:any) {
    console.log("controller absent staff count");
    return this.emrHumanResourceAddStaffService.find_absent_staff(date);
    
  }
}
