import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { ImageDto } from "src/common/dto/image.dto";
import { CmsBlockType, CmsButtonType } from "src/common/enums/cms.enum";

export class CmsBlockContent {
  @IsString()
  @IsOptional()
  html?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  image?: ImageDto;

  @IsString()
  @IsOptional()
  max_width?: string;

  @IsString()
  @IsOptional()
  @IsEnum(CmsButtonType)
  button_type?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsOptional()
  @ValidateNested()
  images?: ImageDto[];

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsString({ each: true })
  tags?: string;
}

export class CmsBlockInput {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  enabled?: boolean;

  @IsEnum(CmsBlockType)
  @IsString()
  type: CmsBlockType;

  @IsObject()
  @ValidateNested()
  content: CmsBlockContent;
}