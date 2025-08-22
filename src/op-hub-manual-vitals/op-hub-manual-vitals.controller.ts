import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { OpHubManualVitalsService } from './op-hub-manual-vitals.service';
import { ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateManualVitalDto } from './dto/create-manual_vital.dto';
import { getManualVital } from './entities/op-hub-manual-vital.entity';

@Controller('op-hub-manual-vitals')
export class OpHubManualVitalsController {
  constructor(private readonly manualVitalsService: OpHubManualVitalsService) { }

  @Post()
  @ApiOperation({ summary: 'Create manual vitals entry' })
  @ApiResponse({ status: 201, description: 'Manual vitals entry created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error.' })
  @ApiQuery({ name: 'opd_id', required: true, type: String, description: 'OPD ID associated with the vitals' })
  @ApiQuery({ name: 'hospital_id', required: true, type: String, description: 'Hospital ID associated with the vitals' })
  @ApiBody({ type: CreateManualVitalDto, description: 'Vitals data' })
  create(
    @Body() createManualVitalDto: CreateManualVitalDto,
    @Query('opd_id') opd_id: string,
    @Query('hospital_id') hospital_id: string,
  ) {
    return this.manualVitalsService.create(createManualVitalDto, opd_id, hospital_id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all manual vitals entries' })
  @ApiQuery({ name: 'opd_id', required: true, type: String, description: 'OPD ID associated with the vitals' })
  @ApiQuery({ name: 'hospital_id', required: true, type: String, description: 'Hospital ID associated with the vitals' })
  @ApiResponse({ status: 200, description: 'List of manual vitals entries fetched successfully.', type: getManualVital })
  @ApiResponse({ status: 404, description: 'No manual vitals entries found.' })
  findAll(@Query('opd_id') opd_id: string,
    @Query('hospital_id') hospital_id: string,) {
    return this.manualVitalsService.findAll(opd_id, hospital_id);
  }
}
