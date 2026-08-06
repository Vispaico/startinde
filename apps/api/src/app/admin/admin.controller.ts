import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { verifySessionToken, loadAuthConfig, type SessionUser } from '@startinde/auth';
import { AdminService, type ReviewDecision } from './admin.service';

const ALLOWED_ROLES = ['staff', 'expert', 'admin'];

@Controller('admin')
export class AdminController {
  private readonly config = loadAuthConfig();
  constructor(private readonly adminService: AdminService) {}

  /** Extract session from Bearer header and enforce staff/expert/admin role. */
  private async requireRole(authorization?: string): Promise<SessionUser> {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new ForbiddenException('No session provided.');
    let user: SessionUser;
    try {
      user = await verifySessionToken(token, this.config);
    } catch {
      throw new ForbiddenException('Invalid session.');
    }
    if (!ALLOWED_ROLES.includes(user.role)) {
      throw new ForbiddenException('Admin access required.');
    }
    return user;
  }

  @Get('changes')
  @HttpCode(HttpStatus.OK)
  async listChanges(
    @Headers('authorization') authorization?: string,
    @Query('status') status?: string,
  ) {
    await this.requireRole(authorization);
    return this.adminService.listChanges(status);
  }

  @Get('changes/:id')
  @HttpCode(HttpStatus.OK)
  async getChange(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    await this.requireRole(authorization);
    const change = await this.adminService.getChange(id);
    if (!change) return { ok: false, error: 'Change not found.' };
    return { ok: true, change };
  }

  @Post('changes/:id/decision')
  @HttpCode(HttpStatus.OK)
  async decide(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: { decision: ReviewDecision; comment?: string; editedUpdate?: string },
  ) {
    const user = await this.requireRole(authorization);
    return this.adminService.decide(id, body.decision, {
      comment: body.comment,
      editedUpdate: body.editedUpdate,
      reviewerId: user.id,
    });
  }

  @Post('changes/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    await this.requireRole(authorization);
    return this.adminService.publish(id);
  }
}
