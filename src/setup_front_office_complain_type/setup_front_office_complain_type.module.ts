import { Module } from '@nestjs/common';
import { SetupFrontOfficeComplainTypeService } from './setup_front_office_complain_type.service';
import { SetupFrontOfficeComplainTypeController } from './setup_front_office_complain_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupFrontOfficeComplainType } from './entities/setup_front_office_complain_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupFrontOfficeComplainType])],

  controllers: [SetupFrontOfficeComplainTypeController],
  providers: [SetupFrontOfficeComplainTypeService],
})
export class SetupFrontOfficeComplainTypeModule {}
