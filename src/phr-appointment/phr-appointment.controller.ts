import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { PhrAppointmentService } from './phr-appointment.service';
import { PhrAppointment } from './entities/phr-appointment.entity';

@Controller('phr-appointment')
export class PhrAppointmentController {
  constructor(private readonly phrAppointmentService: PhrAppointmentService) { }

  @Post()
  create(@Body() createPhrAppointmentDto: PhrAppointment) {
    return this.phrAppointmentService.create(createPhrAppointmentDto);
  }

  @Get()
  findAll() {
    return this.phrAppointmentService.findAll();
  }

  @Get('/getOne/:id')
  findOne(@Param('id') id: string) {
    return this.phrAppointmentService.findOne(+id);
  }
  @Get('/getQR/:id')
  findQr(@Param('id') id: string) {
    return this.phrAppointmentService.findOneQR(id);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() updatePhrAppointmentDto: PhrAppointment) {
    return this.phrAppointmentService.update(+id, updatePhrAppointmentDto);
  }

  @Patch('/cancelAppointment/:id')
  updateCancelApp(@Param('id') id: string, @Body() updatePhrAppointmentDto: PhrAppointment) {
    return this.phrAppointmentService.updateCancelApp(+id, updatePhrAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phrAppointmentService.remove(+id);
  }
}
