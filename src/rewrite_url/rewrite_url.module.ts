import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RewriteUrl, RewriteUrlSchema } from "./rewrite_url.schema";
import { RewriteUrlController } from "./rewrite_url.controller";
import { RewriteUrlService } from "./rewrite_url.service";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(RewriteUrl.name),
        useFactory: () => {
          const schema = RewriteUrlSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [RewriteUrlController],
  providers: [RewriteUrlService],
  exports: [RewriteUrlService]
})
export class RewriteUrlModule { }
