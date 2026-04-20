import { Type } from 'class-transformer';
import {
    Allow,
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';

/**
 * Partial profile update. Password and email changes require `currentPassword`.
 */
export class PatchProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string | null;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    newPassword?: string;

    @IsOptional()
    @IsString()
    currentPassword?: string;

    @IsOptional()
    @Allow()
    @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
    @IsString()
    rankId?: string | null;

    @IsOptional()
    @Allow()
    @ValidateIf(
        (_, v) => v !== null && v !== undefined,
    )
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(2100)
    yearStartedFirefighting?: number | null;
}
