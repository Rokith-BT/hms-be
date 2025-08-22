import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DonorDetailsService } from './donor_details.service';
import { DonorDetail } from './entities/donor_detail.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('donor-details')
export class DonorDetailsController {
  constructor(private readonly donorDetailsService: DonorDetailsService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createDonorDetail: DonorDetail) {
    return this.donorDetailsService.create(createDonorDetail);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateBloodDonorDetail(@Param('id') id: number, @Body() createDonorDetail: DonorDetail) {
    return this.donorDetailsService.updateBloodDonorDetail(id, createDonorDetail);
  }


  @UseGuards(AuthGuard)
  @Post('/bloodDonorCycle/blood')
  createBloodDonorCycle(@Body() createDonorDetail: DonorDetail) {
    return this.donorDetailsService.createBloodDonorCycle(createDonorDetail);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeBloodDonorCycle(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteBloodDonorCycle = await this.donorDetailsService.removeBloodDonorCycle(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }

  @UseGuards(AuthGuard)
  @Delete('/deleteDonorandDonorCycle/:id')
  async removeDonorandDonorCycle(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteDonorandDonorCycle = await this.donorDetailsService.removeDonorandDonorCycle(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }


  @UseGuards(AuthGuard)
  @Post('/components')
  createComponents(@Body() createDonorDetail: DonorDetail[]) {
    return this.donorDetailsService.createComponents(createDonorDetail);
  }

}
