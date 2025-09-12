import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReferralPersonCommissionService } from './referral_person_commission.service';
import { ReferralPersonCommission } from './entities/referral_person_commission.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('referral-person-commission')
export class ReferralPersonCommissionController {
  constructor(private readonly referralPersonCommissionService: ReferralPersonCommissionService) { }


  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createReferralPersonCommission: ReferralPersonCommission[]) {
    return this.referralPersonCommissionService.create(createReferralPersonCommission);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(@Body() updateReferralPersonCommission: ReferralPersonCommission[]) {
    return this.referralPersonCommissionService.update(updateReferralPersonCommission);
  }



  // @Get()
  // findAll() {
  //   return this.referralPersonCommissionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.referralPersonCommissionService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.referralPersonCommissionService.remove(+id);
  // }


}
