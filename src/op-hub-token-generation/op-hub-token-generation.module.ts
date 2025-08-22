import { Module } from '@nestjs/common';
import { OpHubTokenGenerationService } from './op-hub-token-generation.service';
import { OpHubTokenGenerationController } from './op-hub-token-generation.controller';

@Module({
  controllers: [OpHubTokenGenerationController],
  providers: [OpHubTokenGenerationService],
})
export class OpHubTokenGenerationModule {}
