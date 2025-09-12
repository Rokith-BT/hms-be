import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupReferralReferralCommissionService } from './setup-referral-referral_commission.service';
import { SetupReferralReferralCommission } from './entities/setup-referral-referral_commission.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-referral-referral-commission')
export class SetupReferralReferralCommissionController {
  constructor(private readonly setupReferralReferralCommissionService: SetupReferralReferralCommissionService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() referral_commissionEntity: SetupReferralReferralCommission[]) {
    console.log(referral_commissionEntity);

    return this.setupReferralReferralCommissionService.create(referral_commissionEntity);
  }


  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupReferralReferralCommissionService.findAll();
  }


  @UseGuards(AuthGuard)
  @Patch()
  update(@Body() referral_commissionEntity: SetupReferralReferralCommission[]) {
    return this.setupReferralReferralCommissionService.update(referral_commissionEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':referral_category_id')
  async remove(@Param('referral_category_id') referral_category_id: string, @Query('Hospital_id') Hospital_id: number) {

    const deletereferral_commission = await this.setupReferralReferralCommissionService.remove(referral_category_id, Hospital_id);
    return {
      status: `success`,
      message: `id: ${referral_category_id} deleted successfully`
    }

  }


  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Referral_Commission")
  async findReferralCommissionSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupReferralReferralCommissionService.findReferralCommissionSearch(
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
