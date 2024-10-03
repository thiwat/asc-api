import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { SurveyQuestionType } from "src/common/enums/survey.enum";

export class SurveyQuestionOption {
  @IsString()
  label;

  @IsString()
  value;
}

export class SurveyQuestion {
  @IsString()
  label: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  placeholder: string;

  @IsOptional()
  @IsString()
  validate: string;

  @IsString()
  @IsEnum(SurveyQuestionType)
  type: string;

  @IsOptional()
  @IsNumber()
  span: number;

  @IsOptional()
  @IsBoolean()
  send_email: boolean;

  @IsOptional()
  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionOption)
  options?: SurveyQuestionOption[];
}

export class SurveyInput {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  title?: string;

  @ValidateNested({ each: true })
  @Type(() => SurveyQuestion)
  questions?: SurveyQuestion[];

  @IsString()
  header_content: string;

  @IsString()
  thankyou_page: string;
}