import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ApparatusType } from '../entities/apparatus-type.entity';
import { CallLog } from '../entities/call-log.entity';
import { CallType } from '../entities/call-type.entity';
import { CallLogsController } from './call-logs.controller';
import { CallLogsService } from './call-logs.service';
import { LookupsController } from './lookups.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([CallLog, CallType, ApparatusType]),
        AuthModule,
    ],
    controllers: [CallLogsController, LookupsController],
    providers:   [CallLogsService],
})
export class CallLogsModule {}
