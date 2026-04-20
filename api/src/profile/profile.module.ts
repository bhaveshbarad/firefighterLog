import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { FireStation } from '../entities/fire-station.entity';
import { Rank } from '../entities/rank.entity';
import { User } from '../entities/user.entity';
import { UserFireStation } from '../entities/user-fire-station.entity';
import { ProfileLookupsController } from './profile-lookups.controller';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Rank,
            FireStation,
            UserFireStation,
        ]),
        AuthModule,
    ],
    controllers: [ProfileController, ProfileLookupsController],
    providers:   [ProfileService],
})
export class ProfileModule {}
