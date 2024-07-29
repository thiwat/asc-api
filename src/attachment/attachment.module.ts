import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { AttachmentController } from "./attachment.controller";


@Module({
  imports: [],
  controllers: [AttachmentController],
  providers: [AttachmentService],
  exports: [AttachmentService]
})
export class AttachmentModule { }
