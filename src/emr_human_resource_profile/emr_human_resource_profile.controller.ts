import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmrHumanResourceProfileService } from './emr_human_resource_profile.service';

@Controller('emr-human-resource-profile')
export class EmrHumanResourceProfileController {
  constructor(private readonly emrHumanResourceProfileService: EmrHumanResourceProfileService) {}



  @Get(':id')
  findAll(@Param('id') id:string) {
    console.log("controller");
    return this.emrHumanResourceProfileService.findbyid(id);
  }

  @Get('staff/:id')
  findoneby_id(@Param('id') id:string) {
    return this.emrHumanResourceProfileService.findonebyId(id);
  }

  

}
