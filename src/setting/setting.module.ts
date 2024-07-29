import * as _ from "lodash";

import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SettingService } from "./setting.service";
import { Setting, SettingSchema } from "./setting.schema";
import { SettingController } from "./setting.controller";
import { ApplicationModule } from "src/application/application.module";

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(Setting.name),
        useFactory: () => {
          const schema = SettingSchema;
          return schema;
        },
      },
    ]),
    ApplicationModule
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService]
})
export class SettingModule { }
