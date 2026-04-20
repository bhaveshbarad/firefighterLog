import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('apparatus_types')
export class ApparatusType {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    label!: string;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder!: number;
}
