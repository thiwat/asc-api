import { IsObject, IsOptional, IsPositive, IsString } from "class-validator";

export class ListQueryDto {
  @IsOptional()
  @IsString()
  keywoard?: string;

  @IsOptional()
  @IsObject()
  filter?: any;

  @IsOptional()
  @IsString()
  sort?: string;
}
