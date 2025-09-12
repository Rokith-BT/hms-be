import { Module } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { CryptoService } from 'src/qr-encrpyt/qr-encrpyt.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital])],

  controllers: [HospitalsController],
  providers: [HospitalsService, DynamicDatabaseService, CryptoService],
})
export class HospitalsModule {}
