import { Module } from '@nestjs/common';
import { OpHubOverallHeaderSerachService } from './op-hub-overall-header-serach.service';
import { OpHubOverallHeaderSerachController } from './op-hub-overall-header-serach.controller';

@Module({
  controllers: [OpHubOverallHeaderSerachController],
  providers: [OpHubOverallHeaderSerachService],
})
export class OpHubOverallHeaderSerachModule {}
