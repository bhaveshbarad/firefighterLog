import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { ApparatusType } from '../entities/apparatus-type.entity';
import { CallLog } from '../entities/call-log.entity';
import { CallType } from '../entities/call-type.entity';
import {
    CALL_LOG_DEFAULT_LIST_LIMIT,
    CALL_LOG_EXPORT_ROW_CAP,
    CALL_LOG_MAX_LIST_LIMIT,
} from '../constants/app.constants';
import type { CreateCallLogDto } from './dto/create-call-log.dto';
import type { ListCallLogsQueryDto } from './dto/list-call-logs.query.dto';

export type CallLogListItem = {
    id:              string;
    title:           string;
    reportedAt:      string;
    isFalseAlarm:    boolean;
    notes:           string | null;
    callType:        { id: string; label: string };
    apparatusType:   { id: string; label: string };
};

export type CallLogListResponse = {
    items:    CallLogListItem[];
    total:    number;
    offset:   number;
    limit:    number;
    hasMore:  boolean;
};

/**
 * Escape user text for use inside a MySQL LIKE pattern when the query uses
 * ESCAPE '\\'. Without escaping, % and _ are LIKE wildcards; backslashes start
 * escape sequences. Order: backslashes first, then % and _, so inserted backslashes
 * are not mis-handled.
 */
function escapeMysqlLikePattern(raw: string): string {
    return raw
        .replace(/\\/g, '\\\\') // Literal backslash in the user's search text (must run first).
        .replace(/%/g, '\\%')   // % matches any length in LIKE unless escaped to a literal percent.
        .replace(/_/g, '\\_');  // _ matches a single character in LIKE unless escaped to a literal underscore.
}

