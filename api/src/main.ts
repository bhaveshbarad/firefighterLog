import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DEFAULT_HTTP_PORT } from './constants/app.constants';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist:              true,
            forbidNonWhitelisted:   true,
            transform:              true,
        }),
    );
    const port = Number(process.env.PORT ?? DEFAULT_HTTP_PORT);
    await app.listen(port);
}

bootstrap();
