import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CmsPage, CmsPageSchema } from "./cms_page.schema";
import { CmsPageController } from "./cms_page.controller";
import { CmsPageService } from "./cms_page.service";
import { CmsBlockModule } from "src/cms_block/cms_block.module";
import { RewriteUrlModule } from "src/rewrite_url/rewrite_url.module";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(CmsPage.name),
        useFactory: () => {
          const schema = CmsPageSchema;
          return schema;
        },
      },
    ]),
    CmsBlockModule,
    RewriteUrlModule
  ],
  controllers: [CmsPageController],
  providers: [CmsPageService],
})
export class CmsPageModule { }
