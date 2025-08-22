import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FindingsCategoryService } from './findings_category.service';
import { findingaa, FindingsCategory } from './entities/findings_category.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';


@ApiTags('FindingsCategory')

@Controller('findings_category')
export class FindingsCategoryController {
  constructor(private readonly findingsCategoryService: FindingsCategoryService) { }

  @ApiOperation({ summary: 'insert findings_category options' })
  @ApiBody({ type: findingaa, description: 'data required.', })
  @ApiResponse({
    status: 200,
    description: 'successfully.',
    type: [FindingsCategory]
  })
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() finding_category: FindingsCategory) {
    return this.findingsCategoryService.create(finding_category);
  }

  @ApiOperation({ summary: 'Get all findings_category options' })
  @ApiResponse({ status: 200, description: 'List of genders returned successfully.', type: [FindingsCategory] })
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.findingsCategoryService.findAll();
  }

  @ApiOperation({ summary: 'Get one findings_category by id' })
  @ApiResponse({ status: 200, description: 'List of genders returned successfully.', type: [FindingsCategory] })
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findingsCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() finding_category: FindingsCategory) {
    return this.findingsCategoryService.update(id, finding_category);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {

    return this.findingsCategoryService.remove(id, Hospital_id);

  }

  @UseGuards(AuthGuard)
  @Get('/SetupfindingCategory/:search')
  SetupFindingCategory(@Param('search') search: string) {

    return this.findingsCategoryService.SetupFindingCategory(search);
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getallfinding_category')
  async findAllDesig(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_output = await this.findingsCategoryService.find_finding_category(
        limit || 10,
        page || 1,
        search || ''
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit),
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
