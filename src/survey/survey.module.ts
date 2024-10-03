import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SurveyController } from "./survey.controller";
import { SurveyService } from "./survey.service";
import { Survey, SurveySchema } from "./survey.schema";
import { SurveyAnswer, SurveyAnswerSchema } from "./answer/answer.schema";
import { SurveyAnswerController } from "./answer/answer.controller";
import { SurveyAnswerService } from "./answer/answer.service";
import { UserModule } from "src/user/user.module";
import { RewriteUrlModule } from "src/rewrite_url/rewrite_url.module";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(Survey.name),
        useFactory: () => {
          const schema = SurveySchema;
          return schema;
        },
      },
      {
        name: _.snakeCase(SurveyAnswer.name),
        useFactory: () => {
          const schema = SurveyAnswerSchema;
          return schema;
        },
      },
    ]),
    RewriteUrlModule,
    UserModule
  ],
  controllers: [SurveyController, SurveyAnswerController],
  providers: [SurveyService, SurveyAnswerService],
})
export class SurveyModule { }
