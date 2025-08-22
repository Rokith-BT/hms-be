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
import { unit_typeService } from './setup_hospital_charges_unit_type.service';
import { SetupHospitalChargesUnitType } from './entities/setup_hospital_charges_unit_type.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-hospital-charges-unit-type')
export class unit_typecontroller {
  constructor(private readonly unit_typeService: unit_typeService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() unit_typeEntity: SetupHospitalChargesUnitType) {
    return this.unit_typeService.create(unit_typeEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findALL() {
    return this.unit_typeService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unit_typeService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() unit_typeEntity: SetupHospitalChargesUnitType,
  ) {
    return this.unit_typeService.update(id, unit_typeEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    const deleteunit_type = await this.unit_typeService.remove(id, Hospital_id);
    return deleteunit_type;
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHospitalChargesUnitType/:search')
  setupHosChargesUnitType(@Param('search') search: string) {
    return this.unit_typeService.setupHosChargesUnitType(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getALLunittype')
  async findallunittype(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {
    try {

      let final_output = await this.unit_typeService.findALLunit_type(
        limit || 10,
        page || 1,
        search || '',
      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,

        }
      }

    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
  }
}
