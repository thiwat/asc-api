import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/common/enums/role.enum";

export class ApplicationInput {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  enabled?: boolean;

  @IsString({ each: true })
  @IsEnum(UserRole, { each: true })
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  use_recaptcha?: boolean
}