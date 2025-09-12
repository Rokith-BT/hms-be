import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupOperationOperationService } from './setup-operation-operation.service';
import { SetupOperationOperation } from './entities/setup-operation-operation.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-operation-operation')
export class SetupOperationOperationController {
  constructor(private readonly setupOperationOperationService: SetupOperationOperationService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() operationEntity: SetupOperationOperation) {
    return this.setupOperationOperationService.create(operationEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupOperationOperationService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupOperationOperationService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() operationEntity: SetupOperationOperation) {
    return this.setupOperationOperationService.update(id, operationEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {

    return this.setupOperationOperationService.remove(id, Hospital_id);

  }

  @UseGuards(AuthGuard)
  @Get('/operation/:search')
  setupOperation(@Param('search') search: string) {
    console.log(search, "zzzzzz");

    return this.setupOperationOperationService.setupOperation(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getalloperation')
  async findalloperation(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {
    try {
      let final_output = await this.setupOperationOperationService.getoperation(
        limit || 10,
        page || 1,
        search || ''
      );
      console.log("controller");

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit),
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
  }
}