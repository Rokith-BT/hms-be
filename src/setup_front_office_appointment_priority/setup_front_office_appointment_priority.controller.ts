import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SetupFrontOfficeAppointmentPriorityService } from './setup_front_office_appointment_priority.service';
import { SetupFrontOfficeAppointmentPriority } from './entities/setup_front_office_appointment_priority.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-front-office-appointment-priority')
export class SetupFrontOfficeAppointmentPriorityController {
  constructor(
    private readonly setupFrontOfficeAppointmentPriorityService: SetupFrontOfficeAppointmentPriorityService,
  ) {}

      @UseGuards(AuthGuard) 
  @Post()
  create(
    @Body() appointment_priorityEntity: SetupFrontOfficeAppointmentPriority,
  ) {
    return this.setupFrontOfficeAppointmentPriorityService.create(
      appointment_priorityEntity,
    );
  }

      @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupFrontOfficeAppointmentPriorityService.findAll();
  }

      @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFrontOfficeAppointmentPriorityService.findOne(+id);
  }

      @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() appointment_priority: SetupFrontOfficeAppointmentPriority,
  ) {
    return this.setupFrontOfficeAppointmentPriorityService.update(
      +id,
      appointment_priority,
    );
  }

      @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setupFrontOfficeAppointmentPriorityService.remove(id);
  }

      @UseGuards(AuthGuard)
  @Get('/SetupFrontofficeAppointPriority/:search')
  setupFrontofficeAppointPriority(@Param('search') search: string) {
    return this.setupFrontOfficeAppointmentPriorityService.setupFrontofficeAppointPriority(
      search,
    );
  }
}
