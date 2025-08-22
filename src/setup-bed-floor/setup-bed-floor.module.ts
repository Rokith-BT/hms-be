import { Module } from '@nestjs/common';
import { SetupBedFloorService } from './setup-bed-floor.service';
import { SetupBedFloorController } from './setup-bed-floor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SetupBedFloorService])],

  controllers: [SetupBedFloorController],
  providers: [SetupBedFloorService],
})
export class SetupBedFloorModule {}
