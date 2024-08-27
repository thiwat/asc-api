import { IsEnum, IsOptional, IsString } from "class-validator";
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

export class LoginInput {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  application: string;
}

export class LoginOutput {
  user?: User;
  need_password?: boolean;
}