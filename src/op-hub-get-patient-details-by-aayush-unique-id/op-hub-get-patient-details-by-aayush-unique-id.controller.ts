import { Controller, Post, Body } from '@nestjs/common';
import { OpHubGetPatientDetailsByAayushUniqueIdService } from './op-hub-get-patient-details-by-aayush-unique-id.service';

@Controller('op-hub-get-patient-details-by-aayush-unique-id')
export class OpHubGetPatientDetailsByAayushUniqueIdController {
  constructor(private readonly getPatDetailsByAayushUniqueIdService: OpHubGetPatientDetailsByAayushUniqueIdService) { }

  @Post()
  findAll(@Body('aayush_unique_id') aayush_unique_id: string, @Body(`hospital_id`) hospital_id: number) {
    return this.getPatDetailsByAayushUniqueIdService.findAll(aayush_unique_id, hospital_id);
  }
  @Post('abhaAddress')
  findAlla(
    @Body('aayush_unique_id') aayush_unique_id: string,
    @Body(`hospital_id`) hospital_id: number,
    @Body('abhaAddress') abhaAddress: string) {
    return this.getPatDetailsByAayushUniqueIdService.findAllAbhaAddress(aayush_unique_id, hospital_id, abhaAddress);
  }


  @Post('check/abhaAddress')
  check(
    @Body(`hospital_id`) hospital_id: number,
    @Body('abhaAddress') abhaAddress: string) {
    return this.getPatDetailsByAayushUniqueIdService.checkAbhaAddress(abhaAddress, hospital_id);
  }
  @Post('check/abhaNumber/abhaAddress')
  checkNumberAndAddress(
    @Body(`hospital_id`) hospital_id: number,
    @Body(`abhaNumber`) abhaNumber: string,
    @Body('abhaAddress') abhaAddress: string) {
    return this.getPatDetailsByAayushUniqueIdService.checkAbhaNumberAndAddress(abhaAddress, abhaNumber, hospital_id);
  }
}
