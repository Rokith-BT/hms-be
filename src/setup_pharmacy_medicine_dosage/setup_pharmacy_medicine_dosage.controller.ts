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
import { SetupPharmacyMedicineDosageService } from './setup_pharmacy_medicine_dosage.service';
import { SetupPharmacyMedicineDosage } from './entities/setup_pharmacy_medicine_dosage.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-pharmacy-medicine-dosage')
export class SetupPharmacyMedicineDosageController {
  constructor(
    private readonly setupPharmacyMedicineDosageService: SetupPharmacyMedicineDosageService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() Medicine_dosageEntity: SetupPharmacyMedicineDosage) {
    return this.setupPharmacyMedicineDosageService.create(
      Medicine_dosageEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPharmacyMedicineDosageService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupPharmacyMedicineDosageService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() Medicine_dosageEntity: SetupPharmacyMedicineDosage,
  ) {
    return this.setupPharmacyMedicineDosageService.update(
      id,
      Medicine_dosageEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {

    return this.setupPharmacyMedicineDosageService.remove(id, Hospital_id);

  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupPharmacyMedicineDosage/:search')
  setupPharmacyMedicineDosage(@Param('search') search: string) {
    return this.setupPharmacyMedicineDosageService.setupPharmacyMedicineDosage(
      search,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllmedicine_dosage')
  async getallmedicine_dosage(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.setupPharmacyMedicineDosageService.findmedicine_dosage(
        limit || 10,
        page || 1
      );

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
