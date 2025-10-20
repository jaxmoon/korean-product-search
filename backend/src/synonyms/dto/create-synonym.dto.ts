import { IsString, IsArray, IsOptional, IsBoolean, ArrayMinSize } from 'class-validator';

export class CreateSynonymDto {
  @IsString()
  word!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  synonyms!: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
