import * as dotenv from 'dotenv'
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { MongoExceptionFilter } from './common/filters/mongo_exception.filter';
import { MaskInterceptor } from './common/interceptors/mask.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { HideInterceptor } from './common/interceptors/hide.interceptor';
import { TranslateInterceptor } from './common/interceptors/translate.interceptor';
import { ApplicationService } from './application/application.service';

dotenv.config()

const PORT = +process.env.PORT || 3000

async function bootstrap() {

  const fAdapt = new FastifyAdapter({
    logger: false,
    bodyLimit: 1048576000
  });
  fAdapt.register(require("@fastify/cors"));

  const app = await NestFactory.create(
    AppModule,
    fAdapt
  );
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health_check', method: RequestMethod.GET }]
  })
  app.enableVersioning({
    type: VersioningType.URI
  })

  app.useGlobalInterceptors(new MaskInterceptor(reflector))
  app.useGlobalInterceptors(new HideInterceptor(reflector))
  app.useGlobalInterceptors(new TranslateInterceptor())
  app.useGlobalGuards(new AuthGuard(reflector, app.get(ApplicationService)))
  app.useGlobalFilters(new MongoExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )

  await app.listen(PORT, '0.0.0.0');
}

bootstrap();