import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested
} from "class-validator";
import {
  AttachmentAwsS3ACL,
  AttachmentAwsS3AuthenType,
  AttachmentAwsS3Region,
  AttachmentFileExtension,
  AttachmentProvider
} from "src/common/enums/attachment.enum";

export class AttachmentGoogleDriveProviderSetting {
  @IsString()
  path?: string;

  @IsObject()
  credentials: any;
}

export class AttachmentAwsS3ProviderSetting {
  @IsEnum(AttachmentAwsS3AuthenType)
  @IsString()
  authen_type: AttachmentAwsS3AuthenType

  @IsString()
  access_key: string;

  @IsString()
  secret_key: string;

  @IsEnum(AttachmentAwsS3Region)
  @IsString()
  region: AttachmentAwsS3Region

  @IsEnum(AttachmentAwsS3ACL)
  @IsString()
  acl: AttachmentAwsS3ACL

  @IsString()
  bucket: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  custom_domain?: string;
}

export class AttachmentSetting {
  @IsEnum(AttachmentProvider)
  @IsString()
  default_provider?: AttachmentProvider;

  @IsPositive()
  limit_file_size: number;

  @IsEnum(AttachmentFileExtension, { each: true })
  @IsArray()
  allow_extension_file: string[];

  @IsObject()
  @ValidateNested()
  @ValidateIf(x => x.default_provider === AttachmentProvider.aws_s3)
  aws_s3?: AttachmentAwsS3ProviderSetting;
}