import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IpdDoctorsService } from './ipd_doctors.service';
import { IpdDoctor } from './entities/ipd_doctor.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('ipd-doctors')
export class IpdDoctorsController {
  constructor(private readonly ipdDoctorsService: IpdDoctorsService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createIpdDoctor: IpdDoctor) {
    return this.ipdDoctorsService.create(createIpdDoctor);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeipdDoctors(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.ipdDoctorsService.removeipdDoctors(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
}
