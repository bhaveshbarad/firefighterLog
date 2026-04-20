import 'reflect-metadata';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const DEFAULT_COUNT = 200;
const MAX_COUNT     = 10_000;
const BATCH_SIZE    = 50;

const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;

const STREETS = [
    'Oak St',
    'Main St',
    'Elm Ave',
    'Park Rd',
    'Industrial Blvd',
    'Hwy 9 / MM 12',
    'Cedar Ln',
    'River Rd',
    'School St',
    'Maple Dr',
];

const UNITS = ['E12', 'E14', 'L1', 'R3', 'T2', 'CMD'];

const NOTE_POOL: (string | null)[] = [
    null,
    null,
    'Cleared on arrival.',
    'PD on scene.',
    'Transferred to EMS.',
    'No extension.',
    'Alarm reset by keyholder.',
    'Investigated — negative.',
    'Ventilation complete.',
    'Scene turned over to PD.',
];

/**
 * Load `api/.env` into `process.env` when keys are unset (dev convenience).
 */
function loadEnvFile(): void {
    const envPath = resolve(__dirname, '../.env');
    if (!existsSync(envPath)) {
        return;
    }
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        const eq = trimmed.indexOf('=');
        if (eq === -1) {
            continue;
        }
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
            process.env[key] = val;
        }
    }
}

function printUsage(): void {
    console.error(
        'Usage: npm run seed:call-logs -- --user-id <id> [--count <n>]\n' +
            `  --user-id  (required) Target users.id\n` +
            `  --count    (optional) Rows to insert (default ${DEFAULT_COUNT}, max ${MAX_COUNT})`,
    );
}

function parsePositiveInt(s: string, label: string): number {
    const n = Number.parseInt(s, 10);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error(`${label} must be a positive integer`);
    }
    return n;
}

function parseCli(argv: string[]): { userId: string; count: number } {
    let userId: string | undefined;
    let count:   number | undefined;

    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--user-id') {
            userId = argv[++i];
        } else if (a === '--count') {
            count = parsePositiveInt(argv[++i] ?? '', 'count');
        } else if (a === '--help' || a === '-h') {
            printUsage();
            process.exit(0);
        }
    }

    if (!userId) {
        printUsage();
        process.exit(1);
    }
    parsePositiveInt(userId, 'user-id');

    const finalCount = count ?? DEFAULT_COUNT;
    if (finalCount > MAX_COUNT) {
        console.error(`count must be at most ${MAX_COUNT}`);
        process.exit(1);
    }

    return { userId, count: finalCount };
}

/** Mulberry32 PRNG when SEED env is a non-empty integer string. */
function createRng(): () => number {
    const raw = process.env.SEED?.trim();
    if (raw === undefined || raw === '') {
        return Math.random;
    }
    let seed = Number.parseInt(raw, 10) >>> 0;
    if (!Number.isFinite(seed)) {
        return Math.random;
    }
    return function mulberry32(): number {
        seed += 0x6d2b79f5;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick<T>(arr: T[], rng: () => number): T {
    return arr[Math.floor(rng() * arr.length)]!;
}

function randomReportedAt(
    startMs: number,
    endMs: number,
    rng: () => number,
): Date {
    const t = startMs + rng() * (endMs - startMs);
    const d = new Date(t);
    if (rng() < 0.72) {
        d.setUTCHours(8 + Math.floor(rng() * 14), Math.floor(rng() * 60), Math.floor(rng() * 60), Math.floor(rng() * 1000));
    }
    return d;
}

function buildTitle(
    callTypeLabel: string,
    rng: () => number,
): string {
    const street = pick(STREETS, rng);
    const unit = rng() > 0.4 ? ` — ${pick(UNITS, rng)}` : '';
    const variants = [
        `${street} — ${callTypeLabel}${unit}`,
        `${callTypeLabel} — ${street}${unit}`,
        `${callTypeLabel} (${street})`,
    ];
    let title = pick(variants, rng);
    if (title.length > 255) {
        title = title.slice(0, 252) + '…';
    }
    return title;
}

type LookupRow = { id: string; label: string };

async function main(): Promise<void> {
    loadEnvFile();
    const { userId, count: rowCount } = parseCli(process.argv);

    const { AppDataSource } = await import('../src/data-source');
    await AppDataSource.initialize();

    const rng = createRng();

    try {
        const userRows = await AppDataSource.query<{ id: string }[]>(
            'SELECT `id` FROM `users` WHERE `id` = ? LIMIT 1',
            [userId],
        );
        if (!userRows || userRows.length === 0) {
            console.error(`No user found with id=${userId}`);
            process.exit(1);
        }

        const callTypes = await AppDataSource.query<LookupRow[]>(
            'SELECT `id`, `label` FROM `call_types` ORDER BY `id` ASC',
        );
        const apparatusTypes = await AppDataSource.query<LookupRow[]>(
            'SELECT `id`, `label` FROM `apparatus_types` ORDER BY `id` ASC',
        );

        if (callTypes.length === 0 || apparatusTypes.length === 0) {
            console.error('call_types or apparatus_types is empty. Run migrations.');
            process.exit(1);
        }

        const endMs = Date.now();
        const startMs = endMs - THREE_YEARS_MS;

        let inserted = 0;
        while (inserted < rowCount) {
            const batchLen = Math.min(BATCH_SIZE, rowCount - inserted);
            const placeholders: string[] = [];
            const params: unknown[]       = [];

            for (let b = 0; b < batchLen; b++) {
                const ct = pick(callTypes, rng);
                const at = pick(apparatusTypes, rng);
                const reportedAt = randomReportedAt(startMs, endMs, rng);
                const isFalseAlarm = rng() < 0.12;
                const notesVal = pick(NOTE_POOL, rng);
                const title = buildTitle(ct.label, rng);
                const createdAt = reportedAt;

                placeholders.push(
                    '(?, ?, ?, ?, ?, ?, ?, ?, ?)',
                );
                params.push(
                    userId,
                    title,
                    ct.id,
                    at.id,
                    reportedAt,
                    isFalseAlarm ? 1 : 0,
                    notesVal,
                    createdAt,
                    createdAt,
                );
            }

            const sql =
                'INSERT INTO `call_logs` (`user_id`, `title`, `call_type_id`, ' +
                '`apparatus_type_id`, `reported_at`, `is_false_alarm`, `notes`, ' +
                '`created_at`, `updated_at`) VALUES ' +
                placeholders.join(', ');

            await AppDataSource.query(sql, params);
            inserted += batchLen;
        }

        console.log(
            `Inserted ${rowCount} call_logs for user_id=${userId} ` +
                `(reported_at spread ~3 years, ending now).`,
        );
    } finally {
        await AppDataSource.destroy();
    }
}

main().catch((e: unknown) => {
    console.error(e);
    process.exit(1);
});
