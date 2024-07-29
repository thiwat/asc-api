import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { ImageDto } from "src/common/dto/image.dto";
import { UserRole } from "src/common/enums/role.enum";
import { UserState } from "src/common/enums/user_state.enum";
import { User } from "./user.schema";

export class CreateUserInput {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  mobile_no?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsEnum(UserRole)
  role?: string;

  @IsString()
  @IsEnum(UserState)
  state?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class ActivateAccountInput {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class RegisterInput {
  @IsString()
  app_key: string;

  @IsString()
  secret_key: string;

  @IsString()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  register_token?: string;
}

export class AddressDto {
  @IsString()
  street?: string;

  @IsString()
  province?: string;

  @IsString()
  district?: string;

  @IsString()
  sub_district?: string;

  @IsString()
  postal_code?: string;
}

export class UpdateMyProfileInput {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  mobile_no: string;

  @IsString()
  @IsOptional()
  prefix: string;

  @IsString()
  @IsOptional()
  citizen_number: string;

  @IsString()
  @IsOptional()
  date_of_birth: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  profile_image?: ImageDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  address?: AddressDto;
}

export class LoginInput {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  application: string;
}

export class ForgotPasswordInput {
  @IsString()
  username: string;

  @IsString()
  app_key: string;

  @IsString()
  secret_key: string;
}

export class ResetPasswordInput {
  @IsString()
  reset_password_token: string;

  @IsString()
  new_password: string;
}

export class VerifyOtpInput {
  @IsString()
  otp: string;
}

export class ResendOtpInput {
  @IsString()
  ref: string;
}

export class RegisterOutput {
  ref: string;
}

export class LoginOutput {
  user?: User;
  need_password?: boolean;
}

export class ForgotPasswordOutput {
  reset_password_token: string;
  ref: string;
}

export class ResendOtpOutput {
  ref: string;
}
