import { Prop, Schema } from "@nestjs/mongoose";
import * as _ from 'lodash'
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: true,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class RewriteUrl extends BaseSchema {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  ref: string;
}

export const RewriteUrlSchema = BaseSchemaFactory.createForClass(RewriteUrl);
RewriteUrlSchema.index({ path: 1 }, { unique: true })