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
export class User extends BaseSchema {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  application: string;

  @Prop({})
  password: string;

  @Prop({})
  email: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  profile_image: any;

  @Prop()
  full_name: string;

  @Prop()
  last_logged_in_at?: Date;

  @Prop()
  role?: string;

  @Prop()
  state: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  password_histories?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  password_information?: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  social?: any;
}

export const UserSchema = BaseSchemaFactory.createForClass(User);
UserSchema.index({ username: 1, application: 1 }, { unique: true })