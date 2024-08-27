import { IsEnum, IsString } from "class-validator";

export class AuthenticationInput {
  @IsString()
  app_key: string;

  @IsString()
  secret_key: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class AuthenticationLineInput {
  @IsString()
  app_key: string;

  @IsString()
  secret_key: string;

  @IsString()
  line_token: string;
}

export class RevokeTokenInput {
  @IsString()
  token: string;
}

export class AuthenticationOutput {
  token?: string;
  expires_in?: number;
  need_password?: boolean;
  password_token?: string;
}

export class SocialAuthenticationOutput {
  register_token: string;
  profile?: any;
}

export class SocialLoginOutput {
  facebook?: string;
  google?: string;
}

export class SocialProfileOutput {
  first_name?: string;
  last_name?: string;
  email?: string;
}