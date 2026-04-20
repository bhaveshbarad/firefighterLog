import { DataSource } from 'typeorm';
import { ApparatusType } from './entities/apparatus-type.entity';
import { CallLog } from './entities/call-log.entity';
import { CallType } from './entities/call-type.entity';
import { FireStation } from './entities/fire-station.entity';
import { Rank } from './entities/rank.entity';
import { UserFireStation } from './entities/user-fire-station.entity';
import { User } from './entities/user.entity';
import { Initial1739120400000 } from './migrations/1739120400000-initial-users-and-call-logs';
import { CallTypesApparatusAndCallLogFields1739120500000 } from './migrations/1739120500000-call-types-apparatus-and-call-log-fields';
import { ProfileRanksFireStations1739120600000 } from './migrations/1739120600000-profile-ranks-fire-stations';

/**
 * TypeORM CLI data source (e.g. npm run migration:run).
 * Keep in sync with {@link AppModule} TypeORM options.
 */
export const AppDataSource = new DataSource({
    type:                   'mysql',
    host:                   process.env.DATABASE_HOST ?? '127.0.0.1',
    port:                   Number(process.env.DATABASE_PORT ?? 3306),
    username:               process.env.DATABASE_USER ?? 'app',
    password:               process.env.DATABASE_PASSWORD ?? 'apppass',
    database:               process.env.DATABASE_NAME ?? 'firefighter_log',
    entities:               [
        User,
        CallLog,
        CallType,
        ApparatusType,
        Rank,
        FireStation,
        UserFireStation,
    ],
    migrations:             [
        Initial1739120400000,
        CallTypesApparatusAndCallLogFields1739120500000,
        ProfileRanksFireStations1739120600000,
    ],
    migrationsTableName:    'typeorm_migrations',
});
