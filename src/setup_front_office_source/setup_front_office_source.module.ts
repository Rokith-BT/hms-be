import { Module } from '@nestjs/common';
import { SetupFrontOfficeSourceService } from './setup_front_office_source.service';
import { SetupFrontOfficeSourceController } from './setup_front_office_source.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupFrontOfficeSource } from './entities/setup_front_office_source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupFrontOfficeSource])],

  controllers: [SetupFrontOfficeSourceController],
  providers: [SetupFrontOfficeSourceService],
})
export class SetupFrontOfficeSourceModule {}
