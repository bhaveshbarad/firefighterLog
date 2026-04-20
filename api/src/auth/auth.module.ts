import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_EXPIRES_IN } from '../constants/app.constants';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports:    [ConfigModule],
            useFactory: (config: ConfigService) => ({
                secret:         config.getOrThrow<string>('JWT_SECRET'),
                signOptions:    { expiresIn: JWT_EXPIRES_IN },
            }),
            inject:     [ConfigService],
        }),
    ],
    controllers:    [AuthController],
    providers:      [AuthService, JwtStrategy],
    exports:        [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
