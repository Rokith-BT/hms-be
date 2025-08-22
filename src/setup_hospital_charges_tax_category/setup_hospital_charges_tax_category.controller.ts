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
import { tax_categoryservice } from './setup_hospital_charges_tax_category.service';
import { SetupHospitalChargesTaxCategory } from './entities/setup_hospital_charges_tax_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-hospital-charges-tax-category')
export class SetupHospitalChargesTaxCategoryController {
  constructor(
    private readonly setupHospitalChargesTaxCategoryService: tax_categoryservice,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() tax_categoryEntity: SetupHospitalChargesTaxCategory) {
    return this.setupHospitalChargesTaxCategoryService.create(
      tax_categoryEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHospitalChargesTaxCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHospitalChargesTaxCategoryService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() tax_categoryEntity: SetupHospitalChargesTaxCategory,
  ) {
    return this.setupHospitalChargesTaxCategoryService.update(
      +id,
      tax_categoryEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.setupHospitalChargesTaxCategoryService.remove(
      id,
      Hospital_id,
    );

  }
  @UseGuards(AuthGuard)
  @Get('/SetupHospitalChargesTaxCategory/:search')
  setupHosChargesTaxCategory(@Param('search') search: string) {
    return this.setupHospitalChargesTaxCategoryService.setupHosChargesTaxCategory(
      search,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getALLtaxcategory')
  async findalltaxcategory(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {
    try {

      let final_output = await this.setupHospitalChargesTaxCategoryService.find_tax_category(
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
  }
}
