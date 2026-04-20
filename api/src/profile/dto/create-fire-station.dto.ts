import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFireStationDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(128)
    town!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(64)
    state!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(64)
    stationNumber!: string;
}
