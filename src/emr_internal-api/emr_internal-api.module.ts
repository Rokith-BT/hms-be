import { Module } from '@nestjs/common';
import { EmrInternalApiService } from './emr_internal-api.service';
import { EmrInternalApiController } from './emr_internal-api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrInternalApi } from './entities/emr_internal-api.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrInternalApi])],

  controllers: [EmrInternalApiController],
  providers: [EmrInternalApiService],
})
export class EmrInternalApiModule {}
