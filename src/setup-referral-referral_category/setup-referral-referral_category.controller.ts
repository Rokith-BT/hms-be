import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupReferralReferralCategoryService } from './setup-referral-referral_category.service';
import { SetupReferralReferralCategory } from './entities/setup-referral-referral_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-referral-referral-category')
export class SetupReferralReferralCategoryController {
  constructor(private readonly setupReferralReferralCategoryService: SetupReferralReferralCategoryService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() referral_categoryEntity: SetupReferralReferralCategory) {
    return this.setupReferralReferralCategoryService.create(referral_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupReferralReferralCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupReferralReferralCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() referral_categoryEntity: SetupReferralReferralCategory) {
    return this.setupReferralReferralCategoryService.update(id, referral_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupReferralReferralCategoryService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupReferralCategory/:search')
  setupReferralCategory(@Param('search') search: string) {

    return this.setupReferralReferralCategoryService.setupReferralCategory(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Referral_Category")
  async findReferralCategorySearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupReferralReferralCategoryService.findReferralCategorySearch(
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
