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
export class Survey extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  description: string;

  @Prop()
  enabled: boolean;

  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  questions?: any;

  @Prop()
  header_content: string;

  @Prop({})
  thankyou_page: string;

  @Prop()
  send_email?: boolean;

  @Prop({})
  url_path: string;
}

export const SurveySchema = BaseSchemaFactory.createForClass(Survey);

SurveySchema.index({ code: 1 }, { unique: true })
