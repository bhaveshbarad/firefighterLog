import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CallLogsModule } from './call-logs/call-logs.module';
import { ApparatusType } from './entities/apparatus-type.entity';
import { CallLog } from './entities/call-log.entity';
import { CallType } from './entities/call-type.entity';
import { FireStation } from './entities/fire-station.entity';
import { Rank } from './entities/rank.entity';
import { UserFireStation } from './entities/user-fire-station.entity';
import { User } from './entities/user.entity';
import { HealthModule } from './health/health.module';
import { Initial1739120400000 } from './migrations/1739120400000-initial-users-and-call-logs';
import { CallTypesApparatusAndCallLogFields1739120500000 } from './migrations/1739120500000-call-types-apparatus-and-call-log-fields';
import { ProfileRanksFireStations1739120600000 } from './migrations/1739120600000-profile-ranks-fire-stations';
import { ProfileModule } from './profile/profile.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type:           'mysql',
                host:           config.getOrThrow<string>('DATABASE_HOST'),
                port:           Number(config.getOrThrow<string>('DATABASE_PORT')),
                username:       config.getOrThrow<string>('DATABASE_USER'),
                password:       config.getOrThrow<string>('DATABASE_PASSWORD'),
                database:       config.getOrThrow<string>('DATABASE_NAME'),
                entities:       [
                    User,
                    CallLog,
                    CallType,
                    ApparatusType,
                    Rank,
                    FireStation,
                    UserFireStation,
                ],
                migrations:     [
                    Initial1739120400000,
                    CallTypesApparatusAndCallLogFields1739120500000,
                    ProfileRanksFireStations1739120600000,
                ],
                migrationsRun:  true,
                synchronize:    false,
                logging:        config.getOrThrow<string>('NODE_ENV') !== 'production',
            }),
            inject: [ConfigService],
        }),
        HealthModule,
        AuthModule,
        CallLogsModule,
        ProfileModule,
    ],
})
export class AppModule {}
