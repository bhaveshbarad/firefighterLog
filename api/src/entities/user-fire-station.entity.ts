import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { FireStation } from './fire-station.entity';
import { User } from './user.entity';

@Entity('user_fire_stations')
@Unique('UQ_user_fire_station', ['userId', 'fireStationId'])
export class UserFireStation {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId!: string;

    @ManyToOne(() => User, (user) => user.fireStationMemberships, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'fire_station_id', type: 'bigint', unsigned: true })
    fireStationId!: string;

    @ManyToOne(() => FireStation, (fs) => fs.userMemberships, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'fire_station_id' })
    fireStation!: FireStation;

    @Column({ name: 'joined_at', type: 'datetime', precision: 6 })
    joinedAt!: Date;

    @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
    updatedAt!: Date;
}
