import { IsDateString, IsString } from 'class-validator';

export class CreateStationMembershipDto {
    @IsString()
    fireStationId!: string;

    @IsDateString()
    joinedAt!: string;
}
