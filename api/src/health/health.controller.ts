import { Controller, Get } from '@nestjs/common';

/**
 * Liveness endpoint for orchestration and client smoke tests.
 */
@Controller()
export class HealthController {
    @Get('health')
    health(): { status: string; service: string; time: string } {
        return {
            status: 'ok',
            service: 'firefighter-log-api',
            time: new Date().toISOString(),
        };
    }
}
