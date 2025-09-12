import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { OpHubOpdPrescriptionService } from './op-hub-opd-prescription.service';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateOpdPrescriptionDto } from './dto/create-opd-prescription.dto';
import { UpdateOpdPrescriptionDto } from './dto/update-opd-prescription.dto';
import { PrescriptionFetchResponseDto } from './entities/op-hub-opd-prescription.entity';

@Controller('op-hub-opd-prescription')
export class OpHubOpdPrescriptionController {
  constructor(private readonly opdPrescriptionService: OpHubOpdPrescriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new OPD prescription' })
  @ApiResponse({ status: 201, description: 'The prescription has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createOpdPrescriptionDto: CreateOpdPrescriptionDto | CreateOpdPrescriptionDto[]) {
    return this.opdPrescriptionService.create(createOpdPrescriptionDto);
  }
  @Get()
  @ApiQuery({ name: 'opd_id', required: true, type: Number, description: 'opd_id of the appointment' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Retrieve all OPD prescriptions' }) 
  @ApiResponse({ status: 200, description: 'List of prescriptions', isArray: true ,type : PrescriptionFetchResponseDto}) 
  findAll(@Query('opd_id') opd_id: any,@Query('hospital_id') hospital_id: any) {
    return this.opdPrescriptionService.findAll(opd_id,hospital_id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing OPD prescription' }) 
  @ApiResponse({ status: 200, description: 'The prescription has been successfully updated.' }) 
  @ApiResponse({ status: 404, description: 'Prescription not found' }) 
  update( @Body() updateOpdPrescriptionDto: UpdateOpdPrescriptionDto) {
    return this.opdPrescriptionService.update( updateOpdPrescriptionDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete an OPD prescription' }) 
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the past treatment history' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })  @ApiResponse({ status: 200, description: 'The prescription has been successfully deleted.' }) 
  @ApiResponse({ status: 404, description: 'Prescription not found' }) 
  remove(@Query('id') id: any,@Query('hospital_id') hospital_id: any) {
    return this.opdPrescriptionService.remove(+id,hospital_id);
  }
}
