import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

export class SurveyAnswerItem {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class SurveyAnswerInput {
  @IsString()
  code: string;

  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerItem)
  answers?: SurveyAnswerItem[];
}