import { Module } from '@nestjs/common';
import { OpHubEmrService } from './op-hub-emr.service';
import { OpHubEmrController } from './op-hub-emr.controller';

@Module({
  controllers: [OpHubEmrController],
  providers: [OpHubEmrService],
})
export class OpHubEmrModule {}
