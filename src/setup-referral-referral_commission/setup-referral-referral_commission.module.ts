import { Module } from '@nestjs/common';
import { SetupReferralReferralCommissionService } from './setup-referral-referral_commission.service';
import { SetupReferralReferralCommissionController } from './setup-referral-referral_commission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupReferralReferralCommission } from './entities/setup-referral-referral_commission.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupReferralReferralCommission])],

  controllers: [SetupReferralReferralCommissionController],
  providers: [SetupReferralReferralCommissionService,DynamicDatabaseService],
})
export class SetupReferralReferralCommissionModule {}
