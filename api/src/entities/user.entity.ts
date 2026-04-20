import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Rank } from './rank.entity';
import { UserFireStation } from './user-fire-station.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name!: string | null;

    @Column({ name: 'rank_id', type: 'bigint', unsigned: true, nullable: true })
    rankId!: string | null;

    @ManyToOne(() => Rank, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'rank_id' })
    rank!: Rank | null;

    @Column({
        name:               'year_started_firefighting',
        type:               'smallint',
        unsigned:           true,
        nullable:           true,
    })
    yearStartedFirefighting!: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
    updatedAt!: Date;

    @OneToMany(() => UserFireStation, (m) => m.user)
    fireStationMemberships!: UserFireStation[];
}
