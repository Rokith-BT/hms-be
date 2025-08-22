import { Controller, Post, Body } from '@nestjs/common';
import { OpHubEmrService } from './op-hub-emr.service';
import { Emr } from './entities/op-hub-emr.entity';

@Controller('op-hub-emr')
export class OpHubEmrController {
  constructor(private readonly emrService: OpHubEmrService) { }
  @Post()
  create(@Body() Entity: Emr) {
    return this.emrService.create(Entity);
  }
}
