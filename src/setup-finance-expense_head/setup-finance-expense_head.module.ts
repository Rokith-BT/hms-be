import { Module } from '@nestjs/common';
import { SetupFinanceExpenseHeadService } from './setup-finance-expense_head.service';
import { SetupFinanceExpenseHeadController } from './setup-finance-expense_head.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupFinanceExpenseHead } from './entities/setup-finance-expense_head.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupFinanceExpenseHead])],

  controllers: [SetupFinanceExpenseHeadController],
  providers: [SetupFinanceExpenseHeadService],
})
export class SetupFinanceExpenseHeadModule { }
