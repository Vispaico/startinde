import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  requestMagicLink(@Body() body: { email: string; locale?: string }) {
    return this.authService.requestMagicLink(body.email, body.locale ?? 'en');
  }

  @Post('verify')
  verifyMagicLink(@Body() body: { token: string; email: string }) {
    return this.authService.verifyMagicLink(body.token, body.email);
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return { ok: false, error: 'No session provided.' };
    return this.authService.me(token);
  }
}
