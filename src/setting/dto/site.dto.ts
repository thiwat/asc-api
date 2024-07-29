import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

export class SiteBlockMapping {
  @IsOptional()
  @IsString()
  login: string;
}

export class SitePageMapping {
  @IsOptional()
  @IsString()
  home: string;

  @IsOptional()
  @IsString()
  contact_us: string;
}

export class SiteWebAppSetting {
  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  secondary_color?: string;

  @IsOptional()
  @IsString()
  gtm_id?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  mapping_block: SiteBlockMapping;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  mapping_page: SitePageMapping;
}

export class SiteSetting {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  site?: SiteWebAppSetting
}