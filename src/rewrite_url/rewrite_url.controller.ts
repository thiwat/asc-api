import * as _ from 'lodash'
import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";
import { RewriteUrlService } from './rewrite_url.service';
import { Public } from 'src/common/decorators/public.decorator';
import { RewriteUrl } from './rewrite_url.schema';

@Controller({
  path: 'rewrite_url',
  version: '1'
})
export class RewriteUrlController {
  constructor(protected readonly service: RewriteUrlService) { }

  @Public()
  @Get('/:path')
  async list(
    @Param('path') path: string
  ): Promise<RewriteUrl> {
    return this.service.getRewriteUrl({ path })
  }
}