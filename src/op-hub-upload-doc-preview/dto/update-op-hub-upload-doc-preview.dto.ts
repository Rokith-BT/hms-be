import { PartialType } from '@nestjs/swagger';
import { CreateOpHubUploadDocPreviewDto } from './create-op-hub-upload-doc-preview.dto';

export class UpdateOpHubUploadDocPreviewDto extends PartialType(CreateOpHubUploadDocPreviewDto) {}
