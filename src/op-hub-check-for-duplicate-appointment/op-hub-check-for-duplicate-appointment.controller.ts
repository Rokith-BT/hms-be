import { Controller, Post, Body } from '@nestjs/common';
import { OpHubCheckForDuplicateAppointmentService } from './op-hub-check-for-duplicate-appointment.service';
import { CheckForDuplicateAppointment } from './entities/op-hub-check-for-duplicate-appointment.entity';

@Controller('op-hub-check-for-duplicate-appointment')
export class OpHubCheckForDuplicateAppointmentController {
  constructor(private readonly checkForDuplicateAppointmentService: OpHubCheckForDuplicateAppointmentService) { }
  @Post()
  create(@Body() createCheckForDuplicateAppointmentDto: CheckForDuplicateAppointment) {
    return this.checkForDuplicateAppointmentService.create(createCheckForDuplicateAppointmentDto);
  }
}
