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
import { SetupApptSlotTimimgsService } from './setup_appt_slot_timimgs.service';
import { SetupApptSlotTimimg } from './entities/setup_appt_slot_timimg.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-appt-slot-timimgs')
export class SetupApptSlotTimimgsController {
  constructor(
    private readonly setupApptSlotTimimgsService: SetupApptSlotTimimgsService,
  ) { }
  
  @UseGuards(AuthGuard)

  @Get()
  findAll(
    @Query('day') day: string,
    @Query('staff_id') staff_id: number,
    @Query('shift_id') shift_id: number,
  ) {
    return this.setupApptSlotTimimgsService.finforDocAndShift(
      day,
      staff_id,
      shift_id,
    );
  }

    @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() timingEntity: SetupApptSlotTimimg) {
    return this.setupApptSlotTimimgsService.update(+id, timingEntity);
  }

    @UseGuards(AuthGuard)
  @Post('updateandpost')
  async upsertTimingSlot(@Body() timingEntities: SetupApptSlotTimimg[]) {
    return this.setupApptSlotTimimgsService.updatepostTimingSlot(
      timingEntities,
    );
  }

    @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    return this.setupApptSlotTimimgsService.remove(
      id,
      Hospital_id,
    );

  }
}
