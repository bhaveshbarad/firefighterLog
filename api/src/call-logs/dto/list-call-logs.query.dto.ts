import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

/**
 * Query parameters for GET /call-logs and GET /call-logs/export (all optional).
 */
function emptyToUndefined({ value }: { value: unknown }): unknown {
    return value === '' ? undefined : value;
}

export class ListCallLogsQueryDto {
    @IsOptional()
    @Transform(emptyToUndefined)
    @IsDateString()
    reportedFrom?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsDateString()
    reportedTo?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString()
    callTypeId?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString()
    apparatusTypeId?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === undefined || value === null) {
            return undefined;
        }
        if (value === 'true' || value === true) {
            return true;
        }
        if (value === 'false' || value === false) {
            return false;
        }
        return undefined;
    })
    @IsBoolean()
    isFalseAlarm?: boolean;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString()
    @MaxLength(500)
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number;
}
