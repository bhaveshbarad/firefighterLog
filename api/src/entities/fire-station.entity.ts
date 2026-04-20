import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserFireStation } from './user-fire-station.entity';

@Entity('fire_stations')
export class FireStation {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 128 })
    town!: string;

    @Column({ type: 'varchar', length: 64 })
    state!: string;

    @Column({ name: 'station_number', type: 'varchar', length: 64 })
    stationNumber!: string;

    @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
    updatedAt!: Date;

    @OneToMany(() => UserFireStation, (ufs) => ufs.fireStation)
    userMemberships!: UserFireStation[];
}