function csvEscapeCell(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function parseReportedBounds(filters: ListCallLogsQueryDto): {
    reportedFromDate: Date | undefined;
    reportedToDate:   Date | undefined;
} {
    let reportedFromDate: Date | undefined;
    let reportedToDate:   Date | undefined;

    if (filters.reportedFrom !== undefined && filters.reportedFrom !== '') {
        reportedFromDate = new Date(filters.reportedFrom);
        if (Number.isNaN(reportedFromDate.getTime())) {
            throw new BadRequestException('Invalid reportedFrom');
        }
    }
    if (filters.reportedTo !== undefined && filters.reportedTo !== '') {
        reportedToDate = new Date(filters.reportedTo);
        if (Number.isNaN(reportedToDate.getTime())) {
            throw new BadRequestException('Invalid reportedTo');
        }
    }
    if (reportedFromDate && reportedToDate && reportedFromDate > reportedToDate) {
        throw new BadRequestException(
            'reportedFrom must be before or equal to reportedTo',
        );
    }

    return { reportedFromDate, reportedToDate };
}

@Injectable()
export class CallLogsService {
    constructor (
        @InjectRepository(CallLog)
        private readonly callLogsRepo: Repository<CallLog>,
        @InjectRepository(CallType)
        private readonly callTypeRepo: Repository<CallType>,
        @InjectRepository(ApparatusType)
        private readonly apparatusTypeRepo: Repository<ApparatusType>,
    ) {}

    async countForUser(userId: string): Promise<number> {
        return this.callLogsRepo.count({ where: { userId } });
    }

    async listCallTypes(): Promise<{ id: string; label: string }[]> {
        const rows = await this.callTypeRepo.find({
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
        return rows.map((r) => ({ id: r.id, label: r.label }));
    }

    async listApparatusTypes(): Promise<{ id: string; label: string }[]> {
        const rows = await this.apparatusTypeRepo.find({
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
        return rows.map((r) => ({ id: r.id, label: r.label }));
    }

    private mapLogToListItem(log: CallLog): CallLogListItem {
        return {
            id:            log.id,
            title:         log.title,
            reportedAt:    log.reportedAt.toISOString(),
            isFalseAlarm:  log.isFalseAlarm,
            notes:         log.notes,
            callType:      {
                id:    log.callType.id,
                label: log.callType.label,
            },
            apparatusType: {
                id:    log.apparatusType.id,
                label: log.apparatusType.label,
            },
        };
    }

    /**
     * Shared WHERE clauses for list/export (no joins required).
     */
    private applyCallLogFilters(
        qb: SelectQueryBuilder<CallLog>,
        userId: string,
        filters: ListCallLogsQueryDto,
        bounds: { reportedFromDate?: Date; reportedToDate?: Date },
    ): void {
        qb.where('log.userId = :userId', { userId });

        if (bounds.reportedFromDate) {
            qb.andWhere('log.reportedAt >= :reportedFrom', {
                reportedFrom: bounds.reportedFromDate,
            });
        }
        if (bounds.reportedToDate) {
            qb.andWhere('log.reportedAt <= :reportedTo', {
                reportedTo: bounds.reportedToDate,
            });
        }
        if (filters.callTypeId) {
            qb.andWhere('log.callTypeId = :callTypeId', {
                callTypeId: filters.callTypeId,
            });
        }
        if (filters.apparatusTypeId) {
            qb.andWhere('log.apparatusTypeId = :apparatusTypeId', {
                apparatusTypeId: filters.apparatusTypeId,
            });
        }
        if (filters.isFalseAlarm !== undefined) {
            qb.andWhere('log.isFalseAlarm = :isFalseAlarm', {
                isFalseAlarm: filters.isFalseAlarm,
            });
        }

        const search = filters.search?.trim();
        if (search) {
            const pat = `%${escapeMysqlLikePattern(search.toLowerCase())}%`;
            qb.andWhere(
                new Brackets((sub) => {
                    sub
                        .where(
                            "LOWER(log.title) LIKE :searchPat ESCAPE '\\\\'",
                            { searchPat: pat },
                        )
                        .orWhere(
                            "LOWER(IFNULL(log.notes, '')) LIKE :searchPat " +
                                "ESCAPE '\\\\'",
                            { searchPat: pat },
                        );
                }),
            );
        }
    }

    async listForUser(
        userId: string,
        filters: ListCallLogsQueryDto,
    ): Promise<CallLogListResponse> {
        const bounds = parseReportedBounds(filters);

        const offset = filters.offset ?? 0;
        const limit = Math.min(
            filters.limit ?? CALL_LOG_DEFAULT_LIST_LIMIT,
            CALL_LOG_MAX_LIST_LIMIT,
        );

        const countQb = this.callLogsRepo.createQueryBuilder('log');
        this.applyCallLogFilters(countQb, userId, filters, bounds);
        const total = await countQb.getCount();

        const listQb = this.callLogsRepo
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.callType', 'callType')
            .leftJoinAndSelect('log.apparatusType', 'apparatusType');
        this.applyCallLogFilters(listQb, userId, filters, bounds);

        const rows = await listQb
            .orderBy('log.reportedAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();

        const items = rows.map((log) => this.mapLogToListItem(log));
        const hasMore = offset + items.length < total;

        return {
            items,
            total,
            offset,
            limit,
            hasMore,
        };
    }

    async findOneForUser(userId: string, id: string): Promise<CallLogListItem> {
        const log = await this.callLogsRepo.findOne({
            where:      { id, userId },
            relations:  ['callType', 'apparatusType'],
        });
        if (!log) {
            throw new NotFoundException('Call log not found');
        }
        return this.mapLogToListItem(log);
    }

    /**
     * CSV export for the same filters as the list (up to CALL_LOG_EXPORT_ROW_CAP rows).
     */
    async exportCsvForUser(
        userId: string,
        filters: ListCallLogsQueryDto,
    ): Promise<string> {
        const bounds = parseReportedBounds(filters);

        const listQb = this.callLogsRepo
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.callType', 'callType')
            .leftJoinAndSelect('log.apparatusType', 'apparatusType');
        this.applyCallLogFilters(listQb, userId, filters, bounds);

        const rows = await listQb
            .orderBy('log.reportedAt', 'DESC')
            .take(CALL_LOG_EXPORT_ROW_CAP)
            .getMany();

        const header = [
            'ID',
            'Title',
            'Reported At',
            'False Alarm?',
            'Call Type',
            'Apparatus',
            'Notes',
        ].join(',');

        const lines = rows.map((log) =>
            [
                csvEscapeCell(log.id),
                csvEscapeCell(log.title),
                csvEscapeCell(log.reportedAt.toISOString()),
                csvEscapeCell(String(log.isFalseAlarm)),
                csvEscapeCell(log.callType.label),
                csvEscapeCell(log.apparatusType.label),
                csvEscapeCell(log.notes ?? ''),
            ].join(','),
        );

        return [header, ...lines].join('\r\n');
    }

    async create(
        userId: string,
        dto:    CreateCallLogDto,
    ): Promise<{
        id:              string;
        title:           string;
        reportedAt:      string;
        isFalseAlarm:    boolean;
        notes:             string | null;
        callType:        { id: string; label: string };
        apparatusType:   { id: string; label: string };
    }> {
        const [ct, at] = await Promise.all([
            this.callTypeRepo.findOne({ where: { id: dto.callTypeId } }),
            this.apparatusTypeRepo.findOne({
                where: { id: dto.apparatusTypeId },
            }),
        ]);
        if (!ct) {
            throw new BadRequestException('Invalid call type');
        }
        if (!at) {
            throw new BadRequestException('Invalid apparatus type');
        }

        const reported = new Date(dto.reportedAt);
        if (Number.isNaN(reported.getTime())) {
            throw new BadRequestException('Invalid reportedAt');
        }

        const entity = this.callLogsRepo.create({
            userId,
            title:           dto.title,
            callTypeId:      dto.callTypeId,
            apparatusTypeId: dto.apparatusTypeId,
            reportedAt:      reported,
            isFalseAlarm:    dto.isFalseAlarm,
            notes:           dto.notes ?? null,
        });

        const saved = await this.callLogsRepo.save(entity);

        return {
            id:            saved.id,
            title:         saved.title,
            reportedAt:    saved.reportedAt.toISOString(),
            isFalseAlarm:  saved.isFalseAlarm,
            notes:         saved.notes,
            callType:      { id: ct.id, label: ct.label },
            apparatusType: { id: at.id, label: at.label },
        };
    }
}
