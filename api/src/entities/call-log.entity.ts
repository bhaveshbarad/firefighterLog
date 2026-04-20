import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApparatusType } from './apparatus-type.entity';
import { CallType } from './call-type.entity';
import { User } from './user.entity';

@Entity('call_logs')
@Index('IDX_call_logs_user_reported', ['userId', 'reportedAt'])
export class CallLog {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 255, default: '' })
    title!: string;

    @Column({ name: 'call_type_id', type: 'bigint', unsigned: true })
    callTypeId!: string;

    @ManyToOne(() => CallType, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'call_type_id' })
    callType!: CallType;

    @Column({ name: 'apparatus_type_id', type: 'bigint', unsigned: true })
    apparatusTypeId!: string;

    @ManyToOne(() => ApparatusType, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'apparatus_type_id' })
    apparatusType!: ApparatusType;

    @Column({ name: 'reported_at', type: 'datetime', precision: 6 })
    reportedAt!: Date;

    @Column({ name: 'is_false_alarm', type: 'boolean', default: false })
    isFalseAlarm!: boolean;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
    updatedAt!: Date;
}
