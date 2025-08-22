import { Controller, Get, Query } from '@nestjs/common';
import { OpHubPreviewDocService } from './op-hub-preview-doc.service';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@Controller('op-hub-preview-doc')
export class OpHubPreviewDocController {
  constructor(private readonly previewDocService: OpHubPreviewDocService) { }

  @Get()
  @ApiOperation({ summary: 'Retrieve preview documents' })
  @ApiResponse({ status: 200, description: 'Preview documents fetched successfully.' })
  @ApiResponse({ status: 404, description: 'No preview documents found.' })
  @ApiQuery({ name: 'opd_id', required: true, type: String, description: 'OPD ID associated with the preview document' })
  @ApiQuery({ name: 'hospital_id', required: true, type: String, description: 'Hospital ID associated with the preview document' })
  findAll(
    @Query('opd_id') opd_id: string,
    @Query('hospital_id') hospital_id: string,
  ) {

    return this.previewDocService.findAll(opd_id, hospital_id);
  }
}
