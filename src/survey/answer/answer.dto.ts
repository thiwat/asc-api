import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

export class SurveyAnswerItem {
  @IsString()
  code: string;

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