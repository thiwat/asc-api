import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

export class SecurityUniversalOtp {
  @IsOptional()
  @IsBoolean()
  enable_universal_otp?: boolean;

  @IsOptional()
  @IsString({ each: true })
  universal_otp?: string[];
}

export class SecuritySetting {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  otp?: SecurityUniversalOtp
}