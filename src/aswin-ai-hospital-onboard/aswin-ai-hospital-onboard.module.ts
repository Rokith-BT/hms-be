import { Module } from '@nestjs/common';
import { AswinAiHospitalOnboardService } from './aswin-ai-hospital-onboard.service';
import { AswinAiHospitalOnboardController } from './aswin-ai-hospital-onboard.controller';

@Module({
  controllers: [AswinAiHospitalOnboardController],
  providers: [AswinAiHospitalOnboardService],
})
export class AswinAiHospitalOnboardModule {}
