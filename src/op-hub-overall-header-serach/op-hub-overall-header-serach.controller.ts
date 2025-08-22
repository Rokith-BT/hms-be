import { Controller, Post, Body, } from '@nestjs/common';
import { OpHubOverallHeaderSerachService } from './op-hub-overall-header-serach.service';
import { CreateOverallHeaderSearchDto } from './dto/create-overall-header-search.dto';

@Controller('op-hub-overall-header-serach')
export class OpHubOverallHeaderSerachController {
  constructor(private readonly overallHeaderSearchService: OpHubOverallHeaderSerachService) { }

  @Post()
  create(@Body() createOverallHeaderSearchDto: CreateOverallHeaderSearchDto) {
    return this.overallHeaderSearchService.create(createOverallHeaderSearchDto);
  }
}
