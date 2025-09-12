import { Module } from '@nestjs/common';
import { DonorDetailsService } from './donor_details.service';
import { DonorDetailsController } from './donor_details.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [DonorDetailsController],
  providers: [DonorDetailsService,DynamicDatabaseService],
})
export class DonorDetailsModule {}
