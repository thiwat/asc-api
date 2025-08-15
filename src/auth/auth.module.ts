import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { ApplicationModule } from "src/application/application.module";


@Module({
  imports: [
    ApplicationModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: []
})
export class AuthModule { }
