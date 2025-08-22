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
import { SetupHospitalChargeChargesService } from './setup-hospital_charge-charges.service';
import { SetupHospitalChargeCharge } from './entities/setup-hospital_charge-charge.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('setup-hospital-charge-charges')
export class SetupHospitalChargeChargesController {
  constructor(
    private readonly setupHospitalChargeChargesService: SetupHospitalChargeChargesService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() chargesEntity: SetupHospitalChargeCharge) {

    return this.setupHospitalChargeChargesService.create(chargesEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHospitalChargeChargesService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHospitalChargeChargesService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() chargesEntity: SetupHospitalChargeCharge,
  ) {
    return this.setupHospitalChargeChargesService.update(id, chargesEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.setupHospitalChargeChargesService.remove(
      id,
      Hospital_id,
    );

  }
  @UseGuards(AuthGuard)
  @Get('/SetupHospitalChargesCharge/:search')
  HospitalChargesCharge(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupHospitalChargeChargesService.HospitalChargesCharge(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllcharges')
  async findallcharges(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {
    try {
      let final_output = await this.setupHospitalChargeChargesService.find_charges(
        limit || 10,
        page || 1,
        search || ''
      );
      console.log("controller");

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit),
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

    // return this.setupHospitalChargeChargesService.find_csaharges(limit,page);
  }
}
