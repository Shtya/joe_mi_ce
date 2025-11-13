import { IsString, IsOptional, IsUrl, IsUUID, IsNumber } from 'class-validator';

export class CreateCompetitorDto {
  @IsNumber()
  id:number;
  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  logo_url: string;

  projectId: number;
}

export class UpdateCompetitorDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsUrl()
  logo_url: string;

  projectId: number;
}
