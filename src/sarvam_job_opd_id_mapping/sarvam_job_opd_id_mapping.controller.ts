import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SarvamJobOpdIdMappingService } from './sarvam_job_opd_id_mapping.service';
import { CreateSarvamJobOpdIdMappingDto } from './dto/create-sarvam_job_opd_id_mapping.dto';
import { UpdateSarvamJobOpdIdMappingDto } from './dto/update-sarvam_job_opd_id_mapping.dto';

@Controller('sarvam-job-opd-id-mapping')
export class SarvamJobOpdIdMappingController {
  constructor(private readonly sarvamJobOpdIdMappingService: SarvamJobOpdIdMappingService) {}

  @Post()
  create(@Body() createSarvamJobOpdIdMappingDto: CreateSarvamJobOpdIdMappingDto) {
    return this.sarvamJobOpdIdMappingService.create(createSarvamJobOpdIdMappingDto);
  }

  @Get()
  findAll(@Query(`opd_id`) opd_id: number) {
    return this.sarvamJobOpdIdMappingService.findAll(opd_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sarvamJobOpdIdMappingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSarvamJobOpdIdMappingDto: UpdateSarvamJobOpdIdMappingDto) {
    return this.sarvamJobOpdIdMappingService.update(+id, updateSarvamJobOpdIdMappingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sarvamJobOpdIdMappingService.remove(+id);
  }
}
