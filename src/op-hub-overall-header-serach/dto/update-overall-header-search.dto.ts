import { PartialType } from '@nestjs/swagger';
import { CreateOverallHeaderSearchDto } from './create-overall-header-search.dto';

export class UpdateOverallHeaderSearchDto extends PartialType(CreateOverallHeaderSearchDto) {}
