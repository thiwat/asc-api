import { join } from 'path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { AttachmentAwsS3ProviderSetting } from "src/setting/dto/attachment.dto";
import { AttachmentProviderInterface } from "./attachment_provider.interface";
import { UploadAttachmentInput } from "../attachment.dto";

export class AwsS3AttachmentProvider implements AttachmentProviderInterface {
  constructor(private config: AttachmentAwsS3ProviderSetting) { }

  private _getClient(): S3Client {
    return new S3Client({
      credentials: {
        accessKeyId: this.config.access_key,
        secretAccessKey: this.config.secret_key
      },
      region: this.config.region
    })
  }

  public async upload(data: UploadAttachmentInput): Promise<string> {

    const client = this._getClient()

    const fileKey = join(
      this.config.path || '',
      data.path || '',
      data.file_name
    )

    const command = new PutObjectCommand({
      ACL: this.config.acl as any,
      Bucket: this.config.bucket,
      Key: fileKey,
      Body: Buffer.from(data.image_data.replace(/^data:.*;base64,/, ''), 'base64'),
      ContentEncoding: 'base64',
      ContentType: data.mime_type
    })

    await client.send(command)

    return this.config.custom_domain
      ? `${this.config.custom_domain}/${fileKey}`
      : `https://${this.config.bucket}.s3.amazonaws.com/${fileKey}`
  }
}