import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateCallLogDto {
    @IsString()
    @MaxLength(255)
    title!: string;

    @IsDateString()
    reportedAt!: string;

    @IsString()
    callTypeId!: string;

    @IsString()
    apparatusTypeId!: string;

    @Type(() => Boolean)
    @IsBoolean()
    isFalseAlarm!: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(65535)
    notes?: string;
}
