import { Controller, Get, Post, Body, Patch, Param, Delete , Query } from '@nestjs/common';
import { StaffIdCardService } from './staff_id_card.service';
import { StaffIdCard } from './entities/staff_id_card.entity';

@Controller('staff-id-card')
export class StaffIdCardController {
  constructor(private readonly staffIdCardService: StaffIdCardService) {}

  @Post()
  create(@Body() createStaffIdCard: StaffIdCard) {
    return this.staffIdCardService.create(createStaffIdCard);
  }


  @Patch('/:id')
  updateStaffIdCard(@Param('id') id: number, @Body()  createStaffIdCard: StaffIdCard) {
    return this.staffIdCardService.updateStaffIdCard(id, createStaffIdCard);
  }


  @Delete('/:id')
  async removeStaffIDcard(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deleteStaffIDcard = await this.staffIdCardService.removeStaffIDcard(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }



  // @Get()
  // findAll() {
  //   return this.staffIdCardService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.staffIdCardService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createStaffIdCard: StaffIdCard) {
  //   return this.staffIdCardService.update(+id, createStaffIdCard);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.staffIdCardService.remove(+id);
  // }
}
