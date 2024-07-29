import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: true,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class Application extends BaseSchema {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({})
  description: string;

  @Prop({})
  app_key: string;

  @Prop({})
  secret_key: string;

  @Prop()
  enabled?: boolean;

  @Prop()
  roles?: string[];

  @Prop()
  use_recaptcha?: boolean;
}

export const ApplicationSchema = BaseSchemaFactory.createForClass(Application);

ApplicationSchema.index({ app_key: 1 }, { unique: true })
ApplicationSchema.index({ code: 1 }, { unique: true })
