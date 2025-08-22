import { Module } from '@nestjs/common';
import { InternalOpdChargesService } from './internal-opd-charges.service';
import { InternalOpdChargesController } from './internal-opd-charges.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalOpdCharge } from './entities/internal-opd-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalOpdCharge])],

  controllers: [InternalOpdChargesController],
  providers: [InternalOpdChargesService, DynamicDatabaseService],
})
export class InternalOpdChargesModule { }
