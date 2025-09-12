import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ComponentIssueService } from './component_issue.service';
import { ComponentIssue } from './entities/component_issue.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('component-issue')
export class ComponentIssueController {
  constructor(private readonly componentIssueService: ComponentIssueService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createComponentIssue: ComponentIssue) {
    return this.componentIssueService.create(createComponentIssue);
  }

  @UseGuards(AuthGuard)
  @Post('/AddPayment')
  AddPayment(@Body() createComponentIssue: ComponentIssue) {
    return this.componentIssueService.AddPayment(createComponentIssue);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateComponentIssue(@Param('id') id: number, @Body() createComponentIssue: ComponentIssue) {
    return this.componentIssueService.updateComponentIssue(id, createComponentIssue);
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteComponentIssuePayment/:id')
  async deleteComponentIssuePayment(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const removeComponentIssuePayment = await this.componentIssueService.deleteComponentIssuePayment(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeComponentIssue(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteComponentIssue = await this.componentIssueService.removeComponentIssue(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }

  @UseGuards(AuthGuard)
  @Delete('/deleteonlycomponentissue/:id')
  async removeonlycomponentissue(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteOnlycomponentIssue = await this.componentIssueService.removeonlycomponentissue(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }
}
