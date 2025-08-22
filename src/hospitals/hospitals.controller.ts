import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { Hospital } from './entities/hospital.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }
  // @UseGuards(AuthGuard)
  @Get(`/QR/:id`)
  findoneQR(@Param('id') id: string) {
    return this.hospitalsService.findoneQR(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() HospitalEntity: Hospital) {
    return this.hospitalsService.update(id, HospitalEntity);
  }
  // @UseGuards(AuthGuard)
  @Get(`/encrypt-QR/:id`)
  findosdneQR(@Param('id') id: string) {
    return this.hospitalsService.EncryptedfindoneQR(+id);
  }
}
