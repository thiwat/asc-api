import * as mongoose from 'mongoose'
import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: true,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class CmsPage extends BaseSchema {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({})
  description: string;

  @Prop({})
  enabled: boolean;

  @Prop({})
  url_path: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  meta_data: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  blocks: any[];
}

export const CmsPageSchema = BaseSchemaFactory.createForClass(CmsPage);

CmsPageSchema.index({ code: 1 }, { unique: true })
