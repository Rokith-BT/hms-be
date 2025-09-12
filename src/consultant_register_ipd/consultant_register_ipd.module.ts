import { Module } from '@nestjs/common';
import { ConsultantRegisterIpdService } from './consultant_register_ipd.service';
import { ConsultantRegisterIpdController } from './consultant_register_ipd.controller';

@Module({
  controllers: [ConsultantRegisterIpdController],
  providers: [ConsultantRegisterIpdService],
})
export class ConsultantRegisterIpdModule {}
