import { Module } from '@nestjs/common';
import { StaffIdCardService } from './staff_id_card.service';
import { StaffIdCardController } from './staff_id_card.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [StaffIdCardController],
  providers: [StaffIdCardService,DynamicDatabaseService],
})
export class StaffIdCardModule {}
