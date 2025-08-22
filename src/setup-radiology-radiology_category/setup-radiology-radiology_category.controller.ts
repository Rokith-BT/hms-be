import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupRadiologyRadiologyCategoryService } from './setup-radiology-radiology_category.service';
import { SetupRadiologyRadiologyCategory } from './entities/setup-radiology-radiology_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-radiology-radiology-category')
export class SetupRadiologyRadiologyCategoryController {
  constructor(private readonly setupRadiologyRadiologyCategoryService: SetupRadiologyRadiologyCategoryService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() radiology_categoryEntity: SetupRadiologyRadiologyCategory) {
    return this.setupRadiologyRadiologyCategoryService.create(radiology_categoryEntity);
  }


  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupRadiologyRadiologyCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupRadiologyRadiologyCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() radiology_categoryEntity: SetupRadiologyRadiologyCategory) {
    return this.setupRadiologyRadiologyCategoryService.update(id, radiology_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupRadiologyRadiologyCategoryService.remove(id, Hospital_id);
  }


  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Radiology_Category")
  async findRadiologyCategorySearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupRadiologyRadiologyCategoryService.findRadiologyCategorySearch(
        search,
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
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

  @UseGuards(AuthGuard)
  @Get("/v3/Setup_Radiology_Category")
  async findRadiologyCategorysSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupRadiologyRadiologyCategoryService.findRadiologyCategorysSearch(
        search,
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
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
