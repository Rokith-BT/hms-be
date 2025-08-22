import { Module } from '@nestjs/common';
import { ReferralPersonCommissionService } from './referral_person_commission.service';
import { ReferralPersonCommissionController } from './referral_person_commission.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [ReferralPersonCommissionController],
  providers: [ReferralPersonCommissionService,DynamicDatabaseService],
})
export class ReferralPersonCommissionModule {}
