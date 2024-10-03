import * as mongoose from "mongoose";
import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: true,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class SurveyAnswer extends BaseSchema {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  survey: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  survey_name: string;

  @Prop()
  user_name: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  answers: any;
}

export const SurveyAnswerSchema = BaseSchemaFactory.createForClass(SurveyAnswer);