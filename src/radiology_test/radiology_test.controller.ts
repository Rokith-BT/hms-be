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
import { RadiologyTestService } from './radiology_test.service';
import { RadiologyTest } from './entities/radiology_test.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('radiology-test')
export class RadiologyTestController {
  constructor(private readonly radiologyTestService: RadiologyTestService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRadiologyTest: RadiologyTest) {
    return this.radiologyTestService.create(createRadiologyTest);
  }
  @UseGuards(AuthGuard)
  @Post('/radiologyParameterDetails')
  createRadiologyParameterDetails(
    @Body() createRadiologyTest: RadiologyTest[],
  ) {
    return this.radiologyTestService.createRadiologyParameterDetails(
      createRadiologyTest,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateRadio(
    @Param('id') id: number,
    @Body() createRadiologyTest: RadiologyTest,
  ) {
    return this.radiologyTestService.updateRadio(id, createRadiologyTest);
  }
  @UseGuards(AuthGuard)
  @Patch('/editRadioParameter/details')
  updateRadiologyParameterDetails(
    @Body() createRadiologyTest: RadiologyTest[],
  ) {
    return this.radiologyTestService.updateRadiologyParameterDetails(
      createRadiologyTest,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeRadiology(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.radiologyTestService.removeRadiology(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/deleteRadilogyparameterdetails/:id')
  async removeRadiologyparameterdetails(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.radiologyTestService.removeRadiologyparameterdetails(
      id,
      hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
}
