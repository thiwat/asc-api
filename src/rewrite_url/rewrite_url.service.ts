import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { RewriteUrl } from './rewrite_url.schema';
import { CreateRewriteUrlInput, GetRewriteUrlInput } from './rewrite_url.dto';
import { throwError } from 'src/common/utils/error';
import { randomString } from 'src/common/utils/random';

@Injectable()
export class RewriteUrlService extends BaseService<RewriteUrl> {
  constructor(
    @InjectModel(_.snakeCase(RewriteUrl.name))
    protected model: mongoose.Model<RewriteUrl>,
  ) {
    super(model);
  }

  public async getRewriteUrl(data: GetRewriteUrlInput): Promise<RewriteUrl> {
    const record = await this.find({ path: data.path })

    if (_.isEmpty(record)) {
      throwError('Request path not found', 'request_path_not_found', 404)
    }

    return record
  }

  public async generateRewriteUrl(data: CreateRewriteUrlInput): Promise<RewriteUrl> {

    if (!data.path) {
      data.path = _.snakeCase(data.ref)
    }

    const exists = await this.find({ path: data.path })

    if (!_.isEmpty(exists)) {
      data.path = `${data.path}_${randomString(6)}`
    }

    return await this.create(data)
  }
}