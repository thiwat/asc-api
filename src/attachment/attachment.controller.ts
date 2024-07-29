import {
  Body,
  Controller,
  Post,
} from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { UploadAttachmentInput } from './attachment.dto';


@Controller({
  path: 'attachment',
  version: '1'
})
export class AttachmentController {
  constructor(protected readonly service: AttachmentService) { }

  @Post('/upload')
  async upload(@Body() data: UploadAttachmentInput) {
    return this.service.uploadFile(data)
  }
}