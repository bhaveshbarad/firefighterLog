import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../constants/app.constants';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto): Promise<{
        access_token: string;
        user: { id: string; email: string };
    }> {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }
        const passwordHash  = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user          = await this.usersService.create(dto.email, passwordHash);
        const access_token  = await this.signToken(user.id, user.email);
        return {
            access_token,
            user: { id: user.id, email: user.email },
        };
    }

    async login(dto: LoginDto): Promise<{
        access_token: string;
        user: { id: string; email: string };
    }> {
        const user = await this.usersService.findByEmailWithPasswordHash(
            dto.email,
        );
        if (! user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (! valid) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const access_token = await this.signToken(user.id, user.email);
        return {
            access_token,
            user: { id: user.id, email: user.email },
        };
    }

    private async signToken(userId: string, email: string): Promise<string> {
        const payload = { sub: userId, email };
        return this.jwtService.signAsync(payload);
    }
}
