import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfileRanksFireStations1739120600000 implements MigrationInterface {
    name = 'ProfileRanksFireStations1739120600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`ranks\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`label\` varchar(255) NOT NULL,
                \`sort_order\` int NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        const rankLabels = [
            'Chief',
            'Former Chief',
            'Deputy Chief',
            'Battalion Chief',
            'Lieutenant',
            'Captain',
            'Interior Firefighter',
            'Exterior Firefighter',
            'Probationary',
        ];
        for (let i = 0; i < rankLabels.length; i++) {
            await queryRunner.query(
                `INSERT INTO \`ranks\` (\`label\`, \`sort_order\`) VALUES (?, ?)`,
                [rankLabels[i], i],
            );
        }

        await queryRunner.query(`
            CREATE TABLE \`fire_stations\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`town\` varchar(128) NOT NULL,
                \`state\` varchar(64) NOT NULL,
                \`station_number\` varchar(64) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            ALTER TABLE \`users\`
                ADD \`name\` varchar(255) NULL AFTER \`password_hash\`,
                ADD \`rank_id\` bigint UNSIGNED NULL AFTER \`name\`,
                ADD \`year_started_firefighting\` smallint UNSIGNED NULL AFTER \`rank_id\`
        `);

        await queryRunner.query(`
            ALTER TABLE \`users\`
                ADD CONSTRAINT \`FK_users_rank\`
                    FOREIGN KEY (\`rank_id\`) REFERENCES \`ranks\` (\`id\`)
                    ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            CREATE TABLE \`user_fire_stations\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint UNSIGNED NOT NULL,
                \`fire_station_id\` bigint UNSIGNED NOT NULL,
                \`joined_at\` datetime(6) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`UQ_user_fire_station\` (\`user_id\`, \`fire_station_id\`),
                INDEX \`IDX_user_fire_stations_user\` (\`user_id\`),
                INDEX \`IDX_user_fire_stations_station\` (\`fire_station_id\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_user_fire_stations_user\` FOREIGN KEY (\`user_id\`)
                    REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_user_fire_stations_fire_station\` FOREIGN KEY (\`fire_station_id\`)
                    REFERENCES \`fire_stations\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`user_fire_stations\``);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_rank\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
                DROP COLUMN \`name\`,
                DROP COLUMN \`rank_id\`,
                DROP COLUMN \`year_started_firefighting\`
        `);
        await queryRunner.query(`DROP TABLE \`fire_stations\``);
        await queryRunner.query(`DROP TABLE \`ranks\``);
    }
}
