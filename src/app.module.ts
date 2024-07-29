import * as dotenv from "dotenv";

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ApplicationModule } from "./application/application.module";
import { AuthModule } from "./auth/auth.module";
import { SettingModule } from "./setting/setting.module";
import { BullModule } from "@nestjs/bull";
import { AttachmentModule } from "./attachment/attachment.module";
import { CmsBlockModule } from "./cms_block/cms_block.module";
import { CmsPageModule } from "./cms_page/cms_page.module";
import { RewriteUrlModule } from "./rewrite_url/rewrite_url.module";

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    BullModule.forRoot({
      url: process.env.QUEUE_REDIS_URL
    }),
    ApplicationModule,
    AttachmentModule,
    AuthModule,
    CmsBlockModule,
    CmsPageModule,
    SettingModule,
    RewriteUrlModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
