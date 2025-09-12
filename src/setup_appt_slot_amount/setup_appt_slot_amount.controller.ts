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
import { SetupApptSlotAmountService } from './setup_appt_slot_amount.service';
import { SetupApptSlotAmount } from './entities/setup_appt_slot_amount.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup_appt_slot_amount')
export class SetupApptSlotAmountController {
  constructor(
    private readonly setupApptSlotAmountService: SetupApptSlotAmountService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() slotEntity: SetupApptSlotAmount) {
    return this.setupApptSlotAmountService.create(slotEntity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('staff_id') staff_id: number) {
    return this.setupApptSlotAmountService.findforDocAndGlobalShift(staff_id);
  }

    @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() slotEntity: SetupApptSlotAmount) {
    return this.setupApptSlotAmountService.update(+id, slotEntity);
  }

    @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setupApptSlotAmountService.remove(+id);
  }
}
