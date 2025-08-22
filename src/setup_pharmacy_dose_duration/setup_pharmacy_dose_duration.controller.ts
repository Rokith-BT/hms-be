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
import { SetupPharmacyDoseDurationService } from './setup_pharmacy_dose_duration.service';
import { SetupPharmacyDoseDuration } from './entities/setup_pharmacy_dose_duration.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-pharmacy-dose-duration')
export class SetupPharmacyDoseDurationController {
  constructor(
    private readonly setupPharmacyDoseDurationService: SetupPharmacyDoseDurationService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dosedurationEntity: SetupPharmacyDoseDuration) {
    return this.setupPharmacyDoseDurationService.create(dosedurationEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPharmacyDoseDurationService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupPharmacyDoseDurationService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dosedurationEntity: SetupPharmacyDoseDuration,
  ) {
    return this.setupPharmacyDoseDurationService.update(id, dosedurationEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.setupPharmacyDoseDurationService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupPharmacyDoseDuration/:search')
  setupPharmacyDoseDuration(@Param('search') search: string) {
    return this.setupPharmacyDoseDurationService.setupPharmacyDoseDuration(
      search,
    );
  }


  @UseGuards(AuthGuard)
  @Get('/v2/getAlldose_duration')
  async findalldose_duration(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.setupPharmacyDoseDurationService.findALLdose_duration(
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
