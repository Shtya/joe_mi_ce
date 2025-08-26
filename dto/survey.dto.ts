import { IsString, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class SurveyQuestionDto {
  @IsString()
  text: string;
  
  @IsString()
  type:string;

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateSurveyDto {
  @IsString()
  name: string;

  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  questions: SurveyQuestionDto[];
}


export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {}