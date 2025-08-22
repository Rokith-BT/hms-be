import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmrInternalApiService } from './emr_internal-api.service';

@Controller('emr-internal-api')
export class EmrInternalApiController {
  constructor(private readonly emrInternalApiService: EmrInternalApiService) {}

 
// get appointment priority

  @Get()
  findpriority() {
    return this.emrInternalApiService.findpriority();
  }

//get appointment status

  @Get('/status')
  findstatus() {
    return this.emrInternalApiService.findstatus();
  }

  //get country code

  @Get('/country_code')
  findcountry_code (){
    return this.emrInternalApiService.findcountry_code();
  }

   //get Insurance provider

   @Get('/Insurance_provider')
   findInsurance_provider () {
    return this.emrInternalApiService.find_Insurance_provider();
   }
  }
