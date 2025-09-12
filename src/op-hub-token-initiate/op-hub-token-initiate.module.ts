import { Module } from '@nestjs/common';
import { OpHubTokenInitiateService } from './op-hub-token-initiate.service';
import { OpHubTokenInitiateController } from './op-hub-token-initiate.controller';

@Module({
  controllers: [OpHubTokenInitiateController],
  providers: [OpHubTokenInitiateService],
})
export class OpHubTokenInitiateModule {}
