import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { OpHubClinicalNotesWithAbhaService } from './op-hub-clinical-notes-with-abha.service';
import { ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClinicalNotesWithAbha, postResp, ClinicalNotesResponseDto, UpdateClinicalNotesWithAbha, updateResp } from './entities/op-hub-clinical-notes-with-abha.entity';
@Controller('op-hub-clinical-notes-with-abha')
export class OpHubClinicalNotesWithAbhaController {
  constructor(private readonly clinicalNotesWithAbhaService: OpHubClinicalNotesWithAbhaService) { }

  @Post()
  @ApiOperation({ summary: 'Create clinical notes with ABHA' })
  @ApiBody({ type: ClinicalNotesWithAbha })
  @ApiResponse({ status: 201, description: 'The clinical note has been successfully created.', type: postResp })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createClinicalNotesWithAbhaDto: ClinicalNotesWithAbha) {
    return this.clinicalNotesWithAbhaService.create(createClinicalNotesWithAbhaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all clinical notes' })
  @ApiQuery({ name: 'opd_id', required: true, type: Number, description: 'opd_id of the appointment' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all clinical notes.', type: ClinicalNotesResponseDto })
  @ApiResponse({ status: 404, description: 'No clinical notes found.' })
  findAll(@Query('opd_id') opd_id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.findAll(opd_id, hospital_id);
  }



  @Patch()
  @ApiOperation({ summary: 'Update a specific clinical note' })
  @ApiBody({ type: UpdateClinicalNotesWithAbha })
  @ApiResponse({ status: 200, description: 'Successfully updated the clinical note.', type: updateResp })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  update(@Body() summ: UpdateClinicalNotesWithAbha) {
    return this.clinicalNotesWithAbhaService.update(summ);
  }

  @Delete('/chief-complaint-basic')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the chief complaint basic' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delCompBasic(+id, hospital_id);
  }
  @Delete('/chief-complaint-detail')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the chief complaint detail' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove1(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delCompDetail(+id, hospital_id);
  }
  @Delete('/past-treatment-history')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the past treatment history' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove3(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delTreatHis(+id, hospital_id);
  }
  @Delete('/past-treatment-history-documents')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the past treatment history documents' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove4(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delTreatHisDocs(+id, hospital_id);
  }
  @Delete('/treatment-advice')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the teeatment advice' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove5(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delTreatmentAdvice(+id, hospital_id);
  }
  @Delete('/diagnosis-report')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the diagnosis report' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove6(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delDiagReport(+id, hospital_id);
  }
  @Delete('/diet-plan')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the diet plan' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove7(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delDietPlan(+id, hospital_id);
  }
  @Delete('/follow-up')
  @ApiQuery({ name: 'id', required: true, type: Number, description: 'id of the follow up' })
  @ApiQuery({ name: 'hospital_id', required: true, type: Number, description: 'ID of the hospital' })
  @ApiOperation({ summary: 'Delete a specific clinical note' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the clinical note.' })
  @ApiResponse({ status: 404, description: 'Clinical note not found.' })
  remove8(@Query('id') id: any, @Query('hospital_id') hospital_id: any) {
    return this.clinicalNotesWithAbhaService.delCompBasic(+id, hospital_id);
  }
}
