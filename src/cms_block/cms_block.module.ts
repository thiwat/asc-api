import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CmsBlock, CmsBlockSchema } from "./cms_block.schema";
import { CmsBlockController } from "./cms_block.controller";
import { CmsBlockService } from "./cms_block.service";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(CmsBlock.name),
        useFactory: () => {
          const schema = CmsBlockSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [CmsBlockController],
  providers: [CmsBlockService],
  exports: [CmsBlockService]
})
export class CmsBlockModule { }
