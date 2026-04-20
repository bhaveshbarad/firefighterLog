import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CallLogsService } from './call-logs.service';

type AuthedRequest = {
    user: { id: string; email: string };
};

@Controller()
export class LookupsController {
    constructor(private readonly callLogsService: CallLogsService) {}

    @Get('call-types')
    @UseGuards(JwtAuthGuard)
    async listCallTypes(
        @Req() _req: AuthedRequest,
    ): Promise<{ id: string; label: string }[]> {
        return this.callLogsService.listCallTypes();
    }

    @Get('apparatus-types')
    @UseGuards(JwtAuthGuard)
    async listApparatusTypes(
        @Req() _req: AuthedRequest,
    ): Promise<{ id: string; label: string }[]> {
        return this.callLogsService.listApparatusTypes();
    }
}
