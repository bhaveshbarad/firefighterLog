import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BCRYPT_ROUNDS } from '../constants/app.constants';
import { FireStation } from '../entities/fire-station.entity';
import { Rank } from '../entities/rank.entity';
import { User } from '../entities/user.entity';
import { UserFireStation } from '../entities/user-fire-station.entity';
import { CreateFireStationDto } from './dto/create-fire-station.dto';
import { CreateStationMembershipDto } from './dto/create-station-membership.dto';
import { PatchProfileDto } from './dto/patch-profile.dto';
import { PatchStationMembershipDto } from './dto/patch-station-membership.dto';

export type ProfileResponse = {
    id:                       string;
    email:                    string;
    name:                     string | null;
    rank:                     { id: string; label: string } | null;
    yearStartedFirefighting:  number | null;
    stationMemberships:       {
        id:           string;
        joinedAt:     string;
        fireStation:  {
            id:             string;
            name:           string;
            town:           string;
            state:          string;
            stationNumber:  string;
        };
    }[];
};

export type PatchProfileResult = {
    profile:       ProfileResponse;
    access_token?: string;
};

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Rank)
        private readonly ranksRepo: Repository<Rank>,
        @InjectRepository(FireStation)
        private readonly fireStationsRepo: Repository<FireStation>,
        @InjectRepository(UserFireStation)
        private readonly userFireStationsRepo: Repository<UserFireStation>,
        private readonly jwtService: JwtService,
    ) {}

    async getProfile(userId: string): Promise<ProfileResponse> {
        const user = await this.loadUserForProfile(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.toProfileResponse(user);
    }

    async patchProfile(
        userId: string,
        dto: PatchProfileDto,
    ): Promise<PatchProfileResult> {
        const user = await this.usersRepo.findOne({
            where:      { id: userId },
            select:     [
                'id',
                'email',
                'passwordHash',
                'name',
                'rankId',
                'yearStartedFirefighting',
            ],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const wantsEmailChange =
            dto.email !== undefined &&
            dto.email.trim().toLowerCase() !== user.email;
        const wantsPasswordChange =
            dto.newPassword !== undefined && dto.newPassword.length > 0;

        if (wantsEmailChange || wantsPasswordChange) {
            if (!dto.currentPassword) {
                throw new BadRequestException(
                    'currentPassword is required to change email or password',
                );
            }
            const ok = await bcrypt.compare(
                dto.currentPassword,
                user.passwordHash,
            );
            if (!ok) {
                throw new UnauthorizedException('Current password is incorrect');
            }
        }

        if (dto.name !== undefined) {
            const t = dto.name?.trim();
            user.name = t === '' || t === undefined ? null : t;
        }

        if (dto.yearStartedFirefighting !== undefined) {
            user.yearStartedFirefighting = dto.yearStartedFirefighting;
        }

        if (dto.rankId !== undefined) {
            if (
                dto.rankId === null ||
                (typeof dto.rankId === 'string' && dto.rankId.trim() === '')
            ) {
                user.rankId = null;
            } else {
                const rank = await this.ranksRepo.findOne({
                    where: { id: dto.rankId },
                });
                if (!rank) {
                    throw new BadRequestException('Invalid rank');
                }
                user.rankId = dto.rankId;
            }
        }

        if (wantsPasswordChange) {
            user.passwordHash = await bcrypt.hash(
                dto.newPassword!,
                BCRYPT_ROUNDS,
            );
        }

        let emailChanged = false;
        if (wantsEmailChange) {
            const nextEmail = dto.email!.trim().toLowerCase();
            const taken = await this.usersRepo.findOne({
                where: { email: nextEmail },
            });
            if (taken && taken.id !== user.id) {
                throw new ConflictException('Email already in use');
            }
            user.email = nextEmail;
            emailChanged = true;
        }

        await this.usersRepo.save(user);

        const fresh = await this.loadUserForProfile(user.id);
        const profile = this.toProfileResponse(fresh!);

        let access_token: string | undefined;
        if (emailChanged) {
            access_token = await this.jwtService.signAsync({
                sub:   user.id,
                email: user.email,
            });
        }

        return { profile, access_token };
    }

    async listRanks(): Promise<{ id: string; label: string }[]> {
        const rows = await this.ranksRepo.find({
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
        return rows.map((r) => ({ id: r.id, label: r.label }));
    }

    async listFireStations(): Promise<
        {
            id:             string;
            name:           string;
            town:           string;
            state:          string;
            stationNumber:  string;
        }[]
    > {
        const rows = await this.fireStationsRepo.find({
            order: { name: 'ASC', id: 'ASC' },
        });
        return rows.map((s) => ({
            id:             s.id,
            name:           s.name,
            town:           s.town,
            state:          s.state,
            stationNumber:  s.stationNumber,
        }));
    }

    async createFireStation(
        dto: CreateFireStationDto,
    ): Promise<{
        id:             string;
        name:           string;
        town:           string;
        state:          string;
        stationNumber:  string;
    }> {
        const row = this.fireStationsRepo.create({
            name:           dto.name.trim(),
            town:           dto.town.trim(),
            state:          dto.state.trim(),
            stationNumber:  dto.stationNumber.trim(),
        });
        const saved = await this.fireStationsRepo.save(row);
        return {
            id:             saved.id,
            name:           saved.name,
            town:           saved.town,
            state:          saved.state,
            stationNumber:  saved.stationNumber,
        };
    }

    async createStationMembership(
        userId: string,
        dto: CreateStationMembershipDto,
    ): Promise<ProfileResponse> {
        const station = await this.fireStationsRepo.findOne({
            where: { id: dto.fireStationId },
        });
        if (!station) {
            throw new NotFoundException('Fire station not found');
        }

        const dup = await this.userFireStationsRepo.findOne({
            where: {
                userId:         userId,
                fireStationId:  dto.fireStationId,
            },
        });
        if (dup) {
            throw new ConflictException(
                'You are already linked to this fire station',
            );
        }

        const joinedAt = new Date(dto.joinedAt);
        if (Number.isNaN(joinedAt.getTime())) {
            throw new BadRequestException('Invalid joinedAt');
        }

        const row = this.userFireStationsRepo.create({
            userId,
            fireStationId: dto.fireStationId,
            joinedAt,
        });
        await this.userFireStationsRepo.save(row);

        const user = await this.loadUserForProfile(userId);
        return this.toProfileResponse(user!);
    }

    async patchStationMembership(
        userId: string,
        membershipId: string,
        dto: PatchStationMembershipDto,
    ): Promise<ProfileResponse> {
        const m = await this.userFireStationsRepo.findOne({
            where: { id: membershipId },
        });
        if (!m || m.userId !== userId) {
            throw new NotFoundException('Membership not found');
        }

        if (dto.fireStationId !== undefined) {
            const station = await this.fireStationsRepo.findOne({
                where: { id: dto.fireStationId },
            });
            if (!station) {
                throw new NotFoundException('Fire station not found');
            }
            const dup = await this.userFireStationsRepo.findOne({
                where: {
                    userId,
                    fireStationId: dto.fireStationId,
                },
            });
            if (dup && dup.id !== membershipId) {
                throw new ConflictException(
                    'You are already linked to this fire station',
                );
            }
            m.fireStationId = dto.fireStationId;
        }

        if (dto.joinedAt !== undefined) {
            const joinedAt = new Date(dto.joinedAt);
            if (Number.isNaN(joinedAt.getTime())) {
                throw new BadRequestException('Invalid joinedAt');
            }
            m.joinedAt = joinedAt;
        }

        await this.userFireStationsRepo.save(m);

        const user = await this.loadUserForProfile(userId);
        return this.toProfileResponse(user!);
    }

    async deleteStationMembership(
        userId: string,
        membershipId: string,
    ): Promise<ProfileResponse> {
        const m = await this.userFireStationsRepo.findOne({
            where: { id: membershipId },
        });
        if (!m || m.userId !== userId) {
            throw new NotFoundException('Membership not found');
        }
        await this.userFireStationsRepo.remove(m);

        const user = await this.loadUserForProfile(userId);
        return this.toProfileResponse(user!);
    }

    private async loadUserForProfile(id: string): Promise<User | null> {
        return this.usersRepo.findOne({
            where:      { id },
            relations:  [
                'rank',
                'fireStationMemberships',
                'fireStationMemberships.fireStation',
            ],
        });
    }

    private toProfileResponse(user: User): ProfileResponse {
        const memberships = (user.fireStationMemberships ?? [])
            .slice()
            .sort((a, b) =>
                BigInt(a.id) < BigInt(b.id)
                    ? -1
                    : BigInt(a.id) > BigInt(b.id)
                      ? 1
                      : 0,
            )
            .map((m) => ({
                id:       m.id,
                joinedAt: m.joinedAt.toISOString(),
                fireStation: {
                    id:             m.fireStation.id,
                    name:           m.fireStation.name,
                    town:           m.fireStation.town,
                    state:          m.fireStation.state,
                    stationNumber:  m.fireStation.stationNumber,
                },
            }));

        return {
            id:                      user.id,
            email:                   user.email,
            name:                    user.name,
            rank:                    user.rank
                ? { id: user.rank.id, label: user.rank.label }
                : null,
            yearStartedFirefighting: user.yearStartedFirefighting,
            stationMemberships:      memberships,
        };
    }
}
