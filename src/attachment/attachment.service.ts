import { Injectable } from "@nestjs/common";
import { AttachmentProvider } from "src/common/enums/attachment.enum";
import { UploadAttachmentInput, UploadAttachmentOutput } from "./attachment.dto";
import { throwError } from "src/common/utils/error";
import { AttachmentSetting } from "src/setting/dto/attachment.dto";
import { SettingService } from "src/setting/setting.service";
import { Logger } from "winston";
import logger from "src/common/utils/logger";
import { AttachmentProviderInterface } from "./providers/attachment_provider.interface";
import { AwsS3AttachmentProvider } from "./providers/aws_s3.provider";

@Injectable()
export class AttachmentService {
  private logger: Logger
  constructor(
    private settingService: SettingService
  ) {
    this.logger = logger.child({ service: this.constructor.name })
  }

  private async _getAttachmentSetting(): Promise<AttachmentSetting> {
    return this.settingService.getSetting('attachment', 'attachment', {})
  }

  private _getFileSizeFromBase64(data: string): number {
    const offset = data.startsWith('data')
      ? data.split('base64,')[0].length
      : 0
    const sizeInBytes = 4 * Math.ceil(((data.length - offset) / 3)) * 0.5624896334383812;
    return sizeInBytes / 1000000;
  }

  private _getMimeType(data: string): string {
    if (!data.startsWith('data')) throwError('Invalid request', 'imvalid_request')

    return data.split('data:')[1].split(';base64')[0]
  }

  private _getProvider(provider: AttachmentProvider, setting: AttachmentSetting): AttachmentProviderInterface {
    switch (provider) {
      case AttachmentProvider.aws_s3:
        return new AwsS3AttachmentProvider(setting.aws_s3)
      default:
        throwError('Invalid attachment provider', 'invalid_attachment_provider')
    }
  }

  public async uploadFile(data: UploadAttachmentInput): Promise<UploadAttachmentOutput> {

    const settings = await this._getAttachmentSetting()
    const provider = this._getProvider(data.provider || settings.default_provider, settings)

    const fileSize = this._getFileSizeFromBase64(data.image_data)
    const mimeType = this._getMimeType(data.image_data)
    const fileExt = mimeType.includes('openxmlformats-officedocument.wordprocessingml.document')
      ? 'docx'
      : mimeType.split('/')[1]

    if (fileSize > settings.limit_file_size) {
      throwError('File size over limit', 'file_size_over_limit')
    }

    if (!settings.allow_extension_file.includes(fileExt)) {
      throwError('Invalid ext file type', 'invalid_ext_file_type')
    }

    this.logger.info('Upload attachment', {
      data: {
        file_name: data.file_name,
        size: fileSize,
        mime_type: mimeType,
        provider: data.provider || settings.default_provider
      }
    })

    data.mime_type = mimeType
    const url = await provider.upload(data)

    return {
      url
    }
  }
}