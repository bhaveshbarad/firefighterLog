import { MigrationInterface, QueryRunner } from 'typeorm';

export class CallTypesApparatusAndCallLogFields1739120500000
    implements MigrationInterface
{
    name = 'CallTypesApparatusAndCallLogFields1739120500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`call_types\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`label\` varchar(255) NOT NULL,
                \`sort_order\` int NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`apparatus_types\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`label\` varchar(255) NOT NULL,
                \`sort_order\` int NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        const callLabels = [
            'Fire Alarm',
            'CO Alarm',
            'Medical Emergency',
            'Motor Vehicle Accident',
            'Structure Fire',
            'Brush Fire',
            'Report of Smoke',
            'Trapped Victim',
            'Hazmat',
        ];
        for (let i = 0; i < callLabels.length; i++) {
            await queryRunner.query(
                `INSERT INTO \`call_types\` (\`label\`, \`sort_order\`) VALUES (?, ?)`,
                [callLabels[i], i],
            );
        }

        const apparatusLabels = [
            'Ladder/Tower',
            'Engine',
            'Rescue',
            'Tanker',
            'Command Vehicle',
        ];
        for (let i = 0; i < apparatusLabels.length; i++) {
            await queryRunner.query(
                `INSERT INTO \`apparatus_types\` (\`label\`, \`sort_order\`) VALUES (?, ?)`,
                [apparatusLabels[i], i],
            );
        }

        await queryRunner.query(`
            ALTER TABLE \`call_logs\`
                ADD \`title\` varchar(255) NOT NULL DEFAULT '' AFTER \`user_id\`,
                ADD \`call_type_id\` bigint UNSIGNED NULL AFTER \`title\`,
                ADD \`apparatus_type_id\` bigint UNSIGNED NULL AFTER \`call_type_id\`,
                ADD \`is_false_alarm\` tinyint(1) NOT NULL DEFAULT 0 AFTER \`reported_at\`
        `);

        /* First seeded rows have id = 1 after empty tables. */
        await queryRunner.query(`
            UPDATE \`call_logs\`
            SET \`call_type_id\` = 1, \`apparatus_type_id\` = 1
            WHERE \`call_type_id\` IS NULL OR \`apparatus_type_id\` IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE \`call_logs\`
                MODIFY \`call_type_id\` bigint UNSIGNED NOT NULL,
                MODIFY \`apparatus_type_id\` bigint UNSIGNED NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE \`call_logs\`
                ADD CONSTRAINT \`FK_call_logs_call_type\`
                    FOREIGN KEY (\`call_type_id\`) REFERENCES \`call_types\` (\`id\`)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
                ADD CONSTRAINT \`FK_call_logs_apparatus_type\`
                    FOREIGN KEY (\`apparatus_type_id\`) REFERENCES \`apparatus_types\` (\`id\`)
                    ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`call_logs\`
                DROP FOREIGN KEY \`FK_call_logs_call_type\`,
                DROP FOREIGN KEY \`FK_call_logs_apparatus_type\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`call_logs\`
                DROP COLUMN \`title\`,
                DROP COLUMN \`call_type_id\`,
                DROP COLUMN \`apparatus_type_id\`,
                DROP COLUMN \`is_false_alarm\`
        `);
        await queryRunner.query(`DROP TABLE \`apparatus_types\``);
        await queryRunner.query(`DROP TABLE \`call_types\``);
    }
}
