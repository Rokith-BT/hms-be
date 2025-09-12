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
import { MedicineCategoryService } from './setup_pharmacy_medicine_category.service';
import { SetupPharmacyMedicineCategory } from './entities/setup_pharmacy_medicine_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup_pharmacy_medicine_category')
export class MedicineCategoryController {
  constructor(
    private readonly medicineCategoryService: MedicineCategoryService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() medicine_categoryEntity: SetupPharmacyMedicineCategory) {
    return this.medicineCategoryService.create(medicine_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.medicineCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicineCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() medicine_categoryEntity: SetupPharmacyMedicineCategory,
  ) {
    return this.medicineCategoryService.update(id, medicine_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.medicineCategoryService.remove(
      id,
      Hospital_id,
    );

  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupPharmacyMedicineCategory/:search')
  setupPharmacyMedicineCategory(@Param('search') search: string) {
    return this.medicineCategoryService.setupPharmacyMedicineCategory(search);
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getAllmedicine_category')
  async getallmedicine_category(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.medicineCategoryService.findmedicine_category(
        limit || 10,
        page || 1
      )

      if (final_output.details.length > 0) {
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
  }
}
