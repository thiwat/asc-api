import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested
} from "class-validator";
import { PasswordCase } from "src/common/enums/authentication.enum";

export class AuthenticationPasswordPolicy {
  @IsOptional()
  @IsPositive()
  minimum_length?: number;

  @IsOptional()
  @IsEnum(PasswordCase, { each: true })
  password_case: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  enforce_password_history?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_password_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maximum_password_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  prompt_user_before_password_expires?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  wrong_password_attempt?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  wrong_password_attempt_duration?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ each: true })
  @Min(0, { each: true })
  unlock_user_after_x_minutes?: number[];
}

export class AuthenticationSettings {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  password_policy: AuthenticationPasswordPolicy;
}