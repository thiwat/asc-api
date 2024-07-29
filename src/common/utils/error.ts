import { HttpException } from "@nestjs/common";
import * as _ from 'lodash';

export const throwError = (
  message: string | string[],
  code: string,
  statusCode?: number,
  info?: any,
  extra?: any,
) => {
  throw new HttpException({
    statusCode: statusCode || 400,
    code: code || '',
    message: _.isArray(message) ? message : [message],
    additional_info: info || {},
    error: '',
    ...extra
  }, statusCode || 400);
};