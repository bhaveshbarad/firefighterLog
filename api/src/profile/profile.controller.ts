import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStationMembershipDto } from './dto/create-station-membership.dto';
import { PatchProfileDto } from './dto/patch-profile.dto';
import { PatchStationMembershipDto } from './dto/patch-station-membership.dto';
import { ProfileService } from './profile.service';

type AuthedRequest = {
    user: { id: string; email: string };
};

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    getProfile(@Req() req: AuthedRequest) {
        return this.profileService.getProfile(req.user.id);
    }

    @Patch()
    patchProfile(@Req() req: AuthedRequest, @Body() dto: PatchProfileDto) {
        return this.profileService.patchProfile(req.user.id, dto);
    }

    @Post('stations')
    addStation(
        @Req() req: AuthedRequest,
        @Body() dto: CreateStationMembershipDto,
    ) {
        return this.profileService.createStationMembership(req.user.id, dto);
    }

    @Patch('stations/:membershipId')
    updateStation(
        @Req() req: AuthedRequest,
        @Param('membershipId') membershipId: string,
        @Body() dto: PatchStationMembershipDto,
    ) {
        return this.profileService.patchStationMembership(
            req.user.id,
            membershipId,
            dto,
        );
    }

    @Delete('stations/:membershipId')
    removeStation(
        @Req() req: AuthedRequest,
        @Param('membershipId') membershipId: string,
    ) {
        return this.profileService.deleteStationMembership(
            req.user.id,
            membershipId,
        );
    }
}
