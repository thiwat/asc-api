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
export class CmsBlock extends BaseSchema {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({})
  description: string;

  @Prop({})
  enabled: boolean;

  @Prop({})
  type: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  content: any;
}

export const CmsBlockSchema = BaseSchemaFactory.createForClass(CmsBlock);

CmsBlockSchema.index({ code: 1 }, { unique: true })
