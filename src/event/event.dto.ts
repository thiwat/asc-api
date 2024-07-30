import {
  IsDateString,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import { ImageDto } from "src/common/dto/image.dto";


export class EventInput {
  @IsString()
  name?: string;

  @IsString()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  location?: string;

  @IsString()
  detail?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  cover?: ImageDto;

  @IsPositive()
  number_of_seat?: number;

  @IsPositive()
  price?: number;

  @IsDateString()
  sale_start_date?: string;

  @IsDateString()
  sale_end_date?: string;

  @IsDateString()
  event_start_date?: string;

  @IsDateString()
  event_end_date?: string;

  url_path?: string;
  number_of_sold?: number;
}