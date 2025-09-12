import { Module } from '@nestjs/common';
import { InternalOpdTreatmentHistoryService } from './internal-opd-treatment-history.service';
import { InternalOpdTreatmentHistoryController } from './internal-opd-treatment-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdTreatmentHistory } from './entities/internal-opd-treatment-history.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdTreatmentHistory])],

  controllers: [InternalOpdTreatmentHistoryController],
  providers: [InternalOpdTreatmentHistoryService, DynamicDatabaseService],
})
export class InternalOpdTreatmentHistoryModule { }
