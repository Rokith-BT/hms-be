import { Module } from '@nestjs/common';
import { SetupReferralReferralCategoryService } from './setup-referral-referral_category.service';
import { SetupReferralReferralCategoryController } from './setup-referral-referral_category.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindingsCategory } from 'src/findings_category/entities/findings_category.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([FindingsCategory])],

  controllers: [SetupReferralReferralCategoryController],
  providers: [SetupReferralReferralCategoryService,DynamicDatabaseService],
})
export class SetupReferralReferralCategoryModule {}
