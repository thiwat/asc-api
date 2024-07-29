import { IsEnum, IsOptional, IsString } from "class-validator";
import { AttachmentProvider } from "src/common/enums/attachment.enum";

export class UploadAttachmentInput {
  @IsString()
  image_data: string;

  @IsString()
  @IsOptional()
  path: string;

  @IsString()
  file_name: string;

  @IsEnum(AttachmentProvider)
  @IsString()
  @IsOptional()
  provider?: AttachmentProvider;

  mime_type?: string;
}

export class UploadAttachmentOutput {
  url: string;
}