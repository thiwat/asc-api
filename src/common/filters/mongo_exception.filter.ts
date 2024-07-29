import { ArgumentsHost, Catch, ConflictException, ExceptionFilter } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { throwError } from '../utils/error';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    switch (exception.code) {
      case 11000:
        throwError(
          'Duplicate unique key',
          'duplicate_unique_key',
          500
        )
    }
  }
}