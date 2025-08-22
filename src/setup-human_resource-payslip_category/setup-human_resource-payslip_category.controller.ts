import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupHumanResourcePayslipCategoryService } from './setup-human_resource-payslip_category.service';
import { SetupHumanResourcePayslipCategory } from './entities/setup-human_resource-payslip_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-human-resource-payslip-category')
export class SetupHumanResourcePayslipCategoryController {
  constructor(private readonly setupHumanResourcePayslipCategoryService: SetupHumanResourcePayslipCategoryService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() payslip_categoryEntity: SetupHumanResourcePayslipCategory) {
    return this.setupHumanResourcePayslipCategoryService.create(payslip_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHumanResourcePayslipCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHumanResourcePayslipCategoryService.findone(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() payslip_categoryEntity: SetupHumanResourcePayslipCategory) {
    return this.setupHumanResourcePayslipCategoryService.update(id, payslip_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hospital_id') hospital_id: number) {
    return this.setupHumanResourcePayslipCategoryService.remove(id, hospital_id);
  }
}
