import {
    Body,
    Controller,
    Get,
    Header,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type {
    CallLogListItem,
    CallLogListResponse,
} from './call-logs.service';
import { CallLogsService } from './call-logs.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { ListCallLogsQueryDto } from './dto/list-call-logs.query.dto';

type AuthedRequest = {
    user: { id: string; email: string };
};

@Controller('call-logs')
@UseGuards(JwtAuthGuard)
export class CallLogsController {
    constructor(private readonly callLogsService: CallLogsService) {}

    @Get('stats')
    async stats(
        @Req() req: AuthedRequest,
    ): Promise<{ total: number }> {
        const total = await this.callLogsService.countForUser(req.user.id);
        return { total };
    }

    @Get('export')
    @Header('Content-Type', 'text/csv; charset=utf-8')
    @Header(
        'Content-Disposition',
        'attachment; filename="call-logs.csv"',
    )
    async exportCsv(
        @Req() req: AuthedRequest,
        @Query() query: ListCallLogsQueryDto,
    ): Promise<string> {
        const csv = await this.callLogsService.exportCsvForUser(
            req.user.id,
            query,
        );
        return `\uFEFF${csv}`;
    }

    @Get()
    async list(
        @Req() req: AuthedRequest,
        @Query() query: ListCallLogsQueryDto,
    ): Promise<CallLogListResponse> {
        return this.callLogsService.listForUser(req.user.id, query);
    }

    @Get(':id')
    async getOne(
        @Req() req: AuthedRequest,
        @Param('id') id: string,
    ): Promise<CallLogListItem> {
        return this.callLogsService.findOneForUser(req.user.id, id);
    }

    @Post()
    async create(
        @Req() req: AuthedRequest,
        @Body() dto: CreateCallLogDto,
    ): Promise<ReturnType<CallLogsService['create']>> {
        return this.callLogsService.create(req.user.id, dto);
    }
}
