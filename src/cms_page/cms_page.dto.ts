import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class CmsPageMetaData {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  keyword: string;
}

export class CmsBlock {
  @IsString()
  @IsOptional()
  code?: string;
}

export class CmsPageInput {
  @IsString()
  name?: string;

  @IsString()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  enabled?: boolean;

  @ValidateNested()
  blocks?: CmsBlock;

  @IsObject()
  @ValidateNested()
  meta_data?: CmsPageMetaData;

  url_path?: string;
}