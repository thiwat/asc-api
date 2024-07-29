import { IsEnum, IsOptional, IsString } from "class-validator";
import { RewriteUrlType } from "src/common/enums/rewrite_url.enum";

export class GetRewriteUrlInput {
  @IsString()
  path: string;
}

export class CreateRewriteUrlInput {
  @IsOptional()
  @IsString()
  path?: string;

  @IsString()
  ref: string;

  @IsString()
  @IsEnum(RewriteUrlType)
  type: string;
}