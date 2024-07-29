import * as _ from 'lodash'
import { Injectable } from "@nestjs/common";
import { Logger } from 'winston';
import logger from 'src/common/utils/logger';
import { GetProfileOutput } from './line.dto';

@Injectable()
export class LineService {
  private logger: Logger
  constructor() {
    this.logger = logger.child({ service: this.constructor.name })
  }

  public async getProfile(lineToken: string): Promise<GetProfileOutput> {
    return {
      sub: '123456',
      name: 'Thiwat N',
      picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
  }
}