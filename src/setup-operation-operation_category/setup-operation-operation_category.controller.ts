import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupOperationOperationCategoryService } from './setup-operation-operation_category.service';
import { SetupOperationOperationCategory } from './entities/setup-operation-operation_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('SetupOperationOperationCategoryController')
export class SetupOperationOperationCategoryController {
  constructor(private readonly setupOperationOperationCategoryService: SetupOperationOperationCategoryService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() operation_categoryService: SetupOperationOperationCategory) {
    return this.setupOperationOperationCategoryService.create(operation_categoryService);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupOperationOperationCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupOperationOperationCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() operation_categoryService: SetupOperationOperationCategory) {
    return this.setupOperationOperationCategoryService.update(id, operation_categoryService);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {

    return this.setupOperationOperationCategoryService.remove(id, Hospital_id);

  }

  @UseGuards(AuthGuard)
  @Get('/operationCategory/:search')
  setupOperationcategory(@Param('search') search: string) {
    console.log(search, "zzzzzz");

    return this.setupOperationOperationCategoryService.setupOperationcategory(search);
  }


  @UseGuards(AuthGuard)
  @Get('/v2/getalloperationcategory')
  async findalloperationcategory(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {
    try {
      let final_output = await this.setupOperationOperationCategoryService.findalloperation_category(
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
        };
      } else {
        return {
          status_code: process.env.NO_DATA_STATUS_CODE,
          status: process.env.NO_DATA_STATUS,
          message: process.env.NO_DATA_MESSAGE
        };
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