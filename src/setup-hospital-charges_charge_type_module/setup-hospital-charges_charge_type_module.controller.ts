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
import { SetupHospitalChargesChargeTypeModuleService } from './setup-hospital-charges_charge_type_module.service';
import { SetupHospitalChargesChargeTypeModule } from './entities/setup-hospital-charges_charge_type_module.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-hospital-charges-charge-type-module')
export class SetupHospitalChargesChargeTypeModuleController {
  constructor(
    private readonly setupHospitalChargesChargeTypeModuleService: SetupHospitalChargesChargeTypeModuleService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() charge_type_moduleEntity: SetupHospitalChargesChargeTypeModule,
  ) {
    return this.setupHospitalChargesChargeTypeModuleService.create(
      charge_type_moduleEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/module')
  findAll() {
    return this.setupHospitalChargesChargeTypeModuleService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHospitalChargesChargeTypeModuleService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() charge_type_moduleEntity: SetupHospitalChargesChargeTypeModule,
  // ) {
  //   return this.setupHospitalChargesChargeTypeModuleService.update(
  //     id,
  //     charge_type_moduleEntity,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.setupHospitalChargesChargeTypeModuleService.remove(id);
  // }
}
