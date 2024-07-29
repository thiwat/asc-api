import * as _ from 'lodash'

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TranslateInterceptor implements NestInterceptor {
  constructor() { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const headers = context.switchToHttp().getRequest().headers
    const lang = headers?.['accept-language']

    if (!lang || lang === '*') return next.handle()

    return next
      .handle()
      .pipe(
        map(data => {
          if (_.get(data, 'rows')) {
            data.rows = data.rows
              .map(i =>
                _.merge(
                  _.omit(i, ['_translates'])
                  , _.get(i, `_translates.${lang}`)
                )
              )
          }

          return _.merge(
            _.omit(data, ['_translates']),
            _.get(data, `_translates.${lang}`)
          )
        })
      )
  }
}