import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PatchStationMembershipDto {
    @IsOptional()
    @IsString()
    fireStationId?: string;

    @IsOptional()
    @IsDateString()
    joinedAt?: string;
}
