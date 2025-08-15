import {
  Body,
  Controller,
  Post,
} from "@nestjs/common";
import { AuthService } from './auth.service'
import {
  AuthenticationInput,
  AuthenticationOutput,
  RevokeTokenInput,
} from "./auth.dto";
import { Public } from "src/common/decorators/public.decorator";
import { CommonResult } from "src/common/dto/common_result.dto";

@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(protected readonly service: AuthService) { }

  @Public()
  @Post('/access_token')
  async authentication(
    @Body() body: AuthenticationInput
  ): Promise<AuthenticationOutput> {
    return this.service.authentication(body)
  }

  @Public()
  @Post('/revoke')
  async revokeToken(
    @Body() body: RevokeTokenInput
  ): Promise<CommonResult> {
    return this.service.revokeToken(body)
  }
}