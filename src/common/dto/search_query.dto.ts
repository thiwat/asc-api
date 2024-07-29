import { IsOptional, IsPositive, IsString } from "class-validator";

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  filter?: any;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  fields?: string;

  @IsPositive()
  @IsOptional()
  page: number;

  @IsPositive()
  @IsOptional()
  page_size: number;
}
