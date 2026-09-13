import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('orders/:orderId/initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@CurrentUser() user: User, @Param('orderId') orderId: string) {
    return this.payments.initiate(user.id, orderId, user.phone);
  }

  @Post('sep/callback')
  async sepCallback(@Body() body: Record<string, string>, @Res() res: Response) {
    const result = await this.payments.handleCallback(body);
    if (result.redirectTo) {
      return res.redirect(303, result.redirectTo);
    }
    return res.status(result.ok ? 200 : 400).json(result);
  }
}
