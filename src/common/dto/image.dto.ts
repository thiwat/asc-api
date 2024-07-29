import { IsOptional, IsString } from "class-validator";

export class ImageDto {
  @IsString()
  @IsOptional()
  url?: string;

  width?: number;

  height?: number;
}