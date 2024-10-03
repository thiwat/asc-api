import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { throwError } from 'src/common/utils/error';
import { Survey } from './survey.schema';
import { SurveyInput } from './survey.dto';
import { RewriteUrlService } from 'src/rewrite_url/rewrite_url.service';
import { RewriteUrlType } from 'src/common/enums/rewrite_url.enum';

@Injectable()
export class SurveyService extends BaseService<Survey> {
  constructor(
    @InjectModel(_.snakeCase(Survey.name))
    protected model: mongoose.Model<Survey>,
    private rewriteUrlService: RewriteUrlService,
  ) {
    super(model);
  }

  public async findByCode(code: string): Promise<Survey> {
    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return res
  }

  public async create(data: SurveyInput): Promise<Survey> {
    const res = await super.create(data)

    const rewriteUrl = await this.rewriteUrlService.generateRewriteUrl({
      ref: data.code,
      type: RewriteUrlType.survey
    })

    await this.update(res.id, {
      url_path: rewriteUrl.path
    })

    return res
  }

  public async updateByCode(code: string, data: SurveyInput): Promise<Survey> {
    const res = await this.findByCode(code)
    return this.update(res.id, data)
  }

  public async deleteByCode(code: string): Promise<Survey> {
    const res = await this.findByCode(code)
    return this.delete(res.id)
  }
}