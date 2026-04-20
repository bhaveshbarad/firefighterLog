import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1739120400000 implements MigrationInterface {
    name = 'Initial1739120400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NOT NULL,
                \`password_hash\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`call_logs\` (
                \`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
                \`user_id\` bigint UNSIGNED NOT NULL,
                \`reported_at\` datetime(6) NOT NULL,
                \`notes\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_call_logs_user_id\` (\`user_id\`),
                INDEX \`IDX_call_logs_user_reported\` (\`user_id\`, \`reported_at\` DESC),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_call_logs_user\` FOREIGN KEY (\`user_id\`)
                    REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`call_logs\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
