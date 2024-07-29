import { UploadAttachmentInput } from "../attachment.dto";

export interface AttachmentProviderInterface {
  upload(data: UploadAttachmentInput): Promise<string>
}