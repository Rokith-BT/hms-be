import { Module } from '@nestjs/common';
import { InternalIpdChargesService } from './internal-ipd-charges.service';
import { InternalIpdChargesController } from './internal-ipd-charges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalIpdCharge } from './entities/internal-ipd-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternalIpdCharge])],

  controllers: [InternalIpdChargesController],
  providers: [InternalIpdChargesService],
})
export class InternalIpdChargesModule {}
