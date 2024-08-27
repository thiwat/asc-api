import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

export class IntegrationLineSetting {
  @IsOptional()
  @IsString()
  liff_id: string;

  @IsOptional()
  @IsBoolean()
  enable_mock_mode: boolean;
}

export class IntegrationSettings {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  line?: IntegrationLineSetting
}