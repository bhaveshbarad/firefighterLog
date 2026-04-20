import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ranks')
export class Rank {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    label!: string;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder!: number;
}
