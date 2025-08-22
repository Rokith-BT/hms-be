import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InternalTransactionIdService } from './internal-transaction-id.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-transaction-id')
export class InternalTransactionIdController {
  constructor(
    private readonly internalTransactionIdService: InternalTransactionIdService,
  ) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  findAll(@Param('id') id: number) {
    return this.internalTransactionIdService.findAll(id);
  }
}
