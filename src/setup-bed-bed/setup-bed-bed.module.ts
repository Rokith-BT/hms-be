import { Module } from '@nestjs/common';
import { SetupBedBedService } from './setup-bed-bed.service';
import { SetupBedBedController } from './setup-bed-bed.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupBedBed } from './entities/setup-bed-bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupBedBed])],

  controllers: [SetupBedBedController],
  providers: [SetupBedBedService, DynamicDatabaseService],
})
export class SetupBedBedModule {}
