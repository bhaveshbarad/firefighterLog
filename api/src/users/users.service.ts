import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {}

    async findById(id: string): Promise<User | null> {
        return this.usersRepo.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalized = email.trim().toLowerCase();
        return this.usersRepo.findOne({ where: { email: normalized } });
    }

    async findByEmailWithPasswordHash(
        email: string,
    ): Promise<User | null> {
        const normalized = email.trim().toLowerCase();
        return this.usersRepo.findOne({
            where: { email: normalized },
            select: ['id', 'email', 'passwordHash', 'createdAt', 'updatedAt'],
        });
    }

    async create(email: string, passwordHash: string): Promise<User> {
        const user = this.usersRepo.create({
            email: email.trim().toLowerCase(),
            passwordHash,
        });
        return this.usersRepo.save(user);
    }
}
