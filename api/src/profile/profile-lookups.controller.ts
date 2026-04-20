import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFireStationDto } from './dto/create-fire-station.dto';
import { ProfileService } from './profile.service';

/**
 * Rank and fire-station directory (JWT), same pattern as call-types lookups.
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class ProfileLookupsController {
    constructor(private readonly profileService: ProfileService) {}

    @Get('ranks')
    listRanks() {
        return this.profileService.listRanks();
    }

    @Get('fire-stations')
    listFireStations() {
        return this.profileService.listFireStations();
    }

    @Post('fire-stations')
    createFireStation(@Body() dto: CreateFireStationDto) {
        return this.profileService.createFireStation(dto);
    }
}
