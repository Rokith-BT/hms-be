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
import { SetupHospitalChargesChargeTypeMasterService } from './setup-hospital-charges_charge_type_master.service';
import { SetupHospitalChargesChargeTypeMaster } from './entities/setup-hospital-charges_charge_type_master.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-hospital-charges-charge-type-master')
export class SetupHospitalChargesChargeTypeMasterController {
  constructor(
    private readonly setupHospitalChargesChargeTypeMasterService: SetupHospitalChargesChargeTypeMasterService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() charge_type_masterEntity: SetupHospitalChargesChargeTypeMaster,
  ) {
    return this.setupHospitalChargesChargeTypeMasterService.create(
      charge_type_masterEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHospitalChargesChargeTypeMasterService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHospitalChargesChargeTypeMasterService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() charge_type_masterEntity: SetupHospitalChargesChargeTypeMaster,
  ) {
    return this.setupHospitalChargesChargeTypeMasterService.update(
      id,
      charge_type_masterEntity,
    );
  }


  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.setupHospitalChargesChargeTypeMasterService.remove(
      id,
      Hospital_id,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHospitalChargesChargeType/:search')
  HospitalChargesChargeType(@Param('search') search: string) {

    return this.setupHospitalChargesChargeTypeMasterService.HospitalChargesChargeType(
      search,
    );
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getAllcharge_type_master')
  async findallcharge_type_master(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {
    try {
      let final_output = await this.setupHospitalChargesChargeTypeMasterService.findALL_charge_type_master(
        limit || 10,
        page || 1,
        search || '',
      );

      if (final_output.details.length) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit)
        }
      }

    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
    return this.setupHospitalChargesChargeTypeMasterService.findALL_charge_type_master(limit, page, search);
  }
}
