import { Controller, Post, Body } from '@nestjs/common';
import { OpHubDoctorSlotShiftServiceService } from './op-hub-doctor-slot-shift-service.service';
import { ApiProperty, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DoctorSlotShift } from './entities/op-hub-doctor-slot-shift-service.entity';

export class SlotTimingResponse {
  @ApiProperty({ description: 'Unique identifier for the shift', example: 387 })
  shiftId: number;

  @ApiProperty({ description: 'Timing of the slot', example: '10:19:00 - 10:47:00' })
  slot_timing: string;

  @ApiProperty({ description: 'Day of the week for the shift', example: 'Monday' })
  day: string;

  @ApiProperty({ description: 'Name of the shift', example: 'Morning' })
  shiftName: string;

  @ApiProperty({ description: 'Global identifier for the shift', example: 107 })
  global_shift_id: number;
}

@Controller('op-hub-doctor-slot-shift-service')
export class OpHubDoctorSlotShiftServiceController {
  constructor(private readonly doctorSlotShiftService: OpHubDoctorSlotShiftServiceService) { }

  @Post('/slot')
  @ApiOperation({ summary: 'Get available slot timings for a doctor shift' })
  @ApiResponse({
    status: 200,
    description: 'Available slot timings retrieved successfully.',
    type: [SlotTimingResponse],
  })
  async getSlot(@Body() entity: DoctorSlotShift) {
    return this.doctorSlotShiftService.getSlot(entity);
  }
}
