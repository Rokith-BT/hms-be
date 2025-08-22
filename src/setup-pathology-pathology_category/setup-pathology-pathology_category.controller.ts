import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupPathologyPathologyCategoryService } from './setup-pathology-pathology_category.service';
import { SetupPathologyPathologyCategory } from './entities/setup-pathology-pathology_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-pathology-pathology-category')
export class SetupPathologyPathologyCategoryController {
  constructor(private readonly setupPathologyPathologyCategoryService: SetupPathologyPathologyCategoryService) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() pathology_category_entity: SetupPathologyPathologyCategory) {
    return this.setupPathologyPathologyCategoryService.create(pathology_category_entity);
  }
@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPathologyPathologyCategoryService.findAll();
  }
@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupPathologyPathologyCategoryService.findOne(id);
  }
@UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() pathology_category_entity: SetupPathologyPathologyCategory) {
    return this.setupPathologyPathologyCategoryService.update(id, pathology_category_entity);
  }
@UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id:number) {
    return this.setupPathologyPathologyCategoryService.remove(id,Hospital_id);
  }


  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Pathology_Category")
  async findPathologyCategorySearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupPathologyPathologyCategoryService.findPathologyCategorySearch(
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
    else{
      return{
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.DATA_NOT_FOUND
      }
    }
    } catch (error) {
  return{
    status_code: process.env.ERROR_STATUS_CODE,
    status: process.env.ERROR_STATUS,
    message: process.env.ERROR_MESSAGE
  }      
    }
   
  }

  @UseGuards(AuthGuard)
  @Get("/v3/Setup_Pathology_Category")
  async findPathologyCategorysSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupPathologyPathologyCategoryService.findPathologyCategorysSearch(
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
    else{
      return{
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.DATA_NOT_FOUND
      }
    }
    } catch (error) {
  return{
    status_code: process.env.ERROR_STATUS_CODE,
    status: process.env.ERROR_STATUS,
    message: process.env.ERROR_MESSAGE
  }      
    }
   
  }


}
