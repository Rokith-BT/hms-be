import { Controller, Post, Body, Query } from '@nestjs/common';
import { OpHubCheckOldPatientService } from './op-hub-check-old-patient.service';
import { CheckOldPatient } from './entities/op-hub-check-old-patient.entity';
@Controller('op-hub-check-old-patient')
export class OpHubCheckOldPatientController {
  constructor(
    private readonly checkOldPatientService: OpHubCheckOldPatientService,
  ) {}

  @Post()
  findAll(@Body() Entity: CheckOldPatient) {
    console.log('erer');

    return this.checkOldPatientService.findAll(Entity);
  }

  @Post('/v2')
  findAllV2(
    @Body() Entity: CheckOldPatient,
    @Query('limit') limit: number,
    @Query('page') offset: number,
  ) {
    console.log('eeeeeeeeeeeeeeeeeee');

    return this.checkOldPatientService.findAllV2(
      Entity,
      limit || 10,
      offset || 1,
    );
  }

  @Post('/v3')
  findAllV3(
    @Body() Entity: CheckOldPatient,
    @Query('limit') limit: number,
    @Query('page') offset: number,
  ) {
    return this.checkOldPatientService.findAllV3(
      Entity,
      limit || 10,
      offset || 1,
    );
  }

  @Post('hos/v2')
  hosfindAllV2(
    @Body() Entity: CheckOldPatient,
    @Query('limit') limit: number,
    @Query('page') offset: number,
  ) {
    console.log('eeeeeeeeeeeeeeeeeee', Entity);

    return this.checkOldPatientService.hosfindAllV2(
      Entity,
      limit || 10,
      offset || 1,
    );
  }

  @Post('hos/v3')
  hosfindAllV3(
    @Body() Entity: CheckOldPatient,
    @Query('limit') limit: number,
    @Query('page') offset: number,
  ) {
    return this.checkOldPatientService.hosfindAllV3(
      Entity,
      limit || 10,
      offset || 1,
    );
  }
}
