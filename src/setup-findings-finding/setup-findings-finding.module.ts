import { Module } from '@nestjs/common';
import { SetupFindingsFindingService } from './setup-findings-finding.service';
import { SetupFindingsFindingController } from './setup-findings-finding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupFindingsFinding } from './entities/setup-findings-finding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupFindingsFinding])],

  controllers: [SetupFindingsFindingController],
  providers: [SetupFindingsFindingService],
})
export class SetupFindingsFindingModule { }
