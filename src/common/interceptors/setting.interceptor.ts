import * as _ from 'lodash'

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SettingInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ignore = this.reflector.get<boolean>('ignore_format', context.getHandler());
    if (ignore) return next.handle()

    return next
      .handle()
      .pipe(
        map(data => {
          if (_.isArray(data)) {
            return data.map(i => _.omit(i, ['type', 'key', 'id']))
          }

          return _.omit(data, ['type', 'key', 'id'])
        })
      );
  }
}