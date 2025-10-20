import { PartialType } from '@nestjs/mapped-types';
import { CreateSynonymDto } from './create-synonym.dto';

export class UpdateSynonymDto extends PartialType(CreateSynonymDto) {}
