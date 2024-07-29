import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { throwError } from 'src/common/utils/error';
import { CmsPage } from './cms_page.schema';
import { CmsPageInput } from './cms_page.dto'
import { CmsBlockService } from 'src/cms_block/cms_block.service';
import { RewriteUrlService } from 'src/rewrite_url/rewrite_url.service';
import { RewriteUrlType } from 'src/common/enums/rewrite_url.enum';

@Injectable()
export class CmsPageService extends BaseService<CmsPage> {
  constructor(
    @InjectModel(_.snakeCase(CmsPage.name))
    protected model: mongoose.Model<CmsPage>,
    private cmsBlockService: CmsBlockService,
    private rewriteUrlService: RewriteUrlService
  ) {
    super(model);
  }

  public async findByCode(code: string): Promise<CmsPage> {
    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return res
  }

  public async create(data: CmsPageInput): Promise<CmsPage> {
    const res = await super.create(data)

    const rewriteUrl = await this.rewriteUrlService.generateRewriteUrl({
      ref: data.code,
      type: RewriteUrlType.cms_page
    })

    return await this.updateByCode(res.code, { url_path: rewriteUrl.path })
  }

  public async updateByCode(code: string, data: CmsPageInput): Promise<CmsPage> {
    const page = await this.findByCode(code)
    return await this.update(page.id, data)
  }

  public async deleteByCode(code: string): Promise<CmsPage> {
    const page = await this.findByCode(code)
    return await this.delete(page.id)
  }

  public async findWithContent(code: string): Promise<CmsPage> {
    const res = await this.findByCode(code)
    const blocks = await this.cmsBlockService.search({
      filter: { code: { $in: res.blocks.map(i => i.code) }, enabled: true },
      page: 1,
      page_size: res.blocks.length
    })

    const returnBlocks = []

    for (const block of res.blocks) {
      const exists = blocks.rows.find(i => i.code === block.code)
      if (!exists) continue
      returnBlocks.push(_.pick(exists, [
        'name',
        'code',
        'type',
        'content'
      ]))
    }
    res['blocks'] = returnBlocks

    return res
  }

}