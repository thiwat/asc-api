import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ApplicationController } from "./application.controller";
import { ApplicationService } from "./application.service";
import { Application, ApplicationSchema } from "./application.schema";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(Application.name),
        useFactory: () => {
          const schema = ApplicationSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService]
})
export class ApplicationModule { }
