import { Module } from '@nestjs/common';
import { TpaManagementService } from './tpa_management.service';
import { TpaManagementController } from './tpa_management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TpaManagement } from './entities/tpa_management.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([TpaManagement])],

  controllers: [TpaManagementController],
  providers: [TpaManagementService,DynamicDatabaseService],
})
export class TpaManagementModule {}
