import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReferralPersonService } from './referral_person.service';
import { ReferralPerson } from './entities/referral_person.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('referral-person')
export class ReferralPersonController {
  constructor(private readonly referralPersonService: ReferralPersonService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createReferralPerson: ReferralPerson) {
    return this.referralPersonService.create(createReferralPerson);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createReferralPerson: ReferralPerson) {
    return this.referralPersonService.update(id, createReferralPerson);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.referralPersonService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/filter')
  findreferralPersonSearch(@Query('search') search: string) {
    return this.referralPersonService.findreferralPersonSearch(search);
  }


  @UseGuards(AuthGuard)
  @Delete('/:referral_person_id')
  async remove(@Param('referral_person_id') referral_person_id: string, @Query('Hospital_id') Hospital_id: number) {

    const deletereferral_person_commission = await this.referralPersonService.remove(referral_person_id, Hospital_id);
    return {
      status: `success`,
      message: `id: ${referral_person_id} deleted successfully`
    }

  }



  @UseGuards(AuthGuard)
  @Get('/refCat')
  findRefCategory() {
    return this.referralPersonService.findRefCategory();
  }



}