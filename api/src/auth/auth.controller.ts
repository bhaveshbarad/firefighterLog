import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type AuthedRequest = {
    user: { id: string; email: string };
};

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(
        @Body() dto: RegisterDto,
    ): Promise<{ access_token: string; user: { id: string; email: string } }> {
        return this.authService.register(dto);
    }

    @Post('login')
    login(
        @Body() dto: LoginDto,
    ): Promise<{ access_token: string; user: { id: string; email: string } }> {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: AuthedRequest): { id: string; email: string } {
        return { id: req.user.id, email: req.user.email };
    }
}
