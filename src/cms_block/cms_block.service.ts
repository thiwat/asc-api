import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { throwError } from 'src/common/utils/error';
import { CmsBlock } from './cms_block.schema';
import { CmsBlockInput } from './cms_block.dto';
import { CmsBlockType } from 'src/common/enums/cms.enum';

@Injectable()
export class CmsBlockService extends BaseService<CmsBlock> {
  constructor(
    @InjectModel(_.snakeCase(CmsBlock.name))
    protected model: mongoose.Model<CmsBlock>,
  ) {
    super(model);
  }

  private async _prepareDataBeforeSave(data: CmsBlockInput): Promise<CmsBlockInput> {
    if (data.type === CmsBlockType.image) {
      const res = await this._prepareImageData({ url: data.content.image.url }, {})
      _.set(data, 'content.image', res)
    }
    if (data.type === CmsBlockType.carousel) {
      for (let i = 0; i < data.content.images.length; i++) {
        const res = await this._prepareImageData({ url: data.content.images[i].url }, {})
        _.set(data, `content.images.${i}`, res)
      }
    }

    return data
  }

  public async findByCode(code: string): Promise<CmsBlock> {
    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return res
  }

  public async create(data: CmsBlockInput): Promise<CmsBlock> {
    data = await this._prepareDataBeforeSave(data)
    return await super.create(data)
  }

  public async updateByCode(code: string, data: CmsBlockInput): Promise<CmsBlock> {
    data = await this._prepareDataBeforeSave(data)
    const block = await this.findByCode(code)
    return await this.update(block.id, data)
  }

  public async deleteByCode(code: string): Promise<CmsBlock> {
    const block = await this.findByCode(code)
    return await this.delete(block.id)
  }

}