import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ApplicationModule } from "src/application/application.module";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(User.name),
        useFactory: () => {
          const schema = UserSchema;
          return schema;
        },
      },
    ]),
    ApplicationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
