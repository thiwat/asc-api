import {
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested
} from "class-validator";


export class SearchImageSettings {
  @IsNumber()
  color_weight?: number;

  @IsNumber()
  pattern_weight?: number;
}

export class SearchSettings {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  images?: SearchImageSettings
}