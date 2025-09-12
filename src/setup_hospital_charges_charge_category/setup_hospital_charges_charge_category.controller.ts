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
import { SetupHospitalChargesChargeCategoryService } from './setup_hospital_charges_charge_category.service';
import { SetupHospitalChargesChargeCategory } from './entities/setup_hospital_charges_charge_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-hospital-charges-charge-category')
export class SetupHospitalChargesChargeCategoryController {
  constructor(
    private readonly setupHospitalChargesChargeCategoryService: SetupHospitalChargesChargeCategoryService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() charge_categoryEntity: SetupHospitalChargesChargeCategory) {
    return this.setupHospitalChargesChargeCategoryService.create(
      charge_categoryEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHospitalChargesChargeCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHospitalChargesChargeCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() charge_categoryEntity: SetupHospitalChargesChargeCategory,
  ) {
    return this.setupHospitalChargesChargeCategoryService.update(
      id,
      charge_categoryEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupHospitalChargesChargeCategoryService.remove(
      id,
      Hospital_id,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHospitalChargesChargeCategory/:search')
  HospitalChargesChargeCategory(@Param('search') search: string) {

    return this.setupHospitalChargesChargeCategoryService.HospitalChargesChargeCategory(
      search,
    );
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getAllcharge_category')
  async findallcategory(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {

    try {

      let final_output = await this.setupHospitalChargesChargeCategoryService.find_charge_category(
        limit || 10,
        page || 1,
        search || ''
      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / limit)
        }
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No charge_category found',
          data: [],
          total: 0,
          limit: limit,
          page: page,
        };
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
