import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalOpdTimelineService } from './internal-opd-timeline.service';
import { InternalOpdTimeline } from './entities/internal-opd-timeline.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-timeline')
export class InternalOpdTimelineController {
  constructor(private readonly internalOpdTimelineService: InternalOpdTimelineService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() opd_timeline: InternalOpdTimeline) {
    return this.internalOpdTimelineService.create(opd_timeline);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('patient_id') patient_id: number) {
    return this.internalOpdTimelineService.findAll(patient_id);
  }

  @UseGuards(AuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body() opd_timeline: InternalOpdTimeline) {
    return this.internalOpdTimelineService.update(id, opd_timeline);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hosId') hosId: number) {

    return this.internalOpdTimelineService.remove(id, hosId);
  }
}
